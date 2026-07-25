// ============================================================
// Petit Baobab — API Élèves Création en Lot (Phase 4.4)
// ============================================================

import { NextResponse } from "next/server";
import { getTeacherSession } from "@/lib/school-auth";
import { CreateStudentsBulkInput, StudentWithProfile } from "@/types/school";

export async function POST(request: Request) {
  const { errorResponse, account, supabase } = await getTeacherSession();
  if (errorResponse) return errorResponse;
  if (!account || !supabase) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const body: CreateStudentsBulkInput = await request.json().catch(() => ({}));
    const { classroom_id: classroomId, students: newStudentsInput } = body;

    if (!classroomId) {
      return NextResponse.json(
        { error: "L'identifiant de la classe est obligatoire." },
        { status: 400 }
      );
    }

    if (!Array.isArray(newStudentsInput) || newStudentsInput.length === 0) {
      return NextResponse.json(
        { error: "Veuillez fournir une liste d'élèves à ajouter." },
        { status: 400 }
      );
    }

    // 1. Vérifier que la classe existe et appartient bien à l'enseignant
    const { data: classroom, error: classErr } = await supabase
      .from("classrooms")
      .select("id, name")
      .eq("id", classroomId)
      .eq("account_id", account.id)
      .is("archived_at", null)
      .single();

    if (classErr || !classroom) {
      return NextResponse.json(
        { error: "Classe introuvable ou accès non autorisé." },
        { status: 404 }
      );
    }

    // 2. Vérifier le nombre d'élèves existants dans cette classe
    const { count: currentCount, error: countErr } = await supabase
      .from("school_students")
      .select("*", { count: "exact", head: true })
      .eq("classroom_id", classroomId)
      .is("deleted_at", null);

    if (countErr) {
      console.error("Error counting students:", countErr);
      return NextResponse.json(
        { error: "Impossible de vérifier la limite d'élèves." },
        { status: 500 }
      );
    }

    const currentCountVal = currentCount || 0;
    const totalAfterAddition = currentCountVal + newStudentsInput.length;

    if (totalAfterAddition > 60) {
      return NextResponse.json(
        {
          error: "classroom_limit_reached",
          message: `Une classe ne peut pas contenir plus de 60 élèves. Il y a actuellement ${currentCountVal} élèves. Vous ne pouvez en ajouter que ${60 - currentCountVal} de plus.`,
        },
        { status: 422 }
      );
    }

    const createdStudents: StudentWithProfile[] = [];

    // 3. Ajouter les élèves de façon transactionnelle (ou séquentielle propre)
    for (const std of newStudentsInput) {
      const firstName = typeof std.first_name === "string" ? std.first_name.trim() : "";
      const lastName = typeof std.last_name === "string" ? std.last_name.trim() : null;
      const displayName = typeof std.display_name === "string" ? std.display_name.trim() : null;
      const mascot = std.mascot && ["bobo", "kaya", "zuri", "momo", "kiki", "baobab"].includes(std.mascot) ? std.mascot : "bobo";

      if (!firstName || firstName.length < 2 || firstName.length > 50) {
        continue; // Passer les élèves invalides
      }

      // a. Insérer l'élève
      const { data: schoolStudent, error: insertStdErr } = await supabase
        .from("school_students")
        .insert({
          classroom_id: classroomId,
          first_name: firstName,
          last_name: lastName,
          display_name: displayName,
          mascot: mascot,
        })
        .select("*")
        .single();

      if (insertStdErr || !schoolStudent) {
        console.error("Failed to insert student:", insertStdErr);
        continue;
      }

      // b. Créer le child_profile lié à cet élève
      const { data: childProfile, error: insertProfErr } = await supabase
        .from("child_profiles")
        .insert({
          account_id: account.id,
          name: displayName || firstName,
          mascot: mascot,
          pin_required: false,
          student_id: schoolStudent.id,
          classroom_id: classroomId,
        })
        .select("*")
        .single();

      if (insertProfErr || !childProfile) {
        console.error("Failed to create child profile for student:", insertProfErr);
        // Clean up the student to keep integrity
        await supabase.from("school_students").delete().eq("id", schoolStudent.id);
        continue;
      }

      // c. Ajouter à la liste finale
      createdStudents.push({
        ...schoolStudent,
        profile_id: childProfile.id,
        points: 0,
        badges: [],
        drawings_count: 0,
        books_count: 0,
        last_active: null,
      });
    }

    return NextResponse.json({
      created: createdStudents.length,
      students: createdStudents,
    });
  } catch (error: any) {
    console.error("Error in students POST bulk API:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'ajout des élèves." },
      { status: 500 }
    );
  }
}
