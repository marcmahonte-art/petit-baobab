import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth";
import { getSupabaseServer } from "@/lib/supabaseServer";

// POST /api/auth/default-space
// Persiste le choix de l'espace par défaut côté serveur (colonne accounts.default_space).
export async function POST(request: Request) {
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const space = body?.space;
  if (space !== "family" && space !== "school") {
    return NextResponse.json({ error: "invalid_space" }, { status: 400 });
  }

  const supabase = await getSupabaseServer();
  const { error } = await supabase
    .from("accounts")
    .update({ default_space: space })
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, space });
}
