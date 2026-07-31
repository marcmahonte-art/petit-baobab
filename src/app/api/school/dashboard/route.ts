import { NextResponse } from "next/server";
import { getTeacherSession } from "@/lib/school-auth";

/**
 * GET /api/school/dashboard
 * Retourne toutes les données nécessaires au tableau de bord enseignant.
 * Centralise les données et calcule dynamiquement toutes les métriques requises.
 */
export async function GET() {
  const { errorResponse, account, supabase, user } = await getTeacherSession();
  if (errorResponse) return errorResponse;
  if (!account || !supabase) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  // Nom réel de l'enseignant = auth.users.user_metadata (source de vérité unique
  // pour le profil admin). La table `profiles` ne contient PAS full_name/avatar_url.
  const teacherName =
    (user?.user_metadata?.full_name as string | undefined) ||
    (user?.user_metadata?.name as string | undefined) ||
    (user?.email ? user.email.split("@")[0].replace(/[._-]/g, " ") : null) ||
    "Enseignant";

  const teacherAvatar = (user?.user_metadata?.avatar_url as string | undefined) || null;

  try {
    const accountId = account.id;

    // 1️⃣ Récupérer les classes actives de l'enseignant
    const { data: classrooms, error: classErr } = await supabase
      .from("classrooms")
      .select("*")
      .eq("account_id", accountId)
      .is("archived_at", null)
      .order("created_at", { ascending: false });

    if (classErr || !classrooms) {
      console.error("Dashboard API: error fetching classrooms:", classErr);
      return NextResponse.json({ error: "Erreur récupération classes" }, { status: 500 });
    }

    if (classrooms.length === 0) {
      // Retourner un état vide propre si aucune classe n'existe
      return NextResponse.json({
        teacher: {
          name: teacherName,
          role: "Enseignant",
          avatar: teacherAvatar,
          school_name: (account as any).school_name || null,
        },
        stars: {
          balance: account.stars_balance || 0,
          monthly_limit: account.plan === "ecole_pro" ? 1000 : 0,
          consumed_this_month: 0,
          renewal_date: account.plan_renewed_at ? new Date(account.plan_renewed_at).toISOString() : null,
          remaining: account.stars_balance || 0,
        },
        classrooms: [],
        recent_activity: [],
        stars_usage: {
          coloriages: 0,
          livres: 0,
          activites: 0,
          bonus: 0,
          autres: 0,
        },
        summary: {
          total_classes: 0,
          total_students: 0,
          active_today: 0,
          total_drawings: 0,
          total_coloriages: 0,
          total_books: 0,
          stars_earned_this_week: 0,
        },
      });
    }

    const classroomIds = classrooms.map((c) => c.id);

    // 2️⃣ Récupérer les élèves non supprimés
    const { data: students } = await supabase
      .from("school_students")
      .select("id, classroom_id, first_name, display_name, mascot")
      .in("classroom_id", classroomIds)
      .is("deleted_at", null);

    const studentList = students || [];
    const studentIds = studentList.map((s) => s.id);
    const studentMap = new Map(studentList.map((s) => [s.id, s]));

    // 3️⃣ Récupérer les profils enfants
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

    // 4️⃣ Récupérer les dessins terminés
    let drawings: any[] = [];
    if (profileIds.length > 0) {
      const { data: drData } = await supabase
        .from("saved_drawings")
        .select("id, profile_id, stars_cost, created_at, origin")
        .in("profile_id", profileIds)
        .in("status", ["terminé", "completed"]);
      drawings = drData || [];
    }

    // 5️⃣ Récupérer les livres finalisés
    let books: any[] = [];
    if (profileIds.length > 0) {
      const { data: bkData } = await supabase
        .from("books")
        .select("id, profile_id, created_at")
        .in("profile_id", profileIds)
        .eq("status", "finalized");
      books = bkData || [];
    }

    // 6️⃣ Récupérer les 10 dernières activités globales
    let recentActivities: any[] = [];
    if (profileIds.length > 0) {
      const { data: actData } = await supabase
        .from("student_activities")
        .select("id, profile_id, action, stars_used, points_earned, metadata, created_at")
        .in("profile_id", profileIds)
        .order("created_at", { ascending: false })
        .limit(10);
      recentActivities = actData || [];
    }

    // 7️⃣ Récupérer les connexions d'aujourd'hui (dernières 24h)
    const activeTodayProfiles = new Set<string>();
    if (profileIds.length > 0) {
      const startOfToday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const { data: loginActs } = await supabase
        .from("student_activities")
        .select("profile_id")
        .in("profile_id", profileIds)
        .eq("action", "login")
        .gte("created_at", startOfToday.toISOString());

      if (loginActs) {
        loginActs.forEach((act) => activeTodayProfiles.add(act.profile_id));
      }
    }

    // 8️⃣ Récupérer les transactions d'étoiles
    const { data: transactions } = await supabase
      .from("stars_transactions")
      .select("amount, reason, created_at")
      .eq("account_id", accountId)
      .order("created_at", { ascending: false });

    const txList = transactions || [];

    // ────────────────────────────────────────────────────────────
    // CALCULS ET AGREGATIONS
    // ────────────────────────────────────────────────────────────

    // A. Calcul de la consommation d'étoiles par catégorie (transactions négatives)
    let starUsageColoriages = 0;
    let starUsageLivres = 0;
    let starUsageActivites = 0;
    let starUsageBonus = 0;
    let starUsageAutres = 0;

    txList.forEach((tx) => {
      const amount = Math.abs(tx.amount);
      if (tx.amount < 0) {
        if (tx.reason === "generation") {
          starUsageColoriages += amount;
        } else if (tx.reason === "book_created") {
          starUsageLivres += amount;
        } else if (tx.reason === "activity_completed") {
          starUsageActivites += amount;
        } else {
          starUsageAutres += amount;
        }
      } else {
        if (tx.reason === "signup_bonus" || tx.reason === "admin_grant") {
          starUsageBonus += amount;
        }
      }
    });

    // B. Étoiles gagnées cette semaine (7 derniers jours)
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);
    const starsEarnedThisWeek = txList
      .filter((tx) => tx.amount > 0 && new Date(tx.created_at) >= startOfWeek)
      .reduce((sum, tx) => sum + tx.amount, 0);

    // C. Formater les classes avec statistiques
    const badgeColors = ["#7D6AF8", "#FF9500", "#20C997", "#1194FF", "#FF5E83"];
    
    const formattedClassrooms = classrooms.map((classroom, index) => {
      const classStudents = studentList.filter((s) => s.classroom_id === classroom.id);
      const classStudentIds = classStudents.map((s) => s.id);
      const classProfileIds = childProfiles
        .filter((cp) => classStudentIds.includes(cp.student_id))
        .map((cp) => cp.id);

      const classDrawings = drawings.filter((d) => classProfileIds.includes(d.profile_id));
      const classBooks = books.filter((b) => classProfileIds.includes(b.profile_id));

      const total_drawings = classDrawings.length;
      const total_books = classBooks.length;

      // Calcul de la progression
      const completed = total_drawings + total_books;
      const targetActivities = Math.max(5, classStudents.length * 5); // Cible : 5 par élève
      const completion_percentage = Math.min(100, Math.round((completed / targetActivities) * 100));

      // Trouver la date de la dernière activité
      let last_activity_at: string | null = classroom.created_at;
      if (completed > 0) {
        const dates = [
          ...classDrawings.map((d) => new Date(d.created_at).getTime()),
          ...classBooks.map((b) => new Date(b.created_at).getTime()),
        ];
        last_activity_at = new Date(Math.max(...dates)).toISOString();
      }

      // Actifs aujourd'hui dans cette classe
      const active_today = classStudents.filter((s) => {
        const profId = studentToProfileMap.get(s.id);
        return profId ? activeTodayProfiles.has(profId) : false;
      }).length;

      return {
        ...classroom,
        student_count: classStudents.length,
        active_today,
        total_drawings,
        total_books,
        completion_percentage,
        last_activity_at,
        color_badge: badgeColors[index % badgeColors.length],
        illustration_index: (index % 6) + 1,
      };
    });

    // D. Formater les activités récentes
    const formattedRecentActivity = recentActivities.map((act) => {
      const studentId = profileToStudentMap.get(act.profile_id);
      const student = studentId ? studentMap.get(studentId) : null;
      const studentName = student ? (student.display_name || student.first_name) : "Élève";
      
      const classObj = classrooms.find((c) => c.id === student?.classroom_id);
      const classroomName = classObj ? classObj.name : "Classe";

      let actionLabel = "a fait une activité";
      let actionDetail = "";
      if (act.action === "drawing_created") {
        actionLabel = "a terminé un coloriage";
        actionDetail = act.metadata?.theme ? `Thème : ${act.metadata.theme}` : "";
      } else if (act.action === "book_created") {
        actionLabel = "a créé un livre";
        actionDetail = act.metadata?.title ? `Titre : ${act.metadata.title}` : "";
      } else if (act.action === "badge_earned") {
        actionLabel = "a gagné un badge";
        actionDetail = act.metadata?.badge ? `Badge : ${act.metadata.badge}` : "";
      } else if (act.action === "activity_completed") {
        actionLabel = "a terminé une activité";
        actionDetail = act.metadata?.activity ? `Activité : ${act.metadata.activity}` : "";
      } else if (act.action === "login") {
        actionLabel = "s'est connecté";
      }

      return {
        ...act,
        student_name: studentName,
        classroom_name: classroomName,
        stars_earned: act.points_earned || 0,
        action_label: actionLabel,
        action_detail: actionDetail,
        student_avatar: null,
      };
    });

    // E. Total de connexions uniques d'élèves aujourd'hui
    const activeTodayTotal = studentList.filter((s) => {
      const profId = studentToProfileMap.get(s.id);
      return profId ? activeTodayProfiles.has(profId) : false;
    }).length;

    // F. Composer la réponse finale
    const response = {
      teacher: {
        name: teacherName,
        role: "Enseignante",
        avatar: teacherAvatar,
        school_name: (account as any).school_name || null,
      },
      stars: {
        balance: account.stars_balance || 0,
        monthly_limit: account.plan === "ecole_pro" ? 1000 : 0,
        consumed_this_month: Math.abs(
          txList
            .filter((tx) => tx.amount < 0 && new Date(tx.created_at).getMonth() === new Date().getMonth())
            .reduce((sum, tx) => sum + tx.amount, 0)
        ),
        renewal_date: account.plan_renewed_at ? new Date(account.plan_renewed_at).toISOString() : null,
        remaining: account.stars_balance || 0,
        account_id: account.id,
      },
      classrooms: formattedClassrooms,
      recent_activity: formattedRecentActivity,
      stars_usage: {
        coloriages: starUsageColoriages,
        livres: starUsageLivres,
        activites: starUsageActivites,
        bonus: starUsageBonus,
        autres: starUsageAutres,
      },
      summary: {
        total_classes: classrooms.length,
        total_students: studentList.length,
        active_today: activeTodayTotal,
        total_drawings: drawings.length,
        total_coloriages: drawings.length,
        total_books: books.length,
        stars_earned_this_week: starsEarnedThisWeek || 0,
      },
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Dashboard API GET error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération des données." },
      { status: 500 }
    );
  }
}
