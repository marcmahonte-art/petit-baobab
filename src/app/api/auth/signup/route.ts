import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"
import { adjustStars, STARS_REASONS } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    if (!body) {
      return NextResponse.json(
        { error: "Corps de requête invalide." },
        { status: 400 }
      )
    }

    const { email, password, ageConsent } = body

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

    // 3. Sync Fallback (If the database trigger is not installed, we create these records manually)
    let accountId = ""
    let starsBalance = 5
    let plan = "free"

    try {
      // Check if trigger has already created the profile & account
      const { data: existingAccount } = await supabase
        .from("accounts")
        .select("id, stars_balance, plan")
        .eq("user_id", user.id)
        .single()

      if (existingAccount) {
        accountId = existingAccount.id
        starsBalance = existingAccount.stars_balance
        plan = existingAccount.plan
      } else {
        // Trigger didn't run, execute manually
        // Insert public profile
        await supabase
          .from("profiles")
          .insert({
            id: user.id,
            email: user.email!,
            locale: "fr",
          })
          .select()

        // Insert parent account
        const { data: newAccount, error: accErr } = await supabase
          .from("accounts")
          .insert({
            user_id: user.id,
            stars_balance: 5,
            plan: "free",
          })
          .select()
          .single()

        if (accErr) throw accErr
        accountId = newAccount.id

        // Insert stars transaction
        await adjustStars(accountId, 5, STARS_REASONS.SIGNUP_BONUS)

        // Insert first child profile
        await supabase
          .from("child_profiles")
          .insert({
            account_id: accountId,
            name: "Mon Enfant",
            mascot: "awa",
            pin_required: false,
          })
      }
    } catch (dbError) {
      console.warn("Trigger failed or was missing, manual inserts executed. Details:", dbError)
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
      },
      account: {
        stars_balance: starsBalance,
        plan: plan,
      },
      message: "Compte créé ! 5 étoiles offertes pour commencer à créer. Un e-mail de confirmation vous a été envoyé.",
    })
  } catch (err: any) {
    console.error("Signup error:", err)
    return NextResponse.json(
      { error: err.message || "Une erreur interne est survenue lors de l'inscription." },
      { status: 500 }
    )
  }
}
