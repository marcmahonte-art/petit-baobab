// src/app/api/studio/assets/route.ts

import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { getServerUser } from "@/lib/auth";
import type { StudioAsset } from "@/features/studio/types";

/**
 * GET /api/studio/assets?childId=xxx
 * Retourne la liste des actifs de l'enfant.
 */
export async function GET(request: Request) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const childId = searchParams.get("childId");
  if (!childId) return NextResponse.json({ error: "Missing childId" }, { status: 400 });

  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from("studio_assets")
    .select("*")
    .eq("child_id", childId);

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
  return NextResponse.json(data as StudioAsset[]);
}

/**
 * POST /api/studio/assets
 * Body : { child_id, type, url, tags? }
 * In a real implementation the file would be uploaded to Supabase storage first.
 */
export async function POST(request: Request) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const payload = await request.json();
  const { child_id, type, url, tags } = payload;
  if (!child_id || !type || !url) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from("studio_assets")
    .insert({ child_id, type, url, tags })
    .select()
    .single();

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Insert failed" }, { status: 500 });
  }
  return NextResponse.json(data as StudioAsset, { status: 201 });
}
