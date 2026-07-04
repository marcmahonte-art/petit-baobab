import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getSupabaseServer } from "@/lib/supabaseServer"
import { setAuthCookies, adjustStars } from "@/lib/auth"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

function getDisplayNameFromEmail(email: string): string {
  if (!email) return "Mon Enfant"
  const username = email.split("@")[0]
  return username
    .split(/[\._-]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ")
}

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServer()
    const body = await request.json().catch(() => null)
    if (!body) {
      return NextResponse.json(
        { error: "Corps de requête invalide." },
        { status: 400 }
      )
    }

    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Veuillez fournir un e-mail et un mot de passe." },
        { status: 400 }
      )
    }

    // 1. Authenticate using Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: authError.status || 400 }
      )
    }

    const session = authData.session
    const user = authData.user

    if (!session || !user) {
      return NextResponse.json(
        { error: "Session d'authentification invalide." },
        { status: 500 }
      )
    }

    // Create an explicitly authenticated client for subsequent DB operations
    const authedClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
      global: {
        headers: { Authorization: `Bearer ${session.access_token}` },
      },
    })

    // 2. Fetch the linked accounts record
    let { data: account, error: accError } = await authedClient
      .from("accounts")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()

    // Fallback: If account does not exist, create it (e.g. if the user was created before this system was active)
    if (accError || !account) {
      console.warn("Account not found for authenticated user, creating one now.")
      const { data: newAccount, error: createAccErr } = await authedClient
        .from("accounts")
        .insert({
          user_id: user.id,
          stars_balance: 5,
          plan: "free",
        })
        .select()
        .single()

      if (createAccErr) {
        return NextResponse.json(
          { error: "Impossible d'associer un portefeuille d'étoiles au compte." },
          { status: 500 }
        )
      }
      account = newAccount

      // Add stars_transaction record
      await authedClient
        .from("stars_transactions")
        .insert({
          account_id: account.id,
          amount: 5,
          reason: "signup_bonus",
        })
    }

    let starsBalance = account.stars_balance || 0

    // Automatic rolling 24-hour top up back to 5 stars for Free plans
    if (account.plan === "free" && starsBalance < 5) {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      
      const { data: recentResets, error: resetErr } = await authedClient
        .from("stars_transactions")
        .select("created_at")
        .eq("account_id", account.id)
        .in("reason", ["signup_bonus", "daily_reset"])
        .gte("created_at", twentyFourHoursAgo)
        .limit(1)

      if (!resetErr && (!recentResets || recentResets.length === 0)) {
        const topupAmount = 5 - starsBalance
        const { success, newBalance } = await adjustStars(account.id, topupAmount, "daily_reset", null, authedClient)
        if (success && newBalance !== undefined) {
          starsBalance = newBalance
        }
      }
    }

    // 3. Fetch all child_profiles for this account
    let { data: profiles, error: profError } = await authedClient
      .from("child_profiles")
      .select("*")
      .eq("account_id", account.id)

    if (profError) {
      console.error("Error fetching child profiles:", profError)
      profiles = []
    }

    // Dynamic fix: If an existing profile is named "Mon Enfant", rename it to the email-derived name
    if (profiles && profiles.length > 0) {
      const emailDisplayName = getDisplayNameFromEmail(email)
      for (const p of profiles) {
        if (p.name === "Mon Enfant") {
          const { error: renameErr } = await authedClient
            .from("child_profiles")
            .update({ name: emailDisplayName })
            .eq("id", p.id)
          if (!renameErr) {
            p.name = emailDisplayName
          }
        }
      }
    }

    // Fallback: If no child profiles, create at least one default profile
    if (!profiles || profiles.length === 0) {
      const cleanName = getDisplayNameFromEmail(email)

      const { data: newProfile } = await authedClient
        .from("child_profiles")
        .insert({
          account_id: account.id,
          name: cleanName || "Mon Enfant",
          mascot: "awa",
          pin_required: false,
        })
        .select()
      
      profiles = newProfile ? [newProfile] : []
    }

    // 4. Store session tokens in secure httpOnly cookies
    await setAuthCookies(session.access_token, session.refresh_token)

    // 5. Return success payload
    return NextResponse.json({
      success: true,
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      user: {
        id: user.id,
        email: user.email,
      },
      account: {
        id: account.id,
        stars_balance: starsBalance,
        plan: account.plan,
      },
      profiles: profiles.map((p) => ({
        id: p.id,
        name: p.name,
        mascot: p.mascot,
        pin_required: p.pin_required,
      })),
    })
  } catch (err: any) {
    console.error("Login API route error:", err)
    return NextResponse.json(
      { error: err.message || "Une erreur interne est survenue lors de la connexion." },
      { status: 500 }
    )
  }
}
