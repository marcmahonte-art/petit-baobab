import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabaseServer"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"
import { setAuthCookies, setRoleCookie, adjustStars, STARS_REASONS } from "@/lib/auth"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

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

    const { email, password, ageConsent, accountType, schoolName, schoolWhatsapp } = body
    const isSchool = accountType === "school"

    // 1. Validation of fields
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Veuillez fournir une adresse e-mail valide." },
        { status: 400 }
      )
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { error: "Le mot de passe doit comporter au moins 8 caractères." },
        { status: 400 }
      )
    }

    if (ageConsent !== true) {
      return NextResponse.json(
        { error: "Vous devez cocher la case certifiant que vous êtes majeur(e) pour créer ce compte." },
        { status: 400 }
      )
    }

    // 2. Sign up with Supabase Auth
    console.error("[SIGNUP_DEBUG] ENV CHECK:", JSON.stringify({
      hasUrl: !!supabaseUrl,
      hasAnonKey: !!supabaseAnonKey,
      hasServiceKey: !!serviceRoleKey,
      urlPrefix: supabaseUrl?.substring(0, 20),
    }))
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          locale: "fr",
        },
      },
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: authError.status || 400 }
      )
    }

    const user = authData.user
    if (!user) {
      return NextResponse.json(
        { error: "Impossible de créer l'utilisateur." },
        { status: 500 }
      )
    }

    // 3. Create account records via admin client (bypasses RLS, works even when email confirmation is pending)
    const admin = getSupabaseAdmin()
    let accountId = ""
    let starsBalance = isSchool ? 1000 : 5
    let plan = isSchool ? "ecole_pro" : "free"

    try {
      // Check if trigger already created the account
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
          const { data: updated, error: updErr } = await admin
            .from("accounts")
            .update({
              plan: "ecole_pro",
              default_space: "school",
              stars_balance: 1000,
              plan_renewed_at: new Date().toISOString(),
              school_name: schoolName || null,
              school_whatsapp: schoolWhatsapp || null,
            })
            .eq("id", existingAccount.id)
            .select("plan, stars_balance")
            .single()
          if (updErr) {
            console.error("Failed to set ecole_pro plan:", updErr)
          } else if (updated) {
            plan = updated.plan
            starsBalance = updated.stars_balance
          }
        }
      } else {
        // Create profile
        await admin
          .from("profiles")
          .insert({ id: user.id, email: user.email!, locale: "fr" })
          .select()

        // Create account
        const { data: newAccount, error: accErr } = await admin
          .from("accounts")
          .insert({
            user_id: user.id,
            stars_balance: starsBalance,
            plan: plan,
            default_space: isSchool ? "school" : null,
            plan_renewed_at: isSchool ? new Date().toISOString() : null,
            school_name: isSchool ? schoolName || null : null,
            school_whatsapp: isSchool ? schoolWhatsapp || null : null,
          })
          .select()
          .single()

        if (accErr) throw accErr
        accountId = newAccount.id

        // Stars transaction
        await adjustStars(accountId, 5, STARS_REASONS.SIGNUP_BONUS, null, admin)

        // Default child profile (family only)
        if (!isSchool) {
          const emailName = getDisplayNameFromEmail(user.email || "")
          await admin
            .from("child_profiles")
            .insert({
              account_id: accountId,
              name: emailName,
              mascot: "awa",
              pin_required: false,
            })
        }
      }
    } catch (dbError) {
      console.error("Failed to sync account records:", dbError)
      return NextResponse.json(
        { error: "Erreur lors de la création du compte. Veuillez réessayer." },
        { status: 500 }
      )
    }

    // 4. Set auth cookies if session was returned
    if (authData.session) {
      await setAuthCookies(authData.session.access_token, authData.session.refresh_token)
      await setRoleCookie(plan)
    }

    const successMessage = isSchool
      ? "Compte École / Pro créé ! Votre espace enseignant est prêt et 1000 étoiles vous sont créditées pour démarrer. Un e-mail de confirmation vous a été envoyé."
      : "Compte créé ! 5 étoiles offertes pour commencer à créer. Un e-mail de confirmation vous a été envoyé."

    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email },
      account: { id: accountId, stars_balance: starsBalance, plan },
      isSchool,
      message: successMessage,
    })
  } catch (err: any) {
    const errInfo = typeof err === "object" && err !== null
      ? Object.getOwnPropertyNames(err).reduce((acc: any, k) => {
          try { acc[k] = String(err[k]) } catch (e) { acc[k] = "<unstringifiable>" }
          return acc
        }, {})
      : { raw: String(err) }
    console.error("[SIGNUP_DEBUG] Catch error keys:", JSON.stringify(errInfo))
    return NextResponse.json(
      { error: JSON.stringify(errInfo) },
      { status: 500 }
    )
  }
}
