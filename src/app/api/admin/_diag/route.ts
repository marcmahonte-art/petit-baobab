import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// DIAGNOSTIC TEMPORAIRE — à supprimer après correction du guard admin.
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

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sb-access-token")?.value;

  if (!token) {
    return NextResponse.json({
      step: "no-cookie",
      hasEnv: !!process.env.SUPER_ADMIN_EMAILS,
      envEmails: (process.env.SUPER_ADMIN_EMAILS || "").split(",").map((e) => e.trim()),
    });
  }

  const payload = decodeJwt(token);
  const email = (payload?.email || "").toLowerCase();
  const userId = payload?.sub || null;
  const envEmails = (process.env.SUPER_ADMIN_EMAILS || "")
    .split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);

  return NextResponse.json({
    step: "jwt",
    hasToken: true,
    email,
    userId,
    emailMatches: email ? envEmails.includes(email) : false,
    envEmails,
    hasEnv: envEmails.length > 0,
  });
}
