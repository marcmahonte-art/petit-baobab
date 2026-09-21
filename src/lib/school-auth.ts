// ============================================================
// Petit Baobab — Helper d'Authentification Enseignant (Phase 4)
// ============================================================

import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth";
import { getSupabaseServer } from "@/lib/supabaseServer";

/**
 * Garde pour les PAGES de l'espace enseignant (Server Components / layouts).
 *
 * Différence avec `getTeacherSession()` : celui-ci renvoie une `NextResponse`
 * (utile dans une route API), alors qu'une page doit REDIRIGER. Cette variante
 * applique donc les mêmes règles mais sous forme de redirection :
 *   - visiteur non connecté        → /login?space=school
 *   - connecté mais pas ecole_pro  → /parents
 *     (comportement identique à /school/dashboard et /school/parametres)
 *
 * Pourquoi c'est nécessaire alors que le proxy garde déjà /school/* : le proxy
 * ne teste que la PRÉSENCE du cookie `sb-access-token`, sans vérifier sa
 * signature ni son expiration. Un cookie forgé (ou simplement expiré) passait
 * donc la garde et affichait une coquille de page vide au lieu de renvoyer
 * l'utilisateur vers la connexion. Les données, elles, restaient protégées par
 * les routes /api/school/* — d'où l'absence de fuite, mais une UX cassée.
 *
 * À utiliser dans chaque page/layout de l'espace enseignant.
 */
export async function requireTeacherPage() {
  const { user, account } = await getTeacherSession();

  if (!user) redirect("/login?space=school");
  if (!account || account.plan !== "ecole_pro") redirect("/parents");

  return { user, account };
}

export async function getTeacherSession() {
  const user = await getServerUser();
  if (!user) {
    return {
      errorResponse: NextResponse.json(
        { error: "unauthorized", message: "Veuillez vous connecter pour effectuer cette action." },
        { status: 401 }
      ),
      user: null,
      account: null,
      supabase: null,
    };
  }

  const supabase = await getSupabaseServer();
  const { data: account, error: accErr } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (accErr || !account) {
    return {
      errorResponse: NextResponse.json(
        { error: "no_account", message: "Compte parent/enseignant introuvable." },
        { status: 404 }
      ),
      user,
      account: null,
      supabase: null,
    };
  }

  if (account.plan !== "ecole_pro") {
    return {
      errorResponse: NextResponse.json(
        { error: "forbidden", message: "Le plan École / Pro est requis pour accéder à cette fonctionnalité." },
        { status: 403 }
      ),
      user,
      account,
      supabase,
    };
  }

  return {
    errorResponse: null,
    user,
    account,
    supabase,
  };
}
