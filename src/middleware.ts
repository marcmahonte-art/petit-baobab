// ============================================================
// Petit Baobab — Middleware de Routage & Sécurité (Phase 3.3)
// ============================================================

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyStudentToken } from "@/lib/auth/student-session";

/**
 * Détermine le type de session active en inspectant les cookies.
 */
async function getSessionType(request: NextRequest) {
  // 1. Lire 'sb-student-token'
  const studentToken = request.cookies.get("sb-student-token")?.value;
  if (studentToken) {
    const payload = await verifyStudentToken(studentToken);
    if (payload) {
      return {
        type: "student" as const,
        profileId: payload.profile_id,
        classroomId: payload.classroom_id,
      };
    }
  }

  // 2. Lire 'sb-access-token' (Supabase Auth Parent)
  const parentToken = request.cookies.get("sb-access-token")?.value;
  if (parentToken) {
    return {
      type: "parent" as const,
      profileId: null,
      classroomId: null,
    };
  }

  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await getSessionType(request);

  // Chemins protégés d'origine (parents et élèves sous conditions)
  const protectedPaths = [
    "/dashboard",
    "/coloriage",
    "/magic-drawing",
    "/livres-de-coloriage",
  ];

  // Chemins strictement réservés aux parents
  const parentOnlyPaths = [
    "/parents",
    "/parametres",
    "/mes-livres",
  ];

  // Chemins d'administration de l'école (enseignant)
  const schoolDashboardPaths = [
    "/school/dashboard",
  ];

  const isProtectedPath = protectedPaths.some((path) => pathname === path || pathname.startsWith(path + "/"));
  const isParentOnlyPath = parentOnlyPaths.some((path) => pathname === path || pathname.startsWith(path + "/"));
  const isSchoolDashboardPath = schoolDashboardPaths.some((path) => pathname === path || pathname.startsWith(path + "/"));

  // 1. Administration de l'école (/school/dashboard/**) -> sb-access-token obligatoire (session parent)
  if (isSchoolDashboardPath) {
    if (!session || session.type !== "parent") {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Pages réservées aux parents (/parents/**, /parametres/**) -> redirect /dashboard si session élève ou /login si pas de session
  if (isParentOnlyPath) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (session.type === "student") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // 3. Pages communes de création (/dashboard, /coloriage, etc.) -> acceptent parent OU student
  if (isProtectedPath) {
    if (!session) {
      const loginUrl = new URL("/school", request.url); // par défaut pour les enfants
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 4. Injecter les en-têtes de session si valide
  const requestHeaders = new Headers(request.headers);
  if (session) {
    requestHeaders.set("x-session-type", session.type);
    if (session.profileId) requestHeaders.set("x-profile-id", session.profileId);
    if (session.classroomId) requestHeaders.set("x-classroom-id", session.classroomId);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - illustrations (illustration assets)
     */
    "/((?!api|_next/static|_next/image|favicon\\.ico|illustrations|.+\\.[\\w]+$).*)",
  ],
};
