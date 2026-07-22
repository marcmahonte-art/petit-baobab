import { getSupabaseServer } from "@/lib/supabaseServer";
import { getServerUser } from "@/lib/auth";

export interface BillingData {
  account: {
    id: string;
    plan: string;
    stars_balance: number;
    plan_started_at: string | null;
    plan_expires_at: string | null;
    renewal_enabled: boolean;
  } | null;
  subscription: {
    id: string;
    plan: string;
    status: string;
    renew_at: string | null;
    created_at: string;
  } | null;
  payments: Array<{
    id: string;
    transaction_id: string;
    amount: number;
    currency: string;
    status: string;
    provider: string;
    invoice_number: string | null;
    receipt_url: string | null;
    plan: string | null;
    created_at: string;
  }>;
  paymentsTotal: number;
  starsTransactions: Array<{
    id: string;
    amount: number;
    reason: string;
    reference: string | null;
    created_at: string;
  }>;
  monthlyConsumption: Array<{ month: string; total: number }>;
  invoices: Array<{
    invoice_number: string;
    amount: number;
    currency: string;
    status: string;
    receipt_url: string | null;
    created_at: string;
  }>;
  amountPaidThisMonth: number;
}

/**
 * Charge toutes les données de facturation d'un compte en requêtes
 * parallèles (pas de N+1). L'ownership est vérifié : on ne lit que
 * les lignes dont account.user_id === user.id.
 */
export async function getBillingData(): Promise<BillingData | null> {
  const supabase = await getSupabaseServer();
  const user = await getServerUser();
  if (!user) return null;

  const { data: account } = await supabase
    .from("accounts")
    .select("id, plan, stars_balance, plan_renewed_at, created_at")
    .eq("user_id", user.id)
    .single();

  if (!account) return null;
  const accountId = account.id;

  const [
    subscriptionRes,
    paymentsRes,
    paymentsCountRes,
    transactionsRes,
    invoicesRes,
    consumptionRes,
  ] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("id, plan, status, renew_at, created_at")
      .eq("account_id", accountId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("payments")
      .select("id, transaction_id, amount, currency, status, provider, invoice_number, receipt_url, plan, created_at")
      .eq("account_id", accountId)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("payments")
      .select("id", { count: "exact", head: true })
      .eq("account_id", accountId),
    supabase
      .from("stars_transactions")
      .select("id, amount, reason, reference, created_at")
      .eq("account_id", accountId)
      .order("created_at", { ascending: false })
      .limit(30),
    supabase
      .from("payments")
      .select("invoice_number, amount, currency, status, receipt_url, created_at")
      .eq("account_id", accountId)
      .not("invoice_number", "is", null)
      .order("created_at", { ascending: false })
      .limit(50),
    // Consommation mensuelle (somme des débits par mois, 12 derniers mois)
    supabase
      .from("stars_transactions")
      .select("amount, created_at")
      .eq("account_id", accountId)
      .lt("amount", 0),
  ]);

  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const amountPaidThisMonth =
    paymentsRes.data
      ?.filter((p) => p.status === "completed" && (p.created_at || "").startsWith(monthKey))
      .reduce((sum, p) => sum + (p.amount || 0), 0) ?? 0;

  // Consommation groupée par mois (12 derniers)
  const monthlyMap = new Map<string, number>();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthlyMap.set(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, 0);
  }
  (consumptionRes.data || []).forEach((t) => {
    const key = (t.created_at || "").slice(0, 7);
    if (monthlyMap.has(key)) {
      monthlyMap.set(key, (monthlyMap.get(key) || 0) + Math.abs(t.amount || 0));
    }
  });
  const monthlyConsumption = Array.from(monthlyMap.entries()).map(([month, total]) => ({
    month,
    total,
  }));

  return {
    account: {
      id: account.id,
      plan: account.plan,
      stars_balance: account.stars_balance,
      // Schéma réel de `accounts` : pas de plan_started_at / plan_expires_at /
      // renewal_enabled. On dérive depuis created_at / plan_renewed_at.
      plan_started_at: account.created_at,
      plan_expires_at: account.plan_renewed_at
        ? new Date(new Date(account.plan_renewed_at).getTime() + 30 * 24 * 3600 * 1000).toISOString()
        : null,
      renewal_enabled: account.plan !== "free" && account.plan !== "decouverte",
    },
    subscription: subscriptionRes.data
      ? {
          id: subscriptionRes.data.id,
          plan: subscriptionRes.data.plan,
          status: subscriptionRes.data.status,
          renew_at: subscriptionRes.data.renew_at,
          created_at: subscriptionRes.data.created_at,
        }
      : null,
    payments: paymentsRes.data || [],
    paymentsTotal: paymentsCountRes.count ?? 0,
    starsTransactions: transactionsRes.data || [],
    monthlyConsumption,
    invoices: invoicesRes.data || [],
    amountPaidThisMonth,
  };
}
