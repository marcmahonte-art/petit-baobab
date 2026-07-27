// Helper client : détermine si l'utilisateur connecté est Super Admin,
// en décodant le JWT de session (cookie sb-access-token) et en comparant
// l'email à NEXT_PUBLIC_SUPER_ADMIN_EMAILS (miroir public de SUPER_ADMIN_EMAILS).
"use client";

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
      base64UrlDecode(parts[1]).split("").map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function getSessionEmail(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)sb-access-token=([^;]+)/);
  if (!match) return null;
  const payload = decodeJwt(decodeURIComponent(match[1]));
  const email = payload?.email;
  return EMAIL_RE.test(email || "") ? (email as string).toLowerCase() : null;
}

export function isSuperAdminClient(): boolean {
  const email = getSessionEmail();
  if (!email) return false;
  const raw = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAILS;
  if (!raw) return false;
  const list = raw.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  return list.includes(email);
}

/** Redirection espace selon le rôle : admin -> /dashboard, sinon -> /learn/dashboard. */
export function getHomeRedirect(): string {
  return isSuperAdminClient() ? "/dashboard" : "/learn/dashboard";
}
