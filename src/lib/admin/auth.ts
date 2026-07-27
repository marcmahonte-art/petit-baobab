// Guard Super Admin pour /dashboard.
// Approche sûre, sans modifier le schéma auth existant :
//  - lit la session Supabase (service_role),
//  - autorise si l'email figure dans SUPER_ADMIN_EMAILS (env Vercel),
//    OU si l'user_id figure dans la table `super_admins` (optionnelle, créée au besoin).
// Le /dashboard redirige vers /login si non admin.
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { createClient } from "@supabase/supabase-js";

export interface SuperAdminSession {
  userId: string;
  email: string;
  name: string | null;
}

function getAdminEmails(): string[] {
  const raw = process.env.SUPER_ADMIN_EMAILS;
  if (!raw) return [];
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** Récupère la session admin à partir du cookie d'auth (côté serveur). */
export async function getSuperAdminSession(): Promise<SuperAdminSession | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) return null;

  // Lecture du cookie d'auth posé par setAuthCookies (sb-access-token)
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const token = cookieStore.get("sb-access-token")?.value;
  if (!token) return null;

  const client = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) return null;

  const email = (data.user.email || "").toLowerCase();
  const adminEmails = getAdminEmails();

  // 1. Email listé explicitement
  if (adminEmails.includes(email)) {
    return {
      userId: data.user.id,
      email: data.user.email || "",
      name: (data.user.user_metadata?.full_name as string) || null,
    };
  }

  // 2. Table super_admins (optionnelle, non bloquante)
  try {
    const admin = getSupabaseAdmin();
    const { data: row } = await admin
      .from("super_admins")
      .select("user_id")
      .eq("user_id", data.user.id)
      .maybeSingle();
    if (row) {
      return {
        userId: data.user.id,
        email: data.user.email || "",
        name: (data.user.user_metadata?.full_name as string) || null,
      };
    }
  } catch {
    /* table absente : on ignore */
  }

  return null;
}
