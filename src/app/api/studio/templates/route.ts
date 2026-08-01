// src/app/api/studio/templates/route.ts

import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { getServerUser } from "@/lib/auth";
import type { StudioTemplate } from "@/features/studio/types";

/**
 * GET /api/studio/templates?category=xxx&premium=boolean
 * Retourne la liste des modèles disponibles.
 */
export async function GET(request: Request) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const premium = searchParams.get("premium");

  const supabase = await getSupabaseServer();
  let query = supabase.from("studio_templates").select("*");
  if (category) query = query.eq("category", category);
  if (premium !== null) query = query.eq("premium", premium === "true");

  const { data, error } = await query;

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
  return NextResponse.json(data as StudioTemplate[]);
}
