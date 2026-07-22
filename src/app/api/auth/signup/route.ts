import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 })
  }

  const { email, password, ageConsent } = body

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Email invalide." }, { status: 400 })
  }
  if (!password || password.length < 8) {
    return NextResponse.json({ error: "Mot de passe trop court." }, { status: 400 })
  }
  if (ageConsent !== true) {
    return NextResponse.json({ error: "Consentement requis." }, { status: 400 })
  }

  console.error("SIGNUP_DEBUG starting...")

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  console.error("SIGNUP_DEBUG calling signUp...")
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { locale: "fr" } },
  })

  console.error("SIGNUP_DEBUG returned", JSON.stringify({ hasData: !!authData, hasError: !!authError, hasUser: !!authData?.user }))

  if (authError) {
    let errProps: string[] = []
    try { errProps = Object.getOwnPropertyNames(authError) } catch (e) {}
    let errStr = "{}"
    try { errStr = JSON.stringify(authError) } catch (e) { errStr = String(authError) }
    console.error("SIGNUP_AUTH_ERROR", JSON.stringify({ props: errProps, message: (authError as any).message, status: (authError as any).status, name: (authError as any).name, full: errStr }))
    return NextResponse.json({ error: authError.message }, { status: 400 })
  }

  if (!authData?.user) {
    return NextResponse.json({ error: "Échec création utilisateur." }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    user: { id: authData.user.id, email: authData.user.email },
    message: "Compte créé ! Un e-mail de confirmation vous a été envoyé.",
  })
}
