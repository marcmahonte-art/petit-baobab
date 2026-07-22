import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"
import { adjustStars, STARS_REASONS } from "@/lib/auth"

function getDisplayNameFromEmail(email: string): string {
  if (!email) return "Mon Enfant"
  const username = email.split("@")[0]
  return username
    .split(/[\._-]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ")
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 })
  }

  const { email, password, ageConsent, accountType, schoolName, schoolWhatsapp } = body
  const isSchool = accountType === "school"

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "Veuillez fournir une adresse e-mail valide." }, { status: 400 })
  }
  if (!password || typeof password !== "string" || password.length < 8) {
    return NextResponse.json({ error: "Le mot de passe doit comporter au moins 8 caractères." }, { status: 400 })
  }
  if (ageConsent !== true) {
    return NextResponse.json({ error: "Consentement requis." }, { status: 400 })
  }

  const admin = getSupabaseAdmin()

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { locale: "fr" },
  })

  if (authError) {
    return NextResponse.json({ error: `Auth: ${authError.message || JSON.stringify(authError)}` }, { status: 400 })
  }

  const user = authData.user
  if (!user) {
    return NextResponse.json({ error: "Impossible de créer l'utilisateur." }, { status: 500 })
  }

  let accountId = ""
  let starsBalance = isSchool ? 1000 : 5
  let plan = isSchool ? "ecole_pro" : "free"

  try {
    const { data: existingAccount } = await admin
      .from("accounts")
      .select("id, stars_balance, plan")
      .eq("user_id", user.id)
      .maybeSingle()

    if (existingAccount) {
      accountId = existingAccount.id
      starsBalance = existingAccount.stars_balance
      plan = existingAccount.plan
      if (isSchool && existingAccount.plan !== "ecole_pro") {
        await admin
          .from("accounts")
          .update({ plan: "ecole_pro", default_space: "school", stars_balance: 1000, plan_renewed_at: new Date().toISOString(), school_name: schoolName || null, school_whatsapp: schoolWhatsapp || null })
          .eq("id", existingAccount.id)
      }
    } else {
      await admin.from("profiles").insert({ id: user.id, email: user.email!, locale: "fr" }).select()
      const { data: newAccount, error: accErr } = await admin
        .from("accounts")
        .insert({ user_id: user.id, stars_balance: starsBalance, plan, default_space: isSchool ? "school" : null, plan_renewed_at: isSchool ? new Date().toISOString() : null, school_name: isSchool ? schoolName || null : null, school_whatsapp: isSchool ? schoolWhatsapp || null : null })
        .select()
        .single()
      if (accErr) {
        return NextResponse.json({ error: "Erreur création compte." }, { status: 500 })
      }
      accountId = newAccount.id
      await adjustStars(accountId, 5, STARS_REASONS.SIGNUP_BONUS, null, admin)
      if (!isSchool) {
        await admin.from("child_profiles").insert({ account_id: accountId, name: getDisplayNameFromEmail(user.email || ""), mascot: "awa", pin_required: false })
      }
    }
  } catch (dbError: any) {
    return NextResponse.json({ error: dbError?.message || "Erreur création compte." }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    user: { id: user.id, email: user.email },
    account: { id: accountId, stars_balance: starsBalance, plan },
    isSchool,
    message: isSchool
      ? "Compte École créé !"
      : "Compte créé !",
  })
}
