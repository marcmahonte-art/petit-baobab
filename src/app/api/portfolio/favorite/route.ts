import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { getServerUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const childId = searchParams.get("childId");
    if (!childId) {
      return NextResponse.json({ error: "Paramètre childId manquant" }, { status: 400 });
    }

    const { resourceType, resourceId } = await request.json();
    if (!resourceType || !resourceId) {
      return NextResponse.json({ error: "resourceType et resourceId requis" }, { status: 400 });
    }

    const supabase = await getSupabaseServer();
    const { data: existing } = await supabase
      .from("portfolio_favorites")
      .select("id")
      .eq("child_id", childId)
      .eq("resource_type", resourceType)
      .eq("resource_id", resourceId)
      .single();

    if (existing) {
      await supabase.from("portfolio_favorites").delete().eq("id", existing.id);
    } else {
      await supabase.from("portfolio_favorites").insert({
        child_id: childId,
        resource_type: resourceType,
        resource_id: resourceId,
      });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Portfolio favorite toggle error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Erreur inconnue" }, { status: 500 });
  }
}
