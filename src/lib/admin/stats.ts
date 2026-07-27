// Agrégation des KPIs plateforme pour le Super Admin.
// Tout est lu via service_role (côté serveur uniquement).
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export interface OverviewStats {
  families: number;
  schools: number;
  teachers: number;
  children: number;
  accounts: number;
  coloriages: number;
  livres: number;
  imagesIA: number;
  telechargements: number;
  commandesBoutique: number;
  caMois: number;
  caAnnuel: number;
  etoilesDistribuees: number;
  etoilesConsommees: number;
  etoilesRestantes: number;
  abonnementsActifs: number;
  essaisGratuits: number;
  connexionsAujourdhui: number;
}

const MONTH = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
const YEAR = new Date(new Date().getFullYear(), 0, 1).toISOString();
const TODAY = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();

export async function getOverviewStats(): Promise<OverviewStats> {
  const supabase = getSupabaseAdmin();

  const [
    { count: accounts },
    { count: schools },
    { count: teachers },
    { count: children },
    { count: coloriages },
    { count: livres },
    { count: imagesIA },
    { count: telechargements },
    { count: commandesBoutique },
    { count: abonnementsActifs },
    { count: essaisGratuits },
    { count: connexionsToday },
    starsAgg,
    shopMonth,
    shopYear,
  ] = await Promise.all([
    supabase.from("accounts").select("*", { count: "exact", head: true }),
    supabase.from("accounts").select("*", { count: "exact", head: true }).eq("plan", "ecole_pro"),
    // Enseignants : comptes école avec un rôle enseignant (on approxime via plan ecole_pro non-owner)
    supabase.from("accounts").select("*", { count: "exact", head: true }).eq("plan", "ecole_pro"),
    supabase.from("child_profiles").select("*", { count: "exact", head: true }),
    supabase.from("drawings").select("*", { count: "exact", head: true }),
    supabase.from("books").select("*", { count: "exact", head: true }),
    supabase.from("drawings").select("*", { count: "exact", head: true }).eq("source", "ai"),
    supabase.from("shop_downloads").select("*", { count: "exact", head: true }),
    supabase.from("shop_orders").select("*", { count: "exact", head: true }),
    supabase.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "trialing"),
    supabase.from("auth_sessions").select("*", { count: "exact", head: true }).gte("created_at", TODAY),
    supabase.from("stars_transactions").select("type, amount"),
    supabase.from("shop_orders").select("total").eq("payment_status", "paid").gte("created_at", MONTH),
    supabase.from("shop_orders").select("total").eq("payment_status", "paid").gte("created_at", YEAR),
  ]);

  // Étoiles : sum crédits (distribuées) - sum débits (consommées)
  let distrib = 0;
  let cons = 0;
  for (const row of (starsAgg.data || []) as Array<{ type: string; amount: number }>) {
    if (row.type === "credit" || row.amount > 0) distrib += Math.abs(row.amount);
    else cons += Math.abs(row.amount);
  }

  const caMois = (shopMonth.data || []).reduce((s: number, r: any) => s + (r.total || 0), 0);
  const caAnnuel = (shopYear.data || []).reduce((s: number, r: any) => s + (r.total || 0), 0);

  return {
    families: (accounts || 0) - (schools || 0),
    schools: schools || 0,
    teachers: teachers || 0,
    children: children || 0,
    accounts: accounts || 0,
    coloriages: coloriages || 0,
    livres: livres || 0,
    imagesIA: imagesIA || 0,
    telechargements: telechargements || 0,
    commandesBoutique: commandesBoutique || 0,
    caMois,
    caAnnuel,
    etoilesDistribuees: distrib,
    etoilesConsommees: cons,
    etoilesRestantes: distrib - cons,
    abonnementsActifs: abonnementsActifs || 0,
    essaisGratuits: essaisGratuits || 0,
    connexionsAujourdhui: connexionsToday || 0,
  };
}
