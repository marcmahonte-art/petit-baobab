import { NextResponse } from "next/server"
import { getSupabaseSsrClient } from "@/lib/supabase-server"
import { setAuthCookies } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get("code")
    const email = searchParams.get("email")

    if (!code || !email) {
      return NextResponse.redirect(`${origin}/login?error=verification_failed`)
    }

    const supabase = await getSupabaseSsrClient()

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    })

    if (error || !data.session) {
      console.error("Verification failed:", error)
      return NextResponse.redirect(`${origin}/login?error=verification_failed`)
    }

    await setAuthCookies(data.session.access_token, data.session.refresh_token)

    return NextResponse.redirect(`${origin}/parents`)
  } catch (err: any) {
    console.error("Complete signup error:", err)
    const { origin } = new URL(request.url)
    return NextResponse.redirect(`${origin}/login?error=verification_failed`)
  }
}
