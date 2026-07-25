// ============================================================
// Petit Baobab — API Liste des élèves (Espace Enseignant)
// ============================================================
// GET /api/school/students/list
// Retourne tous les élèves de l'enseignant (toutes classes actives)
// avec leurs statistiques : classe, nb activités, étoiles,
// dernière activité et statut (actif / peu actif / inactif).

import { NextResponse } from "next/server";
import { getTeacherSession } from "@/lib/school-auth";

export async function GET() {
  const { errorResponse, account, supabase } = await getTeacherSession();
  if (errorResponse) return errorResponse;
  if (!account || !supabase) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const accountId = account.id;

    // 1. Classes actives de l'enseignant
    const { data: classrooms, error: classErr } = await supabase
      .from("classrooms")
      .select("id, name, class_code, account_id")
      .eq("account_id", accountId)
      .is("archived_at", null);

    if (classErr || !classrooms) {
      console.error("Students list API: error fetching classrooms:", classErr);
      return NextResponse.json({ error: "Erreur récupération classes" }, { status: 500 });
    }

    if (classrooms.length === 0) {
      return NextResponse.json({ students: [], classes: [] });
    }

    const classroomIds = classrooms.map((c: any) => c.id);
    const classMap = new Map(classrooms.map((c: any) => [c.id, c]));

    // 2. Élèves non supprimés
    const { data: students, error: stdErr } = await supabase
      .from("school_students")
      .select("id, classroom_id, first_name, last_name, display_name, mascot, created_at")
      .in("classroom_id", classroomIds)
      .is("deleted_at", null)
      .order("created_at", { ascending: true });

    if (stdErr) {
      console.error("Students list API: error fetching students:", stdErr);
      return NextResponse.json({ error: "Erreur récupération élèves" }, { status: 500 });
    }

    const studentList = students || [];
    const studentIds = studentList.map((s: any) => s.id);
    const studentMap = new Map(studentList.map((s: any) => [s.id, s]));

    // 3. Profils enfants liés
    let childProfiles: any[] = [];
    if (studentIds.length > 0) {
      const { data: cpData } = await supabase
        .from("child_profiles")
        .select("id, student_id, name, mascot")
        .in("student_id", studentIds);
      childProfiles = cpData || [];
    }

    const profileIds = childProfiles.map((cp: any) => cp.id);
    const studentToProfileMap = new Map(
      childProfiles.map((cp: any) => [cp.student_id, cp.id])
    );

    // 4. Dessins terminés, livres finalisés, activités
    let drawings: any[] = [];
    let books: any[] = [];
    let activities: any[] = [];

    if (profileIds.length > 0) {
      const [drRes, bkRes, actRes] = await Promise.all([
        supabase
          .from("saved_drawings")
          .select("id, profile_id, created_at")
          .in("profile_id", profileIds)
          .in("status", ["terminé", "completed"]),
        supabase
          .from("books")
          .select("id, profile_id, created_at")
          .in("profile_id", profileIds)
          .eq("status", "finalized"),
        supabase
          .from("student_activities")
          .select("id, profile_id, action, points_earned, stars_used, created_at")
          .in("profile_id", profileIds)
          .order("created_at", { ascending: false }),
      ]);
      drawings = drRes.data || [];
      books = bkRes.data || [];
      activities = actRes.data || [];
    }

    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;

    // 5. Composer la liste enrichie
    const enriched = studentList.map((s: any) => {
      const profileId = studentToProfileMap.get(s.id);
      const classObj = classMap.get(s.classroom_id);

      const studentDrawings = drawings.filter((d: any) => d.profile_id === profileId);
      const studentBooks = books.filter((b: any) => b.profile_id === profileId);
      const studentActivities = activities.filter((a: any) => a.profile_id === profileId);

      const activitiesCount = studentDrawings.length + studentBooks.length + studentActivities.length;

      const stars =
        studentActivities.reduce((sum: number, a: any) => sum + (a.points_earned || 0), 0) -
        studentActivities.reduce((sum: number, a: any) => sum + (a.stars_used || 0), 0);

      const lastActive = studentActivities.length > 0 ? studentActivities[0].created_at : null;
      const lastActiveTs = lastActive ? new Date(lastActive).getTime() : null;

      // Statut : actif < 7j, peu actif < 30j, inactif sinon
      let status: "actif" | "peu_actif" | "inactif" = "inactif";
      if (lastActiveTs) {
        const diff = now - lastActiveTs;
        if (diff < 7 * DAY) status = "actif";
        else if (diff < 30 * DAY) status = "peu_actif";
      }

      // Badges dérivés de la gamification
      const badges: string[] = [];
      if (studentDrawings.length >= 1) badges.push("dessin");
      if (studentBooks.length >= 1) badges.push("livre");
      if (studentActivities.length >= 1) badges.push("actif");

      return {
        id: s.id,
        classroom_id: s.classroom_id,
        first_name: s.first_name,
        last_name: s.last_name,
        display_name: s.display_name,
        mascot: s.mascot || "bobo",
        profile_id: profileId || null,
        classroom_name: classObj?.name || "Classe",
        class_code: classObj?.class_code || "",
        activities_count: activitiesCount,
        drawings_count: studentDrawings.length,
        books_count: studentBooks.length,
        stars: Math.max(0, stars),
        last_active: lastActive,
        status,
        badges,
      };
    });

    // 6. KPI globaux pour le panneau latéral
    const kpis = {
      total_students: enriched.length,
      active_students: enriched.filter((s: any) => s.status === "actif").length,
      little_active_students: enriched.filter((s: any) => s.status === "peu_actif").length,
      inactive_students: enriched.filter((s: any) => s.status === "inactif").length,
      activities_this_week: activities.filter(
        (a: any) => now - new Date(a.created_at).getTime() < 7 * DAY
      ).length,
      stars_earned_this_week: activities
        .filter((a: any) => now - new Date(a.created_at).getTime() < 7 * DAY)
        .reduce((sum: number, a: any) => sum + (a.points_earned || 0), 0),
    };

    return NextResponse.json({
      students: enriched,
      classes: classrooms.map((c: any) => ({ id: c.id, name: c.name, class_code: c.class_code })),
      kpis,
    });
  } catch (error: any) {
    console.error("Students list API GET error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération des élèves." },
      { status: 500 }
    );
  }
}
