// ============================================================
// Petit Baobab — Middleware multi-rôles (Phase 5)
// ============================================================

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyStudentToken } from "@/lib/auth/student-session";

const ADULT_TOKEN = "sb-access-token";
const STUDENT_TOKEN = "sb-student-token";

// Routes enfant accessibles aux élèves (token étudiant) ou aux adultes
const CHILD_ROUTES = ["/dashboard", "/dashboardstudent", "/coloriage", "/magic-drawing", "/livres-de-coloriage", "/mes-livres", "/parametres"];

// Route parent (adulte uniquement) : un élève y est renvoyé vers son espace.
const PARENT_ROUTES = ["/dashboard"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const adultToken = request.cookies.get(ADULT_TOKEN)?.value;
  const studentToken = request.cookies.get(STUDENT_TOKEN)?.value;

  // BLOC 1 — Protéger /school/dashboard (enseignants uniquement)
  if (pathname.startsWith("/school/dashboard")) {
    // Un élève ne peut JAMAIS y accéder, même avec son token.
    if (!adultToken) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("space", "school");
      return NextResponse.redirect(url);
    }
    // Routage par rôle : seul un compte enseignant (pb-role=teacher) peut
    // accéder à l'espace école. Un parent est redirigé vers son espace.
    const role = request.cookies.get("pb-role")?.value;
    if (role && role !== "teacher") {
      const url = request.nextUrl.clone();
      url.pathname = "/parents";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // BLOC 2 — Routes enfant : adulte OU élève
  const isChildRoute = CHILD_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`));
  if (isChildRoute) {
    // /dashboard est l'espace PARENT : un élève (token étudiant, pas adulte)
    // doit être renvoyé vers son espace dédié /dashboardstudent.
    const isParentRoute = PARENT_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`));
    if (isParentRoute && !adultToken && studentToken) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboardstudent";
      return NextResponse.redirect(url);
    }

    if (!adultToken) {
      if (studentToken) {
        // Décoder le JWT élève pour injecter les identifiants nécessaires en aval
        // (magic-drawing/route.ts exige x-classroom-id et x-profile-id).
        const session = await verifyStudentToken(studentToken);
        const headers = new Headers(request.headers);
        headers.set("x-session-type", "student");
        if (session) {
          if (session.classroom_id) headers.set("x-classroom-id", session.classroom_id);
          if (session.profile_id) headers.set("x-profile-id", session.profile_id);
          if (session.student_id) headers.set("x-student-id", session.student_id);
          if (session.name) headers.set("x-student-name", session.name);
        }
        return NextResponse.next({ request: { headers } });
      }
      const url = request.nextUrl.clone();
      url.pathname = "/school";
      return NextResponse.redirect(url);
    }
  }

  // BLOC 3 — /school (exact), /login, /signup restent publics
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/school/dashboard/:path*",
    "/dashboard/:path*",
    "/dashboardstudent/:path*",
    "/coloriage/:path*",
    "/magic-drawing/:path*",
    "/livres-de-coloriage/:path*",
    "/mes-livres/:path*",
    "/parametres/:path*",
  ],
};
