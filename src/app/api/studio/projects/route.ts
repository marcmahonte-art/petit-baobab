// src/app/api/studio/projects/route.ts

import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { getServerUser } from "@/lib/auth";
import type { StudioProject } from "@/features/studio/types";

/**
 * GET /api/studio/projects?childId=xxx
 * Returns the list of projects for the given child.
 */
export async function GET(request: Request) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const childId = searchParams.get("childId");
  if (!childId) return NextResponse.json({ error: "Missing childId" }, { status: 400 });

  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from("studio_projects")
    .select("*")
    .eq("child_id", childId);

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
  return NextResponse.json(data as StudioProject[]);
}

/**
 * POST /api/studio/projects
 * Body: { child_id, title, type }
 */
export async function POST(request: Request) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const payload = await request.json();
  const { child_id, title, type } = payload;
  if (!child_id || !title || !type) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from("studio_projects")
    .insert({ child_id, title, type, status: "draft" })
    .select()
    .single();

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Insert failed" }, { status: 500 });
  }
  return NextResponse.json(data as StudioProject, { status: 201 });
}
