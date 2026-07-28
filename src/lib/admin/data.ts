// Helpers de données réelles pour le Super Admin back-office.
// Tout est lu via service_role (côté serveur uniquement).
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export interface AdminUserRow {
  id: string;
  email: string | null;
  fullName: string | null;
  plan: string;
  role: "famille" | "ecole";
  starsBalance: number;
  childrenCount: number;
  classroomsCount: number;
  studentsCount: number;
  createdAt: string | null;
  lastSignIn: string | null;
}

const FAMILY_PLANS = ["free", "decouverte", "super_baobab"];

export async function getAdminUsers(opts: {
  role?: "famille" | "ecole" | "all";
  search?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<{ users: AdminUserRow[]; total: number }> {
  const supabase = getSupabaseAdmin();
  const limit = opts.limit ?? 25;
  const offset = opts.offset ?? 0;

  // 1. Récupérer les comptes (accounts)
  let query = supabase
    .from("accounts")
    .select("id, user_id, plan, stars_balance, created_at");

  // Filtre par rôle (plan)
  if (opts.role === "ecole") {
    query = query.eq("plan", "ecole_pro");
  } else if (opts.role === "famille") {
    query = query.in("plan", FAMILY_PLANS);
  }
  query = query.order("created_at", { ascending: false }).range(offset, offset + limit - 1);

  const { data: accounts, error, count } = await query;
  if (error || !accounts) return { users: [], total: 0 };

  const userIds = accounts.map((a: any) => a.user_id).filter(Boolean);

  // 2. Emails + noms depuis auth.users (admin)
  let emailMap: Record<string, { email: string | null; fullName: string | null; createdAt: string | null; lastSignIn: string | null }> = {};
  if (userIds.length) {
    const { data: list } = await supabase.auth.admin.listUsers({
      perPage: 200,
      page: 1,
    });
    for (const u of (list?.users || []).filter((u: any) => userIds.includes(u.id))) {
      emailMap[u.id] = {
        email: u.email ?? null,
        fullName: (u.user_metadata as any)?.full_name ?? null,
        createdAt: u.created_at ?? null,
        lastSignIn: u.last_sign_in_at ?? null,
      };
    }
  }

  // 3. Compteurs enfants / classes / élèves
  const accountIds = accounts.map((a: any) => a.id);
  const [children, classrooms, students] = await Promise.all([
    supabase.from("child_profiles").select("account_id", { count: "exact" }).in("account_id", accountIds),
    supabase.from("classrooms").select("account_id", { count: "exact" }).in("account_id", accountIds),
    // Élèves : via school_students → classroom → account
    supabase.from("school_students").select("classroom_id", { count: "exact" }).in(
      "classroom_id",
      (await supabase.from("classrooms").select("id").in("account_id", accountIds)).data?.map((c: any) => c.id) || []
    ),
  ]);

  // Indexer les compteurs par account_id
  const countBy = (rows: any[] | null, key: string) => {
    const m: Record<string, number> = {};
    for (const r of rows || []) m[r[key]] = (m[r[key]] || 0) + 1;
    return m;
  };
  const childCount = countBy(((children as any)?.data as any[]) || null, "account_id");
  const classCount = countBy(((classrooms as any)?.data as any[]) || null, "account_id");
  const studCount = countBy(((students as any)?.data as any[]) || null, "classroom_id");
  // studCount est par classroom_id ; on le remappe en account via classrooms
  const classToAccount: Record<string, string> = {};
  ((classrooms as any)?.data as any[])?.forEach((c: any) => {
    classToAccount[c.id] = c.account_id;
  });
  const studByAccount: Record<string, number> = {};
  Object.entries(studCount).forEach(([cid, n]) => {
    const acc = classToAccount[cid];
    if (acc) studByAccount[acc] = (studByAccount[acc] || 0) + (n as number);
  });

  const users: AdminUserRow[] = accounts.map((a: any) => {
    const meta = emailMap[a.user_id] || {};
    return {
      id: a.id,
      email: meta.email ?? null,
      fullName: meta.fullName ?? null,
      plan: a.plan,
      role: a.plan === "ecole_pro" ? "ecole" : "famille",
      starsBalance: a.stars_balance ?? 0,
      childrenCount: childCount[a.id] || 0,
      classroomsCount: classCount[a.id] || 0,
      studentsCount: studByAccount[a.id] || 0,
      createdAt: meta.createdAt ?? a.created_at ?? null,
      lastSignIn: meta.lastSignIn ?? null,
    };
  });

  // Filtre recherche (email/nom) côté serveur léger
  let filtered = users;
  if (opts.search) {
    const s = opts.search.toLowerCase();
    filtered = users.filter(
      (u) =>
        (u.email || "").toLowerCase().includes(s) ||
        (u.fullName || "").toLowerCase().includes(s)
    );
  }

  const total = count ?? accounts.length;
  return { users: filtered, total };
}

export async function getAdminSchools(): Promise<{
  schools: (AdminUserRow & { subscription: string | null })[];
  total: number;
}> {
  const { users } = await getAdminUsers({ role: "ecole", limit: 200 });
  const supabase = getSupabaseAdmin();
  const accountIds = users.map((u) => u.id);
  const { data: subs } = await supabase
    .from("subscriptions")
    .select("account_id, plan, status")
    .in("account_id", accountIds)
    .eq("status", "active");
  const subMap: Record<string, string> = {};
  for (const s of (subs as any[]) || []) subMap[s.account_id] = s.plan;

  const schools = users.map((u) => ({ ...u, subscription: subMap[u.id] ?? null }));
  return { schools, total: schools.length };
}

// ============================================================
// BOUTIQUE — commandes (qui a payé quoi / quand / combien)
// ============================================================
export interface AdminOrderRow {
  id: string;
  orderNumber: string;
  client: string;
  email: string;
  itemsCount: number;
  total: number;
  currency: string;
  method: string;
  paymentStatus: string;
  status: string;
  createdAt: string | null;
}

export async function getAdminShopOrders(opts: {
  status?: string;
  limit?: number;
} = {}): Promise<{ orders: AdminOrderRow[]; total: number; caTotal: number }> {
  const supabase = getSupabaseAdmin();
  let query = supabase
    .from("shop_orders")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (opts.status && opts.status !== "all") {
    query = query.eq("payment_status", opts.status);
  }

  const { data, error, count } = await query.limit(opts.limit ?? 100);
  if (error || !data) return { orders: [], total: 0, caTotal: 0 };

  const orders: AdminOrderRow[] = (data as any[]).map((o) => {
    const items = Array.isArray(o.items) ? o.items : [];
    const itemsCount = items.reduce((acc: number, it: any) => acc + (it.quantity || 1), 0);
    return {
      id: o.id,
      orderNumber: o.order_number,
      client: `${o.first_name || ""} ${o.last_name || ""}`.trim(),
      email: o.email,
      itemsCount,
      total: o.total,
      currency: o.currency || "XOF",
      method: o.payment_method || "paydunya",
      paymentStatus: o.payment_status,
      status: o.status,
      createdAt: o.created_at,
    };
  });

  const caTotal = (data as any[])
    .filter((o) => o.payment_status === "paid")
    .reduce((acc: number, o) => acc + (o.total || 0), 0);

  return { orders, total: count ?? data.length, caTotal };
}

// ============================================================
// PAIEMENTS — transactions + abonnements (famille + ecole)
// ============================================================
export interface AdminPaymentRow {
  id: string;
  type: "boutique" | "abonnement";
  client: string;
  email: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  createdAt: string | null;
}

export async function getAdminPayments(): Promise<{
  payments: AdminPaymentRow[];
  caBoutique: number;
  caAbonnements: number;
}> {
  const supabase = getSupabaseAdmin();

  const { data: orders } = await supabase
    .from("shop_orders")
    .select("id, order_number, first_name, last_name, email, total, currency, payment_method, payment_status, created_at")
    .eq("payment_status", "paid")
    .order("created_at", { ascending: false })
    .limit(100);

  const { data: subs } = await supabase
    .from("subscriptions")
    .select("id, account_id, plan, amount, currency, status, created_at")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(100);

  const { data: accounts } = await supabase
    .from("accounts")
    .select("id, user_id, plan")
    .in("plan", ["super_baobab", "ecole_pro"]);

  const planByAccount: Record<string, string> = {};
  for (const a of (accounts as any[]) || []) planByAccount[a.id] = a.plan;

  const boutique: AdminPaymentRow[] = (orders as any[] || []).map((o) => ({
    id: o.id,
    type: "boutique",
    client: `${o.first_name || ""} ${o.last_name || ""}`.trim(),
    email: o.email,
    amount: o.total || 0,
    currency: o.currency || "XOF",
    method: o.payment_method || "paydunya",
    status: o.payment_status,
    createdAt: o.created_at,
  }));

  const abo: AdminPaymentRow[] = (subs as any[] || []).map((s) => ({
    id: s.id,
    type: "abonnement",
    client: planByAccount[s.account_id] === "ecole_pro" ? "École" : "Famille",
    email: "—",
    amount: s.amount || 0,
    currency: s.currency || "XOF",
    method: "carte/Orange/Moov",
    status: s.status,
    createdAt: s.created_at,
  }));

  const caBoutique = boutique.reduce((acc, p) => acc + p.amount, 0);
  const caAbonnements = abo.reduce((acc, p) => acc + p.amount, 0);

  return { payments: [...boutique, ...abo], caBoutique, caAbonnements };
}

// ============================================================
// ETOILES — soldes, historique de consommation, packs
// ============================================================
export interface AdminStarsRow {
  accountId: string;
  email: string;
  plan: string;
  balance: number;
  totalDistribue: number;
  totalConsomme: number;
}

export async function getAdminStars(): Promise<{
  rows: AdminStarsRow[];
  totalRestant: number;
  totalDistribue: number;
  totalConsomme: number;
  packs: { label: string; count: number }[];
}> {
  const supabase = getSupabaseAdmin();

  const { data: accounts } = await supabase
    .from("accounts")
    .select("id, user_id, plan, stars_balance")
    .order("stars_balance", { ascending: false })
    .limit(300);

  const { data: tx } = await supabase
    .from("stars_transactions")
    .select("account_id, amount, reason")
    .limit(3000);

  const byAccount: Record<string, { dist: number; cons: number }> = {};
  let totalDist = 0;
  let totalCons = 0;
  const packsCount: Record<string, number> = {};
  for (const t of (tx as any[]) || []) {
    const a = byAccount[t.account_id] || (byAccount[t.account_id] = { dist: 0, cons: 0 });
    if ((t.amount || 0) > 0) {
      a.dist += t.amount;
      totalDist += t.amount;
    } else {
      a.cons += Math.abs(t.amount);
      totalCons += Math.abs(t.amount);
    }
    if (t.reason === "pack_purchase" || (t.reason || "").startsWith("pack")) {
      packsCount[t.reason] = (packsCount[t.reason] || 0) + 1;
    }
  }

  const userIds = (accounts as any[] || []).map((a) => a.user_id).filter(Boolean);
  let emailMap: Record<string, string> = {};
  if (userIds.length) {
    const { data: list } = await supabase.auth.admin.listUsers({ perPage: 200, page: 1 });
    for (const u of (list?.users || []).filter((u: any) => userIds.includes(u.id))) {
      emailMap[u.id] = u.email ?? "—";
    }
  }

  const rows: AdminStarsRow[] = (accounts as any[] || []).map((a) => ({
    accountId: a.id,
    email: emailMap[a.user_id] || "—",
    plan: a.plan,
    balance: a.stars_balance || 0,
    totalDistribue: byAccount[a.id]?.dist || 0,
    totalConsomme: byAccount[a.id]?.cons || 0,
  }));

  const packs = Object.entries(packsCount).map(([label, count]) => ({ label, count }));
  const totalRestant = rows.reduce((acc, r) => acc + r.balance, 0);

  return { rows, totalRestant, totalDistribue: totalDist, totalConsomme: totalCons, packs };
}
