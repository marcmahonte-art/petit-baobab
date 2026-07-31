import { NextResponse } from "next/server";
import { getTeacherSession } from "@/lib/school-auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

/**
 * PATCH /api/school/profile
 * Met à jour le nom et/ou l'avatar de l'administrateur École.
 *
 * Source de vérité = auth.users.raw_user_meta_data (full_name, avatar_url).
 * La table `profiles` ne contient PAS ces colonnes, donc on écrit dans les
 * user_metadata via l'Admin API (service role). Le Dashboard lit ensuite
 * user_metadata.full_name / avatar_url.
 */
export async function PATCH(request: Request) {
  const { errorResponse, user } = await getTeacherSession();
  if (errorResponse) return errorResponse;
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  let body: { full_name?: string; avatar_url?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const full_name = typeof body.full_name === "string" ? body.full_name.trim() : undefined;
  const avatar_url = typeof body.avatar_url === "string" ? body.avatar_url : undefined;

  if (full_name !== undefined && full_name.length === 0) {
    return NextResponse.json({ error: "Le nom ne peut pas être vide." }, { status: 400 });
  }

  try {
    const admin = getSupabaseAdmin();

    // Fusionner avec les métadonnées existantes pour ne pas écraser les autres champs.
    const existing = (user.user_metadata || {}) as Record<string, unknown>;
    const nextMetadata: Record<string, unknown> = { ...existing };
    if (full_name !== undefined) nextMetadata.full_name = full_name;
    if (avatar_url !== undefined) nextMetadata.avatar_url = avatar_url;

    const { data, error } = await admin.auth.admin.updateUserById(user.id, {
      user_metadata: nextMetadata,
    });

    if (error) throw error;

    return NextResponse.json({
      ok: true,
      full_name: (data.user?.user_metadata as any)?.full_name ?? full_name ?? null,
      avatar_url: (data.user?.user_metadata as any)?.avatar_url ?? avatar_url ?? null,
    });
  } catch (e: any) {
    console.error("PATCH /api/school/profile error:", e);
    return NextResponse.json(
      { error: e.message || "Erreur lors de la mise à jour du profil." },
      { status: 500 },
    );
  }
}
