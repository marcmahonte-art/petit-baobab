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
