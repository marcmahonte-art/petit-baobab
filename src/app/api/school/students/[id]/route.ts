// ============================================================
// Petit Baobab — API Élève Détail/Modif/Suppression (Phase 4.6)
// ============================================================

import { NextResponse } from "next/server";
import { getTeacherSession } from "@/lib/school-auth";
import { StudentWithProfile } from "@/types/school";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { errorResponse, account, supabase } = await getTeacherSession();
  if (errorResponse) return errorResponse;
  if (!account || !supabase) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id: studentId } = await params;

  try {
    // 1. Récupérer l'élève
    const { data: student, error: stdErr } = await supabase
      .from("school_students")
      .select("*")
      .eq("id", studentId)
      .is("deleted_at", null)
      .single();

    if (stdErr || !student) {
      return NextResponse.json({ error: "Élève introuvable." }, { status: 404 });
    }

    // 2. Vérifier que la classe de l'élève appartient bien à l'enseignant
    const { data: classroom, error: classErr } = await supabase
      .from("classrooms")
      .select("id, name, account_id")
      .eq("id", student.classroom_id)
      .eq("account_id", account.id)
      .is("archived_at", null)
      .single();

    if (classErr || !classroom) {
      return NextResponse.json({ error: "Classe non autorisée ou introuvable." }, { status: 403 });
    }

    // 3. Récupérer le child_profile lié
    const { data: childProfile, error: profErr } = await supabase
      .from("child_profiles")
      .select("*")
      .eq("student_id", studentId)
      .single();

    if (profErr || !childProfile) {
      return NextResponse.json({ error: "Profil de jeu introuvable." }, { status: 404 });
    }

    // 4. Récupérer le nombre de dessins, de livres et l'activité récente
    const [drawingsRes, booksRes, activitiesRes] = await Promise.all([
      supabase
        .from("saved_drawings")
        .select("id, image_url, style, status, created_at")
        .eq("profile_id", childProfile.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("books")
        .select("id, title, cover_image_url, pdf_url, status, created_at")
        .eq("profile_id", childProfile.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("student_activities")
        .select("*")
        .eq("profile_id", childProfile.id)
        .order("created_at", { ascending: false })
        .limit(30),
    ]);

    const drawings = drawingsRes.data || [];
    const books = booksRes.data || [];
    const activities = activitiesRes.data || [];

    // Déterminer la date de dernière activité
    const lastActive = activities.length > 0 ? activities[0].created_at : null;

    // Agréger les points et les badges (gamification standard de profile)
    // badges: par défaut on peut lire les badges dans child_profiles s'il y a un champ,
    // ou calculer selon les dessins/livres (comme dans profile-store.ts)
    // Dans 01_auth_stars_tables.sql, child_profiles n'a pas de colonne points ou badges.
    // Mais dans profile-store.ts, ils sont calculés localement, ou nous pouvons lire la table s'il y a des colonnes.
    // Lisons les points et badges dans child_profiles si présents, sinon on simule.
    // D'après 01_auth_stars_tables, child_profiles a (id, account_id, name, mascot, pin_required, created_at).
    // Donc les points et badges ne sont pas stockés dans child_profiles mais calculés ou stockés ailleurs.
    // Nous pouvons calculer les points : 10 points par dessin créé, 20 points par livre créé !
    const drawingsCount = drawings.filter((d: any) => d.status === "terminé" || d.status === "completed").length;
    const booksCount = books.filter((b: any) => b.status === "finalized").length;
    const points = drawingsCount * 10 + booksCount * 20;

    // Badges obtenus
    const badges: string[] = [];
    if (drawingsCount >= 1) badges.push("Super Artiste");
    if (drawingsCount >= 5) badges.push("Explorateur");
    if (booksCount >= 1) badges.push("Lecteur");

    const studentWithProfile: StudentWithProfile = {
      ...student,
      profile_id: childProfile.id,
      points,
      badges,
      drawings_count: drawingsCount,
      books_count: booksCount,
      last_active: lastActive,
    };

    return NextResponse.json({
      student: studentWithProfile,
      drawings: drawings.slice(0, 10), // 10 derniers dessins
      books: books.slice(0, 6), // 6 derniers livres
      activities, // 30 dernières activités
    });
  } catch (error: any) {
    console.error("Error fetching student details:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération du profil." },
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

  const { id: studentId } = await params;

  try {
    const body = await request.json().catch(() => ({}));
    const { display_name, mascot, classroom_id } = body;

    // 1. Récupérer l'élève
    const { data: student, error: stdErr } = await supabase
      .from("school_students")
      .select("*")
      .eq("id", studentId)
      .is("deleted_at", null)
      .single();

    if (stdErr || !student) {
      return NextResponse.json({ error: "Élève introuvable." }, { status: 404 });
    }

    // 2. Vérifier la classe
    const { data: classroom, error: classErr } = await supabase
      .from("classrooms")
      .select("id, account_id")
      .eq("id", student.classroom_id)
      .eq("account_id", account.id)
      .single();

    if (classErr || !classroom) {
      return NextResponse.json({ error: "Action non autorisée." }, { status: 403 });
    }

    // 3. Mettre à jour l'élève
    const updateData: Record<string, any> = {};
    if (typeof display_name === "string") updateData.display_name = display_name.trim();
    if (mascot && ["bobo", "kaya", "zuri", "momo", "kiki", "baobab"].includes(mascot)) updateData.mascot = mascot;

    // 3b. Changer de classe (avec vérification de propriété)
    if (typeof classroom_id === "string" && classroom_id && classroom_id !== student.classroom_id) {
      const { data: targetClass, error: targetErr } = await supabase
        .from("classrooms")
        .select("id")
        .eq("id", classroom_id)
        .eq("account_id", account.id)
        .is("archived_at", null)
        .single();

      if (targetErr || !targetClass) {
        return NextResponse.json({ error: "Classe cible introuvable ou non autorisée." }, { status: 403 });
      }

      // Vérifier la limite de 60 élèves dans la classe cible
      const { count: targetCount, error: countErr } = await supabase
        .from("school_students")
        .select("*", { count: "exact", head: true })
        .eq("classroom_id", classroom_id)
        .is("deleted_at", null);

      if (!countErr && (targetCount || 0) >= 60) {
        return NextResponse.json({ error: "La classe cible est déjà complète (60 élèves max)." }, { status: 422 });
      }

      updateData.classroom_id = classroom_id;
    }

    const { data: updatedStudent, error: updateStdErr } = await supabase
      .from("school_students")
      .update(updateData)
      .eq("id", studentId)
      .select("*")
      .single();

    if (updateStdErr || !updatedStudent) {
      return NextResponse.json({ error: "Impossible de modifier l'élève." }, { status: 500 });
    }

    // 4. Synchroniser avec child_profile
    const profileUpdate: Record<string, any> = {};
    if (updateData.display_name) profileUpdate.name = updateData.display_name;
    if (updateData.mascot) profileUpdate.mascot = updateData.mascot;
    if (updateData.classroom_id) profileUpdate.classroom_id = updateData.classroom_id;

    if (Object.keys(profileUpdate).length > 0) {
      await supabase
        .from("child_profiles")
        .update(profileUpdate)
        .eq("student_id", studentId);
    }

    return NextResponse.json(updatedStudent);
  } catch (error: any) {
    console.error("Error updating student:", error);
    return NextResponse.json({ error: "Une erreur est survenue." }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { errorResponse, account, supabase } = await getTeacherSession();
  if (errorResponse) return errorResponse;
  if (!account || !supabase) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id: studentId } = await params;

  try {
    // 1. Récupérer l'élève
    const { data: student, error: stdErr } = await supabase
      .from("school_students")
      .select("*")
      .eq("id", studentId)
      .is("deleted_at", null)
      .single();

    if (stdErr || !student) {
      return NextResponse.json({ error: "Élève introuvable." }, { status: 404 });
    }

    // 2. Vérifier la classe
    const { data: classroom, error: classErr } = await supabase
      .from("classrooms")
      .select("id, account_id")
      .eq("id", student.classroom_id)
      .eq("account_id", account.id)
      .single();

    if (classErr || !classroom) {
      return NextResponse.json({ error: "Action non autorisée." }, { status: 403 });
    }

    // 3. Dissocier le profil de jeu enfant lié
    await supabase
      .from("child_profiles")
      .update({ student_id: null, classroom_id: null })
      .eq("student_id", studentId);

    // 4. Soft delete de l'élève
    await supabase
      .from("school_students")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", studentId);

    return NextResponse.json({ success: true, message: "Élève retiré avec succès." });
  } catch (error: any) {
    console.error("Error deleting student:", error);
    return NextResponse.json({ error: "Une erreur est survenue." }, { status: 500 });
  }
}
