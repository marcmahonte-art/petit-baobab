// ============================================================
// Petit Baobab — API Classes GET/POST (Phase 4.2)
// ============================================================

import { NextResponse } from "next/server";
import { getTeacherSession } from "@/lib/school-auth";
import { CreateClassroomInput, ClassroomWithStats } from "@/types/school";

export async function GET() {
  const { errorResponse, account, supabase } = await getTeacherSession();
  if (errorResponse) return errorResponse;
  if (!account || !supabase) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    // 1. Récupérer toutes les classes actives de l'enseignant
    const { data: classrooms, error: classErr } = await supabase
      .from("classrooms")
      .select("*")
      .eq("account_id", account.id)
      .is("archived_at", null)
      .order("created_at", { ascending: false });

    if (classErr || !classrooms) {
      console.error("Error fetching classrooms:", classErr);
      return NextResponse.json([], { status: 200 });
    }

    if (classrooms.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    const classroomIds = classrooms.map((c) => c.id);

    // 2. Récupérer tous les élèves non supprimés de ces classes
    const { data: students, error: stdErr } = await supabase
      .from("school_students")
      .select("id, classroom_id")
      .in("classroom_id", classroomIds)
      .is("deleted_at", null);

    const studentList = students || [];
    const studentIds = studentList.map((s) => s.id);

    // 3. Récupérer les profils de jeu enfants liés à ces élèves
    let childProfiles: any[] = [];
    if (studentIds.length > 0) {
      const { data: cpData } = await supabase
        .from("child_profiles")
        .select("id, student_id")
        .in("student_id", studentIds);
      childProfiles = cpData || [];
    }

    const profileIds = childProfiles.map((cp) => cp.id);
    const studentToProfileMap = new Map(childProfiles.map((cp) => [cp.student_id, cp.id]));
    const profileToStudentMap = new Map(childProfiles.map((cp) => [cp.id, cp.student_id]));

    // 4. Récupérer tous les dessins créés pour ces profils
    let drawings: any[] = [];
    if (profileIds.length > 0) {
      const { data: drData } = await supabase
        .from("saved_drawings")
        .select("id, profile_id")
        .in("profile_id", profileIds)
        .in("status", ["terminé", "completed"]); // seulement dessin finalisé
      drawings = drData || [];
    }

    // 5. Récupérer tous les livres créés pour ces profils
    let books: any[] = [];
    if (profileIds.length > 0) {
      const { data: bkData } = await supabase
        .from("books")
        .select("id, profile_id")
        .in("profile_id", profileIds)
        .eq("status", "finalized");
      books = bkData || [];
    }

    // 6. Récupérer les connexions d'aujourd'hui (activités de type 'login' de moins de 24h)
    const activeTodayProfiles = new Set<string>();
    if (profileIds.length > 0) {
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

    // 7. Agréger les données par classe
    const result: ClassroomWithStats[] = classrooms.map((classroom) => {
      // Trouver les élèves de cette classe
      const classStudents = studentList.filter((s) => s.classroom_id === classroom.id);
      const classStudentIds = classStudents.map((s) => s.id);
      const classProfileIds = classStudents
        .map((s) => studentToProfileMap.get(s.id))
        .filter(Boolean) as string[];

      // Calculs
      const student_count = classStudents.length;

      const active_today = classStudents.filter((s) => {
        const profId = studentToProfileMap.get(s.id);
        return profId ? activeTodayProfiles.has(profId) : false;
      }).length;

      const total_drawings = drawings.filter((d) => classProfileIds.includes(d.profile_id)).length;
      const total_books = books.filter((b) => classProfileIds.includes(b.profile_id)).length;

      return {
        ...classroom,
        student_count,
        active_today,
        total_drawings,
        total_books,
      };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error in classroom GET API:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération des classes." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const { errorResponse, account, supabase } = await getTeacherSession();
  if (errorResponse) return errorResponse;
  if (!account || !supabase) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const body: CreateClassroomInput = await request.json().catch(() => ({}));
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const academicYear = typeof body?.academic_year === "string" ? body.academic_year.trim() : "2025-2026";

    if (!name) {
      return NextResponse.json(
        { error: "Le nom de la classe est obligatoire." },
        { status: 400 }
      );
    }

    // Créer la classe (le trigger SQL generate_class_code s'occupera du code de classe si null)
    const { data: newClass, error: insertErr } = await supabase
      .from("classrooms")
      .insert({
        account_id: account.id,
        name,
        academic_year: academicYear,
      })
      .select("*")
      .single();

    if (insertErr || !newClass) {
      console.error("Error inserting classroom:", insertErr);
      return NextResponse.json(
        { error: "Impossible de créer la classe." },
        { status: 500 }
      );
    }

    // Retourner la classe avec les statistiques initiales (toutes à 0)
    const result: ClassroomWithStats = {
      ...newClass,
      student_count: 0,
      active_today: 0,
      total_drawings: 0,
      total_books: 0,
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error in classroom POST API:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la création de la classe." },
      { status: 500 }
    );
  }
}
