// ============================================================
// Petit Baobab — API Classe Détail/Modif/Archivage (Phase 4.3)
// ============================================================

import { NextResponse } from "next/server";
import { getTeacherSession } from "@/lib/school-auth";
import { ClassroomWithStats, StudentActivityFeed } from "@/types/school";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { errorResponse, account, supabase } = await getTeacherSession();
  if (errorResponse) return errorResponse;
  if (!account || !supabase) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id: classroomId } = await params;

  try {
    // 1. Récupérer la classe
    const { data: classroom, error: classErr } = await supabase
      .from("classrooms")
      .select("*")
      .eq("id", classroomId)
      .eq("account_id", account.id)
      .is("archived_at", null)
      .single();

    if (classErr || !classroom) {
      return NextResponse.json({ error: "Classe introuvable." }, { status: 404 });
    }

    // 2. Récupérer les élèves de cette classe
    const { data: students } = await supabase
      .from("school_students")
      .select("id, first_name, display_name, mascot")
      .eq("classroom_id", classroomId)
      .is("deleted_at", null);

    const studentList = students || [];
    const studentIds = studentList.map((s) => s.id);
    const studentMap = new Map(studentList.map((s) => [s.id, s]));

    // 3. Récupérer les profils enfants
    let childProfiles: any[] = [];
    if (studentIds.length > 0) {
      const { data: cpData } = await supabase
        .from("child_profiles")
        .select("id, student_id")
        .in("student_id", studentIds);
      childProfiles = cpData || [];
    }

    const profileIds = childProfiles.map((cp) => cp.id);
    const profileToStudentMap = new Map(childProfiles.map((cp) => [cp.id, cp.student_id]));
    const studentToProfileMap = new Map(childProfiles.map((cp) => [cp.student_id, cp.id]));

    // 4. Récupérer dessins, livres et connexions du jour
    let drawings: any[] = [];
    let books: any[] = [];
    const activeTodayProfiles = new Set<string>();

    if (profileIds.length > 0) {
      // Dessins
      const { data: drData } = await supabase
        .from("saved_drawings")
        .select("id, profile_id")
        .in("profile_id", profileIds)
        .in("status", ["terminé", "completed"]);
      drawings = drData || [];

      // Livres
      const { data: bkData } = await supabase
        .from("books")
        .select("id, profile_id")
        .in("profile_id", profileIds)
        .eq("status", "finalized");
      books = bkData || [];

      // Actifs aujourd'hui
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const { data: actData } = await supabase
        .from("student_activities")
        .select("profile_id")
        .in("profile_id", profileIds)
        .eq("action", "login")
        .gte("created_at", startOfToday.toISOString());

      if (actData) {
        actData.forEach((act) => activeTodayProfiles.add(act.profile_id));
      }
    }

    // 5. Récupérer les 10 dernières activités de la classe
    let recentActivities: StudentActivityFeed[] = [];
    if (profileIds.length > 0) {
      const { data: actFeed, error: feedErr } = await supabase
        .from("student_activities")
        .select("*")
        .in("profile_id", profileIds)
        .order("created_at", { ascending: false })
        .limit(10);

      if (actFeed) {
        recentActivities = actFeed.map((act: any) => {
          const studentId = profileToStudentMap.get(act.profile_id);
          const student = studentMap.get(studentId);
          const studentName = student ? (student.display_name || student.first_name) : "Élève inconnu";
          return {
            ...act,
            student_name: studentName,
            classroom_name: classroom.name,
          };
        });
      }
    }

    // 6. Composer les stats
    const student_count = studentList.length;
    const active_today = studentList.filter((s) => {
      const profId = studentToProfileMap.get(s.id);
      return profId ? activeTodayProfiles.has(profId) : false;
    }).length;
    const total_drawings = drawings.length;
    const total_books = books.length;

    const classroomWithStats: ClassroomWithStats = {
      ...classroom,
      student_count,
      active_today,
      total_drawings,
      total_books,
    };

    return NextResponse.json({
      classroom: classroomWithStats,
      recent_activity: recentActivities,
    });
  } catch (error: any) {
    console.error("Error in classroom GET detail API:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération de la classe." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { errorResponse, account, supabase } = await getTeacherSession();
  if (errorResponse) return errorResponse;
  if (!account || !supabase) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id: classroomId } = await params;

  try {
    const body = await request.json().catch(() => ({}));
    const name = typeof body?.name === "string" ? body.name.trim() : "";

    if (!name) {
      return NextResponse.json(
        { error: "Le nom de la classe est obligatoire." },
        { status: 400 }
      );
    }

    // Mettre à jour la classe
    const { data: updatedClass, error: updateErr } = await supabase
      .from("classrooms")
      .update({ name })
      .eq("id", classroomId)
      .eq("account_id", account.id)
      .is("archived_at", null)
      .select("*")
      .single();

    if (updateErr || !updatedClass) {
      console.error("Error updating classroom:", updateErr);
      return NextResponse.json(
        { error: "Classe introuvable ou mise à jour échouée." },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedClass);
  } catch (error: any) {
    console.error("Error in classroom PATCH API:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la modification de la classe." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { errorResponse, account, supabase } = await getTeacherSession();
  if (errorResponse) return errorResponse;
  if (!account || !supabase) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id: classroomId } = await params;

  try {
    // Soft delete de la classe (mise à jour d'archived_at)
    const { data: archivedClass, error: deleteErr } = await supabase
      .from("classrooms")
      .update({ archived_at: new Date().toISOString() })
      .eq("id", classroomId)
      .eq("account_id", account.id)
      .is("archived_at", null)
      .select("*")
      .single();

    if (deleteErr || !archivedClass) {
      console.error("Error deleting classroom:", deleteErr);
      return NextResponse.json(
        { error: "Classe introuvable ou déjà archivée." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Classe archivée avec succès." });
  } catch (error: any) {
    console.error("Error in classroom DELETE API:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la suppression de la classe." },
      { status: 500 }
    );
  }
}
