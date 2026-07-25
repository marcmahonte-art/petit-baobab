// ============================================================
// Petit Baobab — API Importation JSON d'Élèves (Phase 4.6)
// ============================================================

import { NextResponse } from "next/server";
import { getTeacherSession } from "@/lib/school-auth";
import { StudentWithProfile } from "@/types/school";

export async function POST(request: Request) {
  const { errorResponse, account, supabase } = await getTeacherSession();
  if (errorResponse) return errorResponse;
  if (!account || !supabase) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const body = await request.json();
    const classroomId: string | undefined = body?.classroom_id;
    const students: { first_name: string; last_name?: string; display_name?: string; mascot?: "bobo" | "kaya" | "zuri" | "momo" | "kiki" | "baobab" }[] = body?.students;

    if (!classroomId) {
      return NextResponse.json({ error: "L'identifiant de la classe est requis." }, { status: 400 });
    }
    if (!Array.isArray(students) || students.length === 0) {
      return NextResponse.json({ error: "Aucun élève fourni pour l'importation." }, { status: 400 });
    }

    // Verify classroom ownership
    const { data: classroom, error: classErr } = await supabase
      .from("classrooms")
      .select("id")
      .eq("id", classroomId)
      .eq("account_id", account.id)
      .is("archived_at", null)
      .single();
    if (classErr || !classroom) {
      return NextResponse.json({ error: "Classe introuvable." }, { status: 404 });
    }

    // Check existing student count
    const { data: existing, error: existErr } = await supabase
      .from("school_students")
      .select("id")
      .eq("classroom_id", classroomId)
      .is("deleted_at", null);
    if (existErr) {
      console.error("Error fetching existing students:", existErr);
      return NextResponse.json({ error: "Erreur de base de données." }, { status: 500 });
    }
    const existingCount = existing?.length || 0;
    if (existingCount + students.length > 60) {
      return NextResponse.json({
        error: "classroom_limit_reached",
        message: `L'import dépasserait la limite de 60 élèves par classe. Classe actuelle : ${existingCount} élèves, tentative d'ajout : ${students.length}.`
      }, { status: 422 });
    }

    const addedStudents: StudentWithProfile[] = [];
    let imported = 0;
    const errors: string[] = [];

    for (const stu of students) {
      const firstName = (stu.first_name || "").trim();
      if (firstName.length < 2 || firstName.length > 50) {
        errors.push(`Prénom invalide "${firstName}" – doit contenir entre 2 et 50 caractères.`);
        continue;
      }
      const nameRegex = /^[A-Za-zÀ-ÿ\s'-]+$/;
      if (!nameRegex.test(firstName)) {
        errors.push(`Prénom "${firstName}" contient des caractères non autorisés.`);
        continue;
      }
      const mascot = stu.mascot ?? "bobo";

      // Insert school student
      const { data: schoolStudent, error: insStdErr } = await supabase
        .from("school_students")
        .insert({
          classroom_id: classroomId,
          first_name: firstName,
          last_name: stu.last_name?.trim() ?? null,
          display_name: stu.display_name?.trim() ?? null,
          mascot: mascot,
        })
        .select("*")
        .single();
      if (insStdErr || !schoolStudent) {
        errors.push(`Erreur d'insertion pour ${firstName}.`);
        continue;
      }

      // Create child profile
      const { data: childProfile, error: profErr } = await supabase
        .from("child_profiles")
        .insert({
          account_id: account.id,
          name: firstName,
          mascot: mascot,
          pin_required: false,
          student_id: schoolStudent.id,
          classroom_id: classroomId,
        })
        .select("*")
        .single();
      if (profErr || !childProfile) {
        console.error("Failed to create child profile:", profErr);
        await supabase.from("school_students").delete().eq("id", schoolStudent.id);
        errors.push(`Erreur de création de profil pour ${firstName}.`);
        continue;
      }

      imported++;
      addedStudents.push({
        ...schoolStudent,
        profile_id: childProfile.id,
        points: 0,
        badges: [],
        drawings_count: 0,
        books_count: 0,
        last_active: null,
      });
    }

    return NextResponse.json({ imported, errors, students: addedStudents });
  } catch (error: any) {
    console.error("Error in bulk student import API:", error);
    return NextResponse.json({ error: "Une erreur est survenue lors de l'importation." }, { status: 500 });
  }
}
