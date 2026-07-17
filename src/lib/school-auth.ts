// ============================================================
// Petit Baobab — Helper d'Authentification Enseignant (Phase 4)
// ============================================================

import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth";
import { getSupabaseServer } from "@/lib/supabaseServer";

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
