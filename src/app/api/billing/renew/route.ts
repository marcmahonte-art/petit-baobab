import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth";
import { getSupabaseServer } from "@/lib/supabaseServer";

// ============================================================
// Petit Baobab — Renouvellement « lazy » des étoiles
// ============================================================
// Fallback applicatif au cron pg_cron : si la fenêtre mensuelle
// d'un compte (plan_renewed_at) est dépassée, on remet le solde
// au niveau du plan et on avance la fenêtre d'un mois.
//
// Montants par plan (cohérents avec supabase/04_stars_renewal_cron.sql) :
//   - ecole_pro     : 1000 étoiles / mois
//   - super_baobab  : 250 étoiles / mois
// Les plans free (reset quotidien) et decouverte (unique) ne sont
// pas traités ici.

const RENEW_AMOUNT: Record<string, number> = {
  ecole_pro: 1000,
  super_baobab: 250,
};

export async function POST(request: Request) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }

    const supabase = await getSupabaseServer();
    const { data: account, error: accErr } = await supabase
      .from("accounts")
      .select("id, plan, stars_balance, plan_renewed_at")
      .eq("user_id", user.id)
      .single();

    if (accErr || !account) {
      return NextResponse.json({ error: "Compte introuvable." }, { status: 404 });
    }

    const amount = RENEW_AMOUNT[account.plan];
    if (!amount) {
      // Plan non éligible au renouvellement mensuel (free / decouverte).
      return NextResponse.json({ renewed: false, reason: "not_eligible" });
    }

    const now = new Date();
    const renewedAt = account.plan_renewed_at ? new Date(account.plan_renewed_at) : null;

    // Déjà à jour cette période -> rien à faire.
    if (renewedAt && renewedAt > now) {
      return NextResponse.json({ renewed: false, reason: "already_current" });
    }

    const nextRenewal = renewedAt
      ? new Date(renewedAt.getTime() + 30 * 24 * 60 * 60 * 1000)
      : now;

    const { error: updErr } = await supabase
      .from("accounts")
      .update({
        stars_balance: amount,
        plan_renewed_at: nextRenewal.toISOString(),
      })
      .eq("id", account.id);

    if (updErr) {
      return NextResponse.json({ error: updErr.message }, { status: 500 });
    }

    return NextResponse.json({ renewed: true, stars_balance: amount, plan: account.plan });
  } catch (err: any) {
    console.error("Renew stars error:", err);
    return NextResponse.json({ error: "Erreur interne." }, { status: 500 });
  }
}
