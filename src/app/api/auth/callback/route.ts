import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getSupabaseSsrClient } from "@/lib/supabase-server"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"
import { setAuthCookies, setRoleCookie, adjustStars, STARS_REASONS } from "@/lib/auth"

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

function getRedirectPath(plan: string, defaultSpace: string | null): string {
  if (plan === "ecole_pro") return "/school/dashboard"
  return defaultSpace === "school" ? "/school/dashboard" : "/parents"
}

export async function GET(request: Request) {
  try {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get("code")

    if (!code) {
      const error = searchParams.get("error")
      const errorDescription = searchParams.get("error_description")
      console.error("OAuth callback: code is missing", { error, errorDescription })
      return NextResponse.redirect(
        `${origin}/login?error=code_missing&error_description=${encodeURIComponent(errorDescription || error || "unknown")}`
      )
    }

    const isSchool = searchParams.get("accountType") === "school"

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

    let plan = "free"
    let defaultSpace: string | null = null

    // Check if user already has an account
    const { data: existingAccount } = await authedClient
      .from("accounts")
      .select("plan, default_space")
      .eq("user_id", user.id)
      .maybeSingle()

    if (existingAccount) {
      plan = existingAccount.plan
      defaultSpace = existingAccount.default_space
    } else {
      // NEW USER: create records via admin client (bypasses RLS)
      const admin = getSupabaseAdmin()
      plan = isSchool ? "ecole_pro" : "free"
      defaultSpace = isSchool ? "school" : null

      try {
        await admin
          .from("profiles")
          .insert({ id: user.id, email: user.email ?? null, locale: "fr" })
          .select()
          .maybeSingle()

        const { data: newAccount, error: createAccErr } = await admin
          .from("accounts")
          .insert({
            user_id: user.id,
            stars_balance: isSchool ? 1000 : 5,
            plan,
            default_space: defaultSpace,
          })
          .select()
          .single()

        if (createAccErr || !newAccount) {
          throw createAccErr || new Error("Failed to create account")
        }

        await adjustStars(newAccount.id, 5, STARS_REASONS.SIGNUP_BONUS, null, admin)

        if (!isSchool) {
          const cleanName = getDisplayNameFromEmail(user.email || "")
          await admin
            .from("child_profiles")
            .insert({ account_id: newAccount.id, name: cleanName, mascot: "awa", pin_required: false })
        }
      } catch (dbError) {
        console.error("Failed to create new user records:", dbError)
      }
    }

    // Set auth cookies and redirect to the correct dashboard
    await setAuthCookies(session.access_token, session.refresh_token)
    await setRoleCookie(plan)

    const redirectTo = getRedirectPath(plan, defaultSpace)
    return NextResponse.redirect(`${origin}${redirectTo}`)
  } catch (err: any) {
    console.error("OAuth callback generic error:", err)
    const { origin } = new URL(request.url)
    return NextResponse.redirect(`${origin}/login?error=callback_error`)
  }
}
