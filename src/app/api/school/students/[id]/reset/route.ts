// ============================================================
// Petit Baobab — API Réinitialisation progression élève (Enseignant)
// ============================================================
// POST /api/school/students/[id]/reset
// Réinitialise la progression d'un élève : supprime ses activités,
// coloriages et livres liés à son profil de jeu. L'élève et son profil
// sont conservés (soft reset, non destructif pour le compte).

import { NextResponse } from "next/server";
import { getTeacherSession } from "@/lib/school-auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { errorResponse, account, supabase } = await getTeacherSession();
  if (errorResponse) return errorResponse;
  if (!account || !supabase) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id: studentId } = await params;

  try {
    // 1. Élève + classe
    const { data: student, error: stdErr } = await supabase
      .from("school_students")
      .select("id, classroom_id")
      .eq("id", studentId)
      .is("deleted_at", null)
      .single();

    if (stdErr || !student) {
      return NextResponse.json({ error: "Élève introuvable." }, { status: 404 });
    }

    const { data: classroom, error: classErr } = await supabase
      .from("classrooms")
      .select("id, account_id")
      .eq("id", student.classroom_id)
      .eq("account_id", account.id)
      .is("archived_at", null)
      .single();

    if (classErr || !classroom) {
      return NextResponse.json({ error: "Action non autorisée." }, { status: 403 });
    }

    // 2. Profil de jeu lié
    const { data: childProfile, error: profErr } = await supabase
      .from("child_profiles")
      .select("id")
      .eq("student_id", studentId)
      .single();

    if (profErr || !childProfile) {
      return NextResponse.json({ error: "Profil de jeu introuvable." }, { status: 404 });
    }

    const profileId = childProfile.id;

    // 3. Supprimer la progression liée au profil
    const [actRes, drawRes, bookRes] = await Promise.all([
      supabase.from("student_activities").delete().eq("profile_id", profileId),
      supabase.from("saved_drawings").delete().eq("profile_id", profileId),
      supabase.from("books").delete().eq("profile_id", profileId),
    ]);

    if (actRes.error) {
      console.error("Reset activities error:", actRes.error);
      return NextResponse.json({ error: "Échec de la réinitialisation (activités)." }, { status: 500 });
    }
    if (drawRes.error) {
      console.error("Reset drawings error:", drawRes.error);
      return NextResponse.json({ error: "Échec de la réinitialisation (coloriages)." }, { status: 500 });
    }
    if (bookRes.error) {
      console.error("Reset books error:", bookRes.error);
      return NextResponse.json({ error: "Échec de la réinitialisation (livres)." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Progression de l'élève réinitialisée avec succès.",
    });
  } catch (error: any) {
    console.error("Reset progression API error:", error);
    return NextResponse.json({ error: "Une erreur est survenue." }, { status: 500 });
  }
}
