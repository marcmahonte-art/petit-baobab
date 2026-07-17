// ============================================================
// Petit Baobab — Middleware multi-rôles (Phase 5)
// ============================================================

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADULT_TOKEN = "sb-access-token";
const STUDENT_TOKEN = "sb-student-token";

// Routes enfant accessibles aux élèves (token étudiant) ou aux adultes
const CHILD_ROUTES = ["/dashboard", "/coloriage", "/magic-drawing", "/livres-de-coloriage", "/mes-livres", "/parametres"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const adultToken = request.cookies.get(ADULT_TOKEN)?.value;
  const studentToken = request.cookies.get(STUDENT_TOKEN)?.value;

  // BLOC 1 — Protéger /school/dashboard (adultes uniquement)
  if (pathname.startsWith("/school/dashboard")) {
    // Un élève ne peut JAMAIS y accéder, même avec son token.
    if (!adultToken) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // BLOC 2 — Routes enfant : adulte OU élève
  const isChildRoute = CHILD_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`));
  if (isChildRoute) {
    if (!adultToken) {
      if (studentToken) {
        // Valider côté serveur plus loin (page). On laisse passer et on injecte
        // les headers pour que le Server Component sache qu'on est élève.
        const headers = new Headers(request.headers);
        headers.set("x-session-type", "student");
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
    "/coloriage/:path*",
    "/magic-drawing/:path*",
    "/livres-de-coloriage/:path*",
    "/mes-livres/:path*",
    "/parametres/:path*",
  ],
};
