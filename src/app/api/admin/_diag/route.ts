import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

// DIAGNOSTIC TEMPORAIRE — à supprimer après correction du guard admin.
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const cookieStore = await cookies();
  const token = cookieStore.get("sb-access-token")?.value;

  if (!token) {
    return NextResponse.json({ step: "no-cookie", hasEnv: !!process.env.SUPER_ADMIN_EMAILS, envEmails: (process.env.SUPER_ADMIN_EMAILS || "").split(",").map((e) => e.trim()) });
  }

  const client = createClient(supabaseUrl!, anonKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data, error } = await client.auth.getUser(token);
  const email = data.user?.email?.toLowerCase() || null;
  const envEmails = (process.env.SUPER_ADMIN_EMAILS || "")
    .split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);

  return NextResponse.json({
    step: "session",
    userError: error?.message || null,
    email,
    emailMatches: email ? envEmails.includes(email) : false,
    envEmails,
    hasEnv: envEmails.length > 0,
  });
}
