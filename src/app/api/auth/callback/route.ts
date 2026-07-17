import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getSupabaseSsrClient } from "@/lib/supabase-server"
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
      const error = searchParams.get("error")
      const errorDescription = searchParams.get("error_description")
      console.error("OAuth callback: code is missing", { error, errorDescription })
      return NextResponse.redirect(
        `${origin}/login?error=code_missing&error_description=${encodeURIComponent(errorDescription || error || "unknown")}`
      )
    }

    const supabase = await getSupabaseSsrClient()
    const { data: authData, error: authError } = await supabase.auth.exchangeCodeForSession(code)

    if (authError || !authData.session || !authData.user) {
      console.error("OAuth callback: exchange failed:", authError)
      return NextResponse.redirect(`${origin}/login?error=exchange_failed`)
    }

    const session = authData.session
    const user = authData.user

    const authedClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: `Bearer ${session.access_token}` } },
    })

    // Check if user already has a profile (existing user)
    const { data: existingProfile } = await authedClient
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle()

    // Check if account exists
    const { data: existingAccount } = await authedClient
      .from("accounts")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle()

    if (existingProfile && existingAccount) {
      // === EXISTING USER: proceed normally ===
      await setAuthCookies(session.access_token, session.refresh_token)

      // === REDIRECTION PAR RÔLE (Phase 4) ===
      // Respecter le choix mémorisé par l'utilisateur (persisté côté serveur).
      let redirectTo = next

      try {
        const { data: account } = await authedClient
          .from("accounts")
          .select("plan, has_family_sub, has_school_sub, default_space")
          .eq("user_id", user.id)
          .single()

        if (account) {
          const isSchool = account.has_school_sub === true
          const isFamily = account.has_family_sub === true

          // Choix mémorisé côté serveur (colonne accounts.default_space),
          // persistant (contrairement au localStorage illisible ici).
          const remembered = account.default_space

          if (isSchool && isFamily) {
            // Les deux → écran de choix (ou choix mémorisé)
            redirectTo = remembered === "school"
              ? "/school/dashboard"
              : remembered === "family"
                ? "/dashboard"
                : "/select-space"
          } else if (isSchool) {
            redirectTo = "/school/dashboard"
          } else {
            redirectTo = "/dashboard"
          }
        }
      } catch (roleErr) {
        // En cas d'erreur, on garde la redirection par défaut (safe)
        console.error("Role redirect lookup failed:", roleErr)
      }

      return NextResponse.redirect(`${origin}${redirectTo}`)
    }

    // === NEW USER: create account, send verification email ===
    try {
      // Create profile
      await authedClient
        .from("profiles")
        .insert({ id: user.id, email: user.email ?? null, locale: "fr" })
        .select()
        .maybeSingle()

      // Create account
      const { data: newAccount, error: createAccErr } = await authedClient
        .from("accounts")
        .insert({ user_id: user.id, stars_balance: 5, plan: "free" })
        .select()
        .single()

      if (createAccErr || !newAccount) {
        throw createAccErr || new Error("Failed to create parent account")
      }

      // Stars bonus
      await authedClient
        .from("stars_transactions")
        .insert({ account_id: newAccount.id, amount: 5, reason: "signup_bonus" })

      // Child profile
      const cleanName = getDisplayNameFromEmail(user.email || "")
      await authedClient
        .from("child_profiles")
        .insert({ account_id: newAccount.id, name: cleanName, mascot: "awa", pin_required: false })
    } catch (dbError) {
      console.warn("Database fallback in OAuth callback had an error:", dbError)
    }

    // Sign out of the SSR session (we don't want to set cookies yet)
    await supabase.auth.signOut()

    // Send a magic link to the user's email for verification
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: user.email!,
      options: {
        emailRedirectTo: `${origin}/api/auth/complete-signup`,
      },
    })

    if (otpError) {
      console.error("Failed to send verification email:", otpError)
    }

    // Redirect to check-email page
    const checkEmailUrl = new URL(`${origin}/auth/check-email`)
    checkEmailUrl.searchParams.set("email", user.email || "")
    return NextResponse.redirect(checkEmailUrl.toString())
  } catch (err: any) {
    console.error("OAuth callback generic error:", err)
    const { origin } = new URL(request.url)
    return NextResponse.redirect(`${origin}/login?error=callback_error`)
  }
}
