import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getSupabaseServer } from "@/lib/supabaseServer"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"
import { adjustStars, STARS_REASONS } from "@/lib/auth"

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
    // Note: Locale meta-data can be passed to auth metadata
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

    // Create an explicitly authenticated client if a session was returned
    const accessToken = authData.session?.access_token
    const authedClient = accessToken
      ? createClient(supabaseUrl, supabaseAnonKey, {
          auth: { persistSession: false },
          global: {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        })
      : supabase

    // 3. Sync Fallback (If the database trigger is not installed, we create these records manually)
    let accountId = ""
    let starsBalance = 5
    let plan = "free"

    try {
      // Check if trigger has already created the profile & account
      const { data: existingAccount } = await authedClient
        .from("accounts")
        .select("id, stars_balance, plan")
        .eq("user_id", user.id)
        .single()

       if (existingAccount) {
        accountId = existingAccount.id
        starsBalance = existingAccount.stars_balance
        plan = existingAccount.plan

        // Inscription enseignant : basculer le plan sur ecole_pro d'emblée
        // (nouveau compte, pas une montée en gamme). On passe par le client
        // admin (service role) car la politique RLS peut interdire à l'utilisateur
        // de modifier son propre plan. Le trigger on_plan_changed met à jour
        // has_school_sub / has_family_sub.
        if (isSchool && existingAccount.plan !== "ecole_pro") {
          const admin = getSupabaseAdmin()
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
        // Trigger didn't run, execute manually (via client admin pour
        // garantir le plan ecole_pro même si la RLS restreint l'utilisateur).
        const admin = getSupabaseAdmin()
        // Insert public profile
        await admin
          .from("profiles")
          .insert({
            id: user.id,
            email: user.email!,
            locale: "fr",
          })
          .select()

        // Insert parent account
        const { data: newAccount, error: accErr } = await admin
          .from("accounts")
          .insert({
            user_id: user.id,
            stars_balance: isSchool ? 1000 : 5,
            plan: isSchool ? "ecole_pro" : "free",
            default_space: isSchool ? "school" : null,
            plan_renewed_at: isSchool ? new Date().toISOString() : null,
            school_name: isSchool ? schoolName || null : null,
            school_whatsapp: isSchool ? schoolWhatsapp || null : null,
          })
          .select()
          .single()

        if (accErr) throw accErr
        accountId = newAccount.id
        if (isSchool) {
          starsBalance = 1000
          plan = "ecole_pro"
        }

        // Insert stars transaction
        await adjustStars(accountId, 5, STARS_REASONS.SIGNUP_BONUS, null, admin)

        // Insert first child profile
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
    } catch (dbError) {
      console.warn("Trigger failed or was missing, manual inserts executed. Details:", dbError)
    }

    const successMessage = isSchool
      ? "Compte École / Pro créé ! Votre espace enseignant est prêt et 1000 étoiles vous sont créditées pour démarrer. Un e-mail de confirmation vous a été envoyé."
      : "Compte créé ! 5 étoiles offertes pour commencer à créer. Un e-mail de confirmation vous a été envoyé."

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
      },
      account: {
        id: accountId,
        stars_balance: starsBalance,
        plan: plan,
      },
      isSchool,
      message: successMessage,
    })
  } catch (err: any) {
    console.error("Signup error:", err)
    return NextResponse.json(
      { error: err.message || "Une erreur interne est survenue lors de l'inscription." },
      { status: 500 }
    )
  }
}
