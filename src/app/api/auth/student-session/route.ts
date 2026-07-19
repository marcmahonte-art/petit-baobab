import { NextResponse } from "next/server";
import { getStudentSession } from "@/lib/auth/student-session";

/**
 * GET /api/auth/student-session
 * Renvoie la session élève décodée à partir du cookie httpOnly
 * 'sb-student-token'. Permet à l'espace élève (/dashboardstudent) de
 * restaurer son état après un rafraîchissement de page (le cookie étant
 * httpOnly, le client ne peut pas le lire directement).
 */
export async function GET() {
  const session = await getStudentSession();
  if (!session) {
    return NextResponse.json({ session: null }, { status: 200 });
  }
  return NextResponse.json({ session }, { status: 200 });
}
