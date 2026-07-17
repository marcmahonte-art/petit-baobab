// ============================================================
// Petit Baobab — API Importation CSV d'Élèves (Phase 4.5)
// ============================================================

import { NextResponse } from "next/server";
import { getTeacherSession } from "@/lib/school-auth";
import { StudentWithProfile } from "@/types/school";

export async function POST(request: Request) {
  const { errorResponse, account, supabase } = await getTeacherSession();
  if (errorResponse) return errorResponse;
  if (!account || !supabase) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const classroomId = formData.get("classroom_id") as string | null;

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier n'a été fourni." }, { status: 400 });
    }
    if (!classroomId) {
      return NextResponse.json({ error: "L'identifiant de la classe est requis." }, { status: 400 });
    }

    // 1. Vérifier que la classe appartient bien à l'enseignant
    const { data: classroom, error: classErr } = await supabase
      .from("classrooms")
      .select("id, name")
      .eq("id", classroomId)
      .eq("account_id", account.id)
      .is("archived_at", null)
      .single();

    if (classErr || !classroom) {
      return NextResponse.json({ error: "Classe introuvable." }, { status: 404 });
    }

    // 2. Lire le contenu du fichier
    const fileText = await file.text();

    // 3. Parser le CSV de façon robuste
    const lines = fileText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length < 2) {
      return NextResponse.json(
        { error: "Le fichier CSV est vide ou ne contient pas de données." },
        { status: 400 }
      );
    }

    const separator = lines[0].includes(";") ? ";" : ",";
    const headers = lines[0]
      .split(separator)
      .map((h) =>
        h
          .trim()
          .toLowerCase()
          .replace(/^["']|["']$/g, "")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "") // Enlever accents
      );

    const prenomIndex = headers.findIndex((h) => h === "prenom" || h === "first_name" || h === "first name");
    const nomIndex = headers.findIndex((h) => h === "nom" || h === "last_name" || h === "last name");

    if (prenomIndex === -1) {
      return NextResponse.json(
        { error: "La colonne 'prenom' (ou 'first_name') est obligatoire dans le fichier CSV." },
        { status: 400 }
      );
    }

    // 4. Récupérer les élèves déjà présents pour la déduplication
    const { data: existingStudents, error: existErr } = await supabase
      .from("school_students")
      .select("first_name, last_name")
      .eq("classroom_id", classroomId)
      .is("deleted_at", null);

    if (existErr) {
      console.error("Error fetching existing students:", existErr);
      return NextResponse.json({ error: "Erreur de base de données." }, { status: 500 });
    }

    const existingCount = existingStudents?.length || 0;
    const existingSet = new Set(
      existingStudents?.map(
        (s) => `${s.first_name.toLowerCase().trim()}|${(s.last_name || "").toLowerCase().trim()}`
      )
    );

    const studentsToInsert: { first_name: string; last_name: string | null }[] = [];
    const errors: string[] = [];
    let skipped = 0;

    // 5. Parcourir et valider chaque ligne
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(separator).map((c) => c.trim().replace(/^["']|["']$/g, ""));
      const rawPrenom = cols[prenomIndex];
      const rawNom = nomIndex !== -1 ? cols[nomIndex] : "";

      if (!rawPrenom) {
        errors.push(`Ligne ${i + 1} ignorée : Le prénom est vide.`);
        continue;
      }

      const prenom = rawPrenom.trim();
      const nom = rawNom ? rawNom.trim() : null;

      // Validation du prénom
      if (prenom.length < 2 || prenom.length > 50) {
        errors.push(`Ligne ${i + 1} ("${prenom}") ignorée : Le prénom doit faire entre 2 et 50 caractères.`);
        continue;
      }

      // Regex simple pour autoriser les lettres, espaces, traits d'union et accents
      const nameRegex = /^[A-Za-zÀ-ÿ\s'-]+$/;
      if (!nameRegex.test(prenom)) {
        errors.push(`Ligne ${i + 1} ("${prenom}") ignorée : Le prénom contient des caractères non autorisés.`);
        continue;
      }

      // Déduplication locale et base de données
      const key = `${prenom.toLowerCase()}|${(nom || "").toLowerCase()}`;
      if (existingSet.has(key)) {
        skipped++;
        continue;
      }

      // Éviter les doublons au sein du même CSV
      if (studentsToInsert.some((s) => `${s.first_name.toLowerCase()}|${(s.last_name || "").toLowerCase()}` === key)) {
        skipped++;
        continue;
      }

      studentsToInsert.push({
        first_name: prenom,
        last_name: nom,
      });
    }

    // 6. Vérifier la limite de 60 élèves
    if (existingCount + studentsToInsert.length > 60) {
      return NextResponse.json(
        {
          error: "classroom_limit_reached",
          message: `L'import dépasserait la limite de 60 élèves par classe. Classe actuelle : ${existingCount} élèves, Tentative d'ajout : ${studentsToInsert.length}.`,
        },
        { status: 422 }
      );
    }

    let imported = 0;
    const addedStudents: StudentWithProfile[] = [];

    // 7. Insérer les élèves validés
    for (const student of studentsToInsert) {
      const mascot = "awa"; // mascotte par défaut

      const { data: schoolStudent, error: insertStdErr } = await supabase
        .from("school_students")
        .insert({
          classroom_id: classroomId,
          first_name: student.first_name,
          last_name: student.last_name,
          mascot: mascot,
        })
        .select("*")
        .single();

      if (insertStdErr || !schoolStudent) {
        errors.push(`Erreur lors de l'insertion de l'élève ${student.first_name}.`);
        continue;
      }

      // Créer le child_profile lié
      const { data: childProfile, error: insertProfErr } = await supabase
        .from("child_profiles")
        .insert({
          account_id: account.id,
          name: student.first_name,
          mascot: mascot,
          pin_required: false,
          student_id: schoolStudent.id,
          classroom_id: classroomId,
        })
        .select("*")
        .single();

      if (insertProfErr || !childProfile) {
        console.error("Failed to create child profile in import:", insertProfErr);
        await supabase.from("school_students").delete().eq("id", schoolStudent.id);
        errors.push(`Erreur lors de la création du profil de jeu pour l'élève ${student.first_name}.`);
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

    return NextResponse.json({
      imported,
      skipped,
      errors,
      students: addedStudents,
    });
  } catch (error: any) {
    console.error("Error in students import API:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'importation." },
      { status: 500 }
    );
  }
}
