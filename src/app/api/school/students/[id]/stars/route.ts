// ============================================================
// Petit Baobab — API Ajout/Retrait d'étoiles élève (Enseignant)
// ============================================================
// POST /api/school/students/[id]/stars
// Body : { amount: number, reason?: string }
//   amount > 0 → ajoute des étoiles (points_earned)
//   amount < 0 → retire des étoiles (stars_used)
// Les étoiles d'un élève sont dérivées de student_activities
// (points_earned - stars_used), comme dans la page Mes élèves.

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
    const body = await request.json().catch(() => ({}));
    const amount = Number(body.amount);
    const reason = typeof body.reason === "string" ? body.reason.trim() : "Attribution enseignant";

    if (!Number.isInteger(amount) || amount === 0) {
      return NextResponse.json({ error: "Le montant doit être un entier non nul." }, { status: 400 });
    }
    if (Math.abs(amount) > 1000) {
      return NextResponse.json({ error: "Montant trop élevé (max 1000)." }, { status: 400 });
    }

    // 1. Récupérer l'élève + vérifier la classe
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

    // 2. Récupérer le child_profile lié
    const { data: childProfile, error: profErr } = await supabase
      .from("child_profiles")
      .select("id")
      .eq("student_id", studentId)
      .single();

    if (profErr || !childProfile) {
      return NextResponse.json({ error: "Profil de jeu introuvable." }, { status: 404 });
    }

    // 3. Insérer l'activité d'attribution
    const activityRow: Record<string, any> = {
      profile_id: childProfile.id,
      action: amount > 0 ? "teacher_award" : "teacher_remove",
      metadata: { reason, amount },
    };
    if (amount > 0) {
      activityRow.points_earned = amount;
      activityRow.stars_used = 0;
    } else {
      activityRow.points_earned = 0;
      activityRow.stars_used = Math.abs(amount);
    }

    const { error: actErr } = await supabase.from("student_activities").insert(activityRow);
    if (actErr) {
      console.error("Stars award insert error:", actErr);
      return NextResponse.json({ error: "Impossible d'attribuer les étoiles." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      amount,
      message:
        amount > 0
          ? `+${(amount)} ⭐ attribuées.`
          : `${Math.abs(amount)} ⭐ retirées.`,
    });
  } catch (error: any) {
    console.error("Stars award API error:", error);
    return NextResponse.json({ error: "Une erreur est survenue." }, { status: 500 });
  }
}
