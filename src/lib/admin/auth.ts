// Guard Super Admin pour /dashboard.
// Approche robuste : on décode le JWT de session (cookie sb-access-token,
// format JWT standard Supabase) pour en extraire l'email, puis on compare
// à SUPER_ADMIN_EMAILS (env) OU à la table super_admins. On ne dépend PAS de
// auth.getUser() (qui peut échouer selon la config des cookies).
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export interface SuperAdminSession {
  userId: string;
  email: string;
  name: string | null;
}

function base64UrlDecode(input: string): string {
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  if (typeof atob === "function") return atob(b64);
  return Buffer.from(b64, "base64").toString("binary");
}

function decodeJwt(token: string): Record<string, any> | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const json = decodeURIComponent(
      base64UrlDecode(parts[1])
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function getAdminEmails(): string[] {
  const raw = process.env.SUPER_ADMIN_EMAILS;
  if (!raw) return [];
  return raw.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function getSuperAdminSession(): Promise<SuperAdminSession | null> {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const token = cookieStore.get("sb-access-token")?.value;
  if (!token) return null;

  const payload = decodeJwt(token);
  if (!payload) return null;

  const email: string = (payload.email || "").toLowerCase();
  const userId: string = payload.sub || "";
  if (!EMAIL_RE.test(email) || !userId) return null;

  // 1. Email listé explicitement
  const adminEmails = getAdminEmails();
  if (adminEmails.includes(email)) {
    return {
      userId,
      email: payload.email || email,
      name: (payload.user_metadata?.full_name as string) || null,
    };
  }

  // 2. Table super_admins (optionnelle, non bloquante)
  try {
    const admin = getSupabaseAdmin();
    const { data: row } = await admin
      .from("super_admins")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();
    if (row) {
      return {
        userId,
        email: payload.email || email,
        name: (payload.user_metadata?.full_name as string) || null,
      };
    }
  } catch {
    /* table absente : on ignore */
  }

  return null;
}
