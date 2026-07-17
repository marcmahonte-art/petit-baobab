// ============================================================
// Petit Baobab — API Activités Élève et Stats (Phase 4.7)
// ============================================================

import { NextResponse } from "next/server";
import { getTeacherSession } from "@/lib/school-auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { errorResponse, account, supabase } = await getTeacherSession();
  if (errorResponse) return errorResponse;
  if (!account || !supabase) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id: studentId } = await params;
  const { searchParams } = new URL(request.url);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const from = searchParams.get("from"); // ISO Date
  const to = searchParams.get("to"); // ISO Date

  const offset = (page - 1) * limit;

  try {
    // 1. Récupérer l'élève
    const { data: student, error: stdErr } = await supabase
      .from("school_students")
      .select("id, first_name, display_name, classroom_id")
      .eq("id", studentId)
      .single();

    if (stdErr || !student) {
      return NextResponse.json({ error: "Élève introuvable." }, { status: 404 });
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

    // 3. Récupérer le nom de la classe
    const { data: classroom } = await supabase
      .from("classrooms")
      .select("name")
      .eq("id", student.classroom_id)
      .single();

    const classroomName = classroom?.name || "Classe";

    // 4. Bâtir la requête de base pour les activités
    let query = supabase
      .from("student_activities")
      .select("*", { count: "exact" })
      .eq("profile_id", childProfile.id);

    if (from) query = query.gte("created_at", from);
    if (to) query = query.lte("created_at", to);

    // Récupérer la page courante d'activités
    const { data: activities, count, error: actErr } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (actErr) {
      console.error("Error fetching activities:", actErr);
      return NextResponse.json({ error: "Erreur de base de données." }, { status: 500 });
    }

    const activityList = activities || [];
    const total = count || 0;
    const hasMore = offset + limit < total;

    // Formater le feed d'activité
    const studentName = student.display_name || student.first_name;
    const feed = activityList.map((act) => ({
      ...act,
      student_name: studentName,
      classroom_name: classroomName,
    }));

    // 5. Agréger par jour sur les 7 derniers jours pour le graphique d'activité
    const last7Days: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0]; // YYYY-MM-DD
      last7Days.push({ date: dateStr, count: 0 });
    }

    // Fetcher toutes les activités des 7 derniers jours pour ce profil
    const startOf7Days = new Date();
    startOf7Days.setDate(startOf7Days.getDate() - 7);
    startOf7Days.setHours(0, 0, 0, 0);

    const { data: recentActs } = await supabase
      .from("student_activities")
      .select("created_at")
      .eq("profile_id", childProfile.id)
      .gte("created_at", startOf7Days.toISOString());

    if (recentActs) {
      recentActs.forEach((act) => {
        const actDateStr = act.created_at.split("T")[0];
        const dayObj = last7Days.find((d) => d.date === actDateStr);
        if (dayObj) {
          dayObj.count++;
        }
      });
    }

    return NextResponse.json({
      activities: feed,
      total,
      has_more: hasMore,
      chart_data: last7Days,
    });
  } catch (error: any) {
    console.error("Error in student activity API:", error);
    return NextResponse.json({ error: "Une erreur est survenue." }, { status: 500 });
  }
}
