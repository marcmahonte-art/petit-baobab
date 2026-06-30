import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"
import { setAuthCookies } from "@/lib/auth"

export async function POST(request: Request) {
  try {
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

    // 2. Fetch the linked accounts record
    let { data: account, error: accError } = await supabase
      .from("accounts")
      .select("*")
      .eq("user_id", user.id)
      .single()

    // Fallback: If account does not exist, create it (e.g. if the user was created before this system was active)
    if (accError || !account) {
      console.warn("Account not found for authenticated user, creating one now.")
      const { data: newAccount, error: createAccErr } = await supabase
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
      await supabase
        .from("stars_transactions")
        .insert({
          account_id: account.id,
          amount: 5,
          reason: "signup_bonus",
        })
    }

    // 3. Fetch all child_profiles for this account
    let { data: profiles, error: profError } = await supabase
      .from("child_profiles")
      .select("*")
      .eq("account_id", account.id)

    if (profError) {
      console.error("Error fetching child profiles:", profError)
      profiles = []
    }

    // Fallback: If no child profiles, create at least one default profile
    if (!profiles || profiles.length === 0) {
      const { data: newProfile } = await supabase
        .from("child_profiles")
        .insert({
          account_id: account.id,
          name: "Mon Enfant",
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
      user: {
        id: user.id,
        email: user.email,
      },
      account: {
        id: account.id,
        stars_balance: account.stars_balance,
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
