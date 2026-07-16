import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { setAuthCookies } from "@/lib/auth"

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

export async function GET(request: Request) {
  try {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get("code")
    const next = searchParams.get("next") || "/parents"

    if (!code) {
      console.error("OAuth callback: code is missing")
      return NextResponse.redirect(`${origin}/login?error=code_missing`)
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    })

    const { data: authData, error: authError } = await supabase.auth.exchangeCodeForSession(code)

    if (authError || !authData.session || !authData.user) {
      console.error("OAuth callback: exchange failed:", authError)
      return NextResponse.redirect(`${origin}/login?error=exchange_failed`)
    }

    const session = authData.session
    const user = authData.user

    // Explicitly authenticated client for subsequent DB operations
    const authedClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
      global: {
        headers: { Authorization: `Bearer ${session.access_token}` },
      },
    })

    // Fallback sync: Check/create account & default child profile, just in case the trigger didn't run.
    let accountId = ""
    try {
      let { data: account, error: accError } = await authedClient
        .from("accounts")
        .select("id, stars_balance, plan")
        .eq("user_id", user.id)
        .maybeSingle()

      if (accError || !account) {
        console.warn("Account not found for authenticated user in callback, creating one manually.")
        // Ensure profile exists first
        await authedClient
          .from("profiles")
          .insert({
            id: user.id,
            email: user.email ?? null,
            locale: "fr",
          })
          .select()
          .maybeSingle()

        // Create the parent account
        const { data: newAccount, error: createAccErr } = await authedClient
          .from("accounts")
          .insert({
            user_id: user.id,
            stars_balance: 5,
            plan: "free",
          })
          .select()
          .single()

        if (createAccErr || !newAccount) {
          throw createAccErr || new Error("Failed to create parent account")
        }
        account = newAccount

        // Log transaction
        await authedClient
          .from("stars_transactions")
          .insert({
            account_id: newAccount.id,
            amount: 5,
            reason: "signup_bonus",
          })
      }

      if (!account) {
        throw new Error("Parent account not resolved.")
      }
      accountId = account.id

      // Check child profiles
      let { data: profiles, error: profError } = await authedClient
        .from("child_profiles")
        .select("id")
        .eq("account_id", accountId)

      if (profError || !profiles || profiles.length === 0) {
        const cleanName = getDisplayNameFromEmail(user.email || "")
        await authedClient
          .from("child_profiles")
          .insert({
            account_id: accountId,
            name: cleanName,
            mascot: "awa",
            pin_required: false,
          })
      }
    } catch (dbError) {
      console.warn("Database fallback in OAuth callback had an error:", dbError)
    }

    // Set HTTP-only cookies
    await setAuthCookies(session.access_token, session.refresh_token)

    // Redirect to next target page
    return NextResponse.redirect(`${origin}${next}`)
  } catch (err: any) {
    console.error("OAuth callback generic error:", err)
    const { origin } = new URL(request.url)
    return NextResponse.redirect(`${origin}/login?error=callback_error`)
  }
}
