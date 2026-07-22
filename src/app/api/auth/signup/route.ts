import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { adjustStars, STARS_REASONS } from "@/lib/auth";
import { logger } from "@/lib/logger";

function getDisplayNameFromEmail(email: string): string {
  if (!email) return "Mon Enfant";
  const username = email.split("@")[0];
  return username
    .split(/[._-]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      logger.warn("signup", "Corps de requête invalide (JSON illisible)");
      return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
    }

    const { email, password, ageConsent, accountType, schoolName, schoolWhatsapp } = body;
    const isSchool = accountType === "school";

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Veuillez fournir une adresse e-mail valide." }, { status: 400 });
    }
    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json({ error: "Le mot de passe doit comporter au moins 8 caractères." }, { status: 400 });
    }
    if (ageConsent !== true) {
      return NextResponse.json({ error: "Consentement requis." }, { status: 400 });
    }

    const admin = getSupabaseAdmin();

    let authData: any;
    let authError: any;
    try {
      const res = await admin.auth.admin.createUser({
        email,
        password,
        // Pas de email_confirm: true → l'utilisateur reçoit un e-mail de
        // confirmation Supabase (envoyé via le SMTP Resend configuré). Il doit
        // cliquer le lien avant de pouvoir se connecter.
        user_metadata: { locale: "fr" },
      });
      authData = res.data;
      authError = res.error;
    } catch (e) {
      // createUser peut throw (réseau, clé invalide) au lieu de renvoyer {error}
      logger.error("signup", e, { step: "admin.createUser", email });
      return NextResponse.json(
        { error: "Erreur de création du compte (service d'authentification indisponible)." },
        { status: 500 }
      );
    }

    if (authError) {
      logger.warn("signup", `Auth error: ${authError.message || JSON.stringify(authError)}`, { email });
      return NextResponse.json(
        { error: `Auth: ${authError.message || JSON.stringify(authError)}` },
        { status: 400 }
      );
    }

    const user = authData?.user;
    if (!user) {
      logger.error("signup", "authData.user manquant après createUser", { email });
      return NextResponse.json({ error: "Impossible de créer l'utilisateur." }, { status: 500 });
    }

    let accountId = "";
    let starsBalance = isSchool ? 1000 : 5;
    let plan = isSchool ? "ecole_pro" : "free";
    let defaultSpace: string | null = isSchool ? "school" : null;

    try {
      const { data: existingAccount } = await admin
        .from("accounts")
        .select("id, stars_balance, plan, default_space")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingAccount) {
        accountId = existingAccount.id;
        starsBalance = existingAccount.stars_balance;
        plan = existingAccount.plan;
        defaultSpace = existingAccount.default_space ?? null;
        if (isSchool && existingAccount.plan !== "ecole_pro") {
          const { error: updErr } = await admin
            .from("accounts")
            .update({
              plan: "ecole_pro",
              default_space: "school",
              stars_balance: 1000,
              plan_renewed_at: new Date().toISOString(),
              school_name: schoolName || null,
              school_whatsapp: schoolWhatsapp || null,
            })
            .eq("id", existingAccount.id);
          if (!updErr) {
            plan = "ecole_pro";
            starsBalance = 1000;
            defaultSpace = "school";
          } else {
            logger.error("signup", updErr, { step: "update existing school account", id: existingAccount.id });
          }
        }
      } else {
        // Le trigger handle_new_user() a déjà créé profiles + accounts + child_profiles
        // (plan 'free', 5 étoiles) à l'insertion de auth.users. On lit le compte
        // fraîchement créé pour renvoyer les valeurs RÉELLES (et basculer en école si besoin).
        const { data: newAccount, error: accErr } = await admin
          .from("accounts")
          .select("id, stars_balance, plan, default_space")
          .eq("user_id", user.id)
          .maybeSingle();

        if (accErr || !newAccount) {
          logger.error("signup", accErr || new Error("compte introuvable après création"), { step: "read new account", userId: user.id });
          return NextResponse.json({ error: "Erreur création compte." }, { status: 500 });
        }

        accountId = newAccount.id;

        if (isSchool) {
          const { error: updErr } = await admin
            .from("accounts")
            .update({
              plan: "ecole_pro",
              default_space: "school",
              stars_balance: 1000,
              plan_renewed_at: new Date().toISOString(),
              school_name: schoolName || null,
              school_whatsapp: schoolWhatsapp || null,
            })
            .eq("id", newAccount.id);
          if (updErr) {
            logger.error("signup", updErr, { step: "promote to school", id: newAccount.id });
          }
          // On relit pour renvoyer les valeurs à jour
          const { data: refreshed } = await admin
            .from("accounts")
            .select("stars_balance, plan, default_space")
            .eq("id", newAccount.id)
            .maybeSingle();
          starsBalance = refreshed?.stars_balance ?? 1000;
          plan = refreshed?.plan ?? "ecole_pro";
          defaultSpace = refreshed?.default_space ?? "school";
        } else {
          starsBalance = newAccount.stars_balance ?? 5;
          plan = newAccount.plan ?? "free";
          defaultSpace = newAccount.default_space ?? null;
        }
      }
    } catch (dbError: any) {
      logger.error("signup", dbError, { step: "db operations", userId: user.id });
      return NextResponse.json(
        { error: dbError?.message || "Erreur création compte." },
        { status: 500 }
      );
    }

    logger.info("signup", "Compte créé avec succès", { email, isSchool, plan, defaultSpace });

    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email },
      account: { id: accountId, stars_balance: starsBalance, plan, default_space: defaultSpace },
      isSchool,
      message: isSchool ? "Compte École créé !" : "Compte créé !",
    });
  } catch (err: any) {
    // Filet de sécurité : on ne renvoie JAMAIS un corps vide {}.
    logger.error("signup", err, { step: "unhandled" });
    return NextResponse.json(
      { error: err?.message || "Une erreur inattendue est survenue lors de l'inscription." },
      { status: 500 }
    );
  }
}
