// ============================================================
// Petit Baobab — API Espace Enseignant Dashboard (Phase 4.1)
// ============================================================

import { NextResponse } from "next/server";
import { getTeacherSession } from "@/lib/school-auth";
import { ClassroomWithStats, StudentActivityFeed, DashboardData } from "@/types/school";

export async function GET() {
  const { errorResponse, account, supabase } = await getTeacherSession();
  if (errorResponse) return errorResponse;
  if (!account || !supabase) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    // 1. Calculer les statistiques d'étoiles
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // a. Étoiles consommées ce mois (somme des transactions négatives)
    const { data: txData } = await supabase
      .from("stars_transactions")
      .select("amount")
      .eq("account_id", account.id)
      .lt("amount", 0)
      .gte("created_at", startOfMonth.toISOString());

    const consumed_this_month = Math.abs(
      txData?.reduce((sum: number, tx: any) => sum + tx.amount, 0) || 0
    );

    // b. Date de renouvellement (plan_renewed_at + 1 mois, ou created_at + 1 mois)
    const baseDate = account.plan_renewed_at
      ? new Date(account.plan_renewed_at)
      : new Date(account.created_at);
    const renewalDate = new Date(baseDate);
    renewalDate.setMonth(renewalDate.getMonth() + 1);

    const starsInfo = {
      balance: account.stars_balance || 0,
      monthly_limit: 1000, // limite fixe école pro
      consumed_this_month,
      renewal_date: renewalDate.toISOString(),
    };

    // 2. Récupérer toutes les classes actives
    const { data: classrooms, error: classErr } = await supabase
      .from("classrooms")
      .select("*")
      .eq("account_id", account.id)
      .is("archived_at", null)
      .order("created_at", { ascending: false });

    const activeClassrooms = classrooms || [];
    const classroomIds = activeClassrooms.map((c) => c.id);

    let studentList: any[] = [];
    let childProfiles: any[] = [];
    let drawings: any[] = [];
    let books: any[] = [];
    let activeTodayProfiles = new Set<string>();
    let recentActivities: StudentActivityFeed[] = [];

    if (classroomIds.length > 0) {
      // 3. Récupérer les élèves
      const { data: stdData } = await supabase
        .from("school_students")
        .select("id, classroom_id, first_name, display_name, mascot")
        .in("classroom_id", classroomIds)
        .is("deleted_at", null);

      studentList = stdData || [];
      const studentIds = studentList.map((s) => s.id);
      const studentMap = new Map(studentList.map((s) => [s.id, s]));

      if (studentIds.length > 0) {
        // 4. Récupérer les child_profiles
        const { data: cpData } = await supabase
          .from("child_profiles")
          .select("id, student_id")
          .in("student_id", studentIds);

        childProfiles = cpData || [];
        const profileIds = childProfiles.map((cp) => cp.id);
        const studentToProfileMap = new Map(childProfiles.map((cp) => [cp.student_id, cp.id]));
        const profileToStudentMap = new Map(childProfiles.map((cp) => [cp.id, cp.student_id]));

        if (profileIds.length > 0) {
          // 5. Récupérer dessins et livres en parallèle
          const [drData, bkData, actData] = await Promise.all([
            supabase
              .from("saved_drawings")
              .select("id, profile_id")
              .in("profile_id", profileIds)
              .in("status", ["terminé", "completed"]),
            supabase
              .from("books")
              .select("id, profile_id")
              .in("profile_id", profileIds)
              .eq("status", "finalized"),
            supabase
              .from("student_activities")
              .select("profile_id, created_at")
              .in("profile_id", profileIds)
              .eq("action", "login")
              .gte("created_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
          ]);

          drawings = drData.data || [];
          books = bkData.data || [];
          if (actData.data) {
            actData.data.forEach((act: any) => activeTodayProfiles.add(act.profile_id));
          }

          // 6. Récupérer les 10 dernières activités toutes classes confondues
          const { data: rawActivities } = await supabase
            .from("student_activities")
            .select("*")
            .in("profile_id", profileIds)
            .order("created_at", { ascending: false })
            .limit(10);

          if (rawActivities) {
            const classroomMap = new Map(activeClassrooms.map((c) => [c.id, c.name]));

            recentActivities = rawActivities.map((act: any) => {
              const studentId = profileToStudentMap.get(act.profile_id);
              const student = studentMap.get(studentId);
              const studentName = student ? (student.display_name || student.first_name) : "Élève";
              const classId = student?.classroom_id || "";
              const classroomName = classroomMap.get(classId) || "Classe";

              return {
                ...act,
                student_name: studentName,
                classroom_name: classroomName,
              };
            });
          }
        }
      }
    }

    // 7. Agréger les statistiques des classes
    const studentToProfileMap = new Map(childProfiles.map((cp) => [cp.student_id, cp.id]));
    const classroomWithStatsList: ClassroomWithStats[] = activeClassrooms.map((classroom) => {
      const classStudents = studentList.filter((s) => s.classroom_id === classroom.id);
      const classProfileIds = classStudents
        .map((s) => studentToProfileMap.get(s.id))
        .filter(Boolean) as string[];

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

    // 8. Calculer le résumé global
    const total_students = studentList.length;
    const active_today_total = studentList.filter((s) => {
      const profId = studentToProfileMap.get(s.id);
      return profId ? activeTodayProfiles.has(profId) : false;
    }).length;
    const total_drawings_all = drawings.length;
    const total_books_all = books.length;

    const dashboardData: DashboardData = {
      stars: starsInfo,
      classrooms: classroomWithStatsList,
      recent_activity: recentActivities,
      summary: {
        total_students,
        active_today: active_today_total,
        total_drawings: total_drawings_all,
        total_books: total_books_all,
      },
    };

    return NextResponse.json(dashboardData);
  } catch (error: any) {
    console.error("Error loading dashboard data:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors du chargement des données." },
      { status: 500 }
    );
  }
}
