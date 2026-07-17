// ============================================================
// Petit Baobab — API Route de Connexion Élève (Phase 3.2)
// ============================================================

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { signStudentToken } from "@/lib/auth/student-session";
import { StudentLoginInput, StudentLoginResponse } from "@/types/school";

export async function POST(request: Request) {
  try {
    const body: StudentLoginInput = await request.json().catch(() => ({}));
    const { class_code: rawCode, first_name: rawName, student_id } = body;

    // 1. Sanitize inputs
    const classCode = typeof rawCode === "string" ? rawCode.toUpperCase().trim() : "";
    const firstName = typeof rawName === "string" ? rawName.trim() : "";

    // 2. Valider les champs
    if (!classCode) {
      return NextResponse.json(
        { error: "Veuillez entrer le code de votre classe." },
        { status: 400 }
      );
    }
    if (firstName.length < 2 || firstName.length > 50) {
      return NextResponse.json(
        { error: "Le prénom doit contenir entre 2 et 50 caractères." },
        { status: 400 }
      );
    }

    // On utilise supabase admin car pas de session utilisateur authentifiée via supabase auth
    const supabaseAdmin = getSupabaseAdmin();

    // 3. Chercher la classe active
    const { data: classroom, error: classErr } = await supabaseAdmin
      .from("classrooms")
      .select("id, name, account_id")
      .eq("class_code", classCode)
      .is("archived_at", null)
      .single();

    if (classErr || !classroom) {
      return NextResponse.json(
        { error: "Code de classe invalide." },
        { status: 404 }
      );
    }

    let student: any = null;

    // 4. Si student_id est fourni, on sélectionne directement l'élève
    if (student_id) {
      const { data: stData, error: stErr } = await supabaseAdmin
        .from("school_students")
        .select("id, first_name, display_name, mascot, classroom_id")
        .eq("id", student_id)
        .eq("classroom_id", classroom.id)
        .is("deleted_at", null)
        .single();

      if (stErr || !stData) {
        return NextResponse.json(
          { error: "Élève introuvable dans cette classe." },
          { status: 404 }
        );
      }
      student = stData;
    } else {
      // 5. Sinon, chercher par prénom (insensible à la casse)
      const { data: students, error: stdErr } = await supabaseAdmin
        .from("school_students")
        .select("id, first_name, display_name, mascot, classroom_id")
        .eq("classroom_id", classroom.id)
        .ilike("first_name", firstName)
        .is("deleted_at", null);

      if (stdErr || !students || students.length === 0) {
        return NextResponse.json(
          { error: "Prénom introuvable dans cette classe." },
          { status: 404 }
        );
      }

      // 6. Gestion des homonymes (plusieurs élèves avec le même prénom dans la classe)
      if (students.length > 1) {
        return NextResponse.json({
          multiple: true,
          students: students.map((s) => ({
            id: s.id,
            display_name: s.display_name || s.first_name,
            mascot: s.mascot,
          })),
        });
      }

      student = students[0];
    }

    // 7. Récupérer le child_profile lié à cet élève
    const { data: childProfile, error: profileErr } = await supabaseAdmin
      .from("child_profiles")
      .select("id, name, mascot")
      .eq("student_id", student.id)
      .single();

    if (profileErr || !childProfile) {
      return NextResponse.json(
        { error: "Profil de jeu introuvable pour cet élève." },
        { status: 404 }
      );
    }

    // 8. Récupérer le solde d'étoiles du compte de l'école
    const { data: account, error: accErr } = await supabaseAdmin
      .from("accounts")
      .select("stars_balance")
      .eq("id", classroom.account_id)
      .single();

    if (accErr || !account) {
      return NextResponse.json(
        { error: "Compte de l'école introuvable." },
        { status: 404 }
      );
    }

    // 9. Signer le JWT élève
    const responsePayload: StudentLoginResponse = {
      profile_id: childProfile.id,
      student_id: student.id,
      classroom_id: classroom.id,
      name: student.display_name || student.first_name,
      mascot: student.mascot,
      classroom_name: classroom.name,
      stars_balance: account.stars_balance || 0,
      type: "student",
    };

    const token = await signStudentToken(responsePayload);

    // 10. Poser le cookie HTTP-only 'sb-student-token'
    const cookieStore = await cookies();
    cookieStore.set("sb-student-token", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 604800, // 7 jours
      path: "/",
    });

    // Optionnel : poser un cookie client non HTTP-only pour que le client useSessionType sache qu'on est connecté
    cookieStore.set("sb-student-session-active", "true", {
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 604800,
      path: "/",
    });

    // 11. Insérer l'activité 'login' dans student_activities
    await supabaseAdmin.from("student_activities").insert({
      profile_id: childProfile.id,
      action: "login",
      stars_used: 0,
      points_earned: 0,
      metadata: { browser: request.headers.get("user-agent") || "unknown" },
    });

    // 12. Retourner la réponse de succès
    return NextResponse.json(responsePayload);
  } catch (error: any) {
    console.error("Student login error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la connexion." },
      { status: 500 }
    );
  }
}
