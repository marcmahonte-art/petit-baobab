import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseSsrClient } from "@/lib/supabase-server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { setAuthCookies, setRoleCookie } from "@/lib/auth";
import { logger } from "@/lib/logger";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

function getDisplayNameFromEmail(email: string): string {
  if (!email) return "Mon Enfant";
  const username = email.split("@")[0];
  return username
    .split(/[._-]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Décide de la redirection post-connexion.
 * - Compte double (famille + école)  -> /select-space (choix manuel)
 * - Compte école (ecole_pro / has_school_sub) -> /school/dashboard
 * - Sinon (famille) -> /dashboard
 */
function getRedirectPath(opts: {
  plan: string | null;
  defaultSpace: string | null;
  hasFamilySub: boolean;
  hasSchoolSub: boolean;
}): string {
  const { plan, defaultSpace, hasFamilySub, hasSchoolSub } = opts;
  if (hasFamilySub && hasSchoolSub) return "/select-space";
  if (plan === "ecole_pro" || hasSchoolSub || defaultSpace === "school") {
    return "/school/dashboard";
  }
  return "/dashboard";
}

export async function GET(request: Request) {
  try {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      const error = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");
      logger.warn("oauth-callback", "code manquant", { error, errorDescription });
      return NextResponse.redirect(
        `${origin}/login?error=code_missing&error_description=${encodeURIComponent(errorDescription || error || "unknown")}`
      );
    }

    const isSchool = searchParams.get("accountType") === "school";

    const supabase = await getSupabaseSsrClient();
    const { data: authData, error: authError } = await supabase.auth.exchangeCodeForSession(code);

    if (authError || !authData.session || !authData.user) {
      logger.error("oauth-callback", authError, { step: "exchangeCodeForSession" });
      return NextResponse.redirect(`${origin}/login?error=exchange_failed`);
    }

    const session = authData.session;
    const user = authData.user;

    const authedClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: `Bearer ${session.access_token}` } },
    });

    let plan: string | null = null;
    let defaultSpace: string | null = null;
    let hasFamilySub = false;
    let hasSchoolSub = false;

    // Vérifier si un compte existe déjà
    const { data: existingAccount, error: accReadErr } = await authedClient
      .from("accounts")
      .select("plan, default_space, has_family_sub, has_school_sub")
      .eq("user_id", user.id)
      .maybeSingle();

    if (accReadErr) {
      // Erreur de lecture : on redirige vers un espace sûr (pas de crash, pas de {}).
      logger.error("oauth-callback", accReadErr, { step: "read existing account", userId: user.id });
      await setAuthCookies(session.access_token, session.refresh_token);
      return NextResponse.redirect(`${origin}/dashboard`);
    }

    if (existingAccount) {
      plan = existingAccount.plan;
      defaultSpace = existingAccount.default_space ?? null;
      hasFamilySub = existingAccount.has_family_sub ?? plan !== "ecole_pro";
      hasSchoolSub = existingAccount.has_school_sub ?? plan === "ecole_pro";
    } else {
      // NOUVEAU utilisateur : créer les enregistrements via le client admin (contourne RLS).
      // Le trigger handle_new_user() a déjà créé profiles + accounts(plan free) + child_profiles
      // lors de l'insertion de auth.users. On promeut en école si besoin.
      const admin = getSupabaseAdmin();
      try {
        if (isSchool) {
          const { error: updErr } = await admin
            .from("accounts")
            .update({
              plan: "ecole_pro",
              default_space: "school",
              stars_balance: 1000,
              plan_renewed_at: new Date().toISOString(),
              has_school_sub: true,
            })
            .eq("user_id", user.id);
          if (updErr) {
            logger.error("oauth-callback", updErr, { step: "promote new school account", userId: user.id });
          }
          // Créer un profil enfant si le trigger n'en a pas créé (sécurité)
          const { data: existingChild } = await admin
            .from("child_profiles")
            .select("id")
            .eq("account_id", (await admin.from("accounts").select("id").eq("user_id", user.id).maybeSingle()).data?.id || "")
            .maybeSingle();
          if (!existingChild) {
            const { data: acc } = await admin.from("accounts").select("id").eq("user_id", user.id).maybeSingle();
            if (acc?.id) {
              await admin
                .from("child_profiles")
                .insert({ account_id: acc.id, name: getDisplayNameFromEmail(user.email || ""), mascot: "bobo", pin_required: false });
            }
          }
        }
      } catch (dbError) {
        logger.error("oauth-callback", dbError, { step: "create new user records" });
      }

      // Relire le compte fraîchement créé pour une redirection exacte
      const { data: created } = await admin
        .from("accounts")
        .select("plan, default_space, has_family_sub, has_school_sub")
        .eq("user_id", user.id)
        .maybeSingle();

      plan = created?.plan ?? (isSchool ? "ecole_pro" : "free");
      defaultSpace = created?.default_space ?? (isSchool ? "school" : null);
      hasFamilySub = created?.has_family_sub ?? !isSchool;
      hasSchoolSub = created?.has_school_sub ?? isSchool;
    }

    // Poser les cookies d'auth et rediriger vers le bon tableau de bord
    await setAuthCookies(session.access_token, session.refresh_token);
    await setRoleCookie(plan || "free");

    const redirectTo = getRedirectPath({ plan, defaultSpace, hasFamilySub, hasSchoolSub });
    logger.info("oauth-callback", "Redirection post-connexion", { email: user.email, plan, defaultSpace, hasFamilySub, hasSchoolSub, redirectTo });
    return NextResponse.redirect(`${origin}${redirectTo}`);
  } catch (err: any) {
    logger.error("oauth-callback", err, { step: "generic" });
    const { origin } = new URL(request.url);
    return NextResponse.redirect(`${origin}/login?error=callback_error`);
  }
}
