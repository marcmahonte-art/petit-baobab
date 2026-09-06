// ============================================================
// Petit Baobab — Middleware multi-rôles (Phase 5)
// ============================================================

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyStudentToken } from "@/lib/auth/student-session";

const ADULT_TOKEN = "sb-access-token";
const STUDENT_TOKEN = "sb-student-token";

// Routes enfant accessibles aux élèves (token étudiant) ou aux adultes
const CHILD_ROUTES = ["/dashboard", "/dashboardstudent", "/learn/dashboard", "/learn/souvenirs", "/coloriage", "/magic-drawing", "/livres-de-coloriage", "/mes-livres", "/parametres"];

// Route parent (adulte uniquement) : un élève y est renvoyé vers son espace.
const PARENT_ROUTES = ["/dashboard"];

// Zones privées / utilitaires : ne doivent pas être indexées par les moteurs.
// (Header X-Robots-Tag — on ne bloque PAS le crawl dans robots.txt afin que
// Google puisse voir le noindex.)
const NOINDEX_PREFIXES = [
  "/dashboard",
  "/dashboardstudent",
  "/learn",
  "/store",
  "/parents",
  "/school/dashboard",
  "/school/assistant",
  "/school/activities",
  "/school/classes",
  "/school/students",
  "/school/progression",
  "/school/etoiles",
  "/school/facturation",
  "/school/parametres",
  "/auth",
  "/select-space",
  "/parametres",
  "/coloriage",
  "/magic-drawing",
  "/livres-de-coloriage",
  "/mes-livres",
  "/boutique/checkout",
  "/boutique/panier",
  "/boutique/merci",
  "/boutique/mes-achats",
  "/boutique/paiement-echoue",
];

const NOINDEX_EXACT = ["/login", "/signup"];

function isNoindexPath(pathname: string): boolean {
  if (NOINDEX_EXACT.includes(pathname)) return true;
  return NOINDEX_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const adultToken = request.cookies.get(ADULT_TOKEN)?.value;
  const studentToken = request.cookies.get(STUDENT_TOKEN)?.value;

  // SEO : poser X-Robots-Tag: noindex sur les zones privées/utilitaires.
  const noindex = isNoindexPath(pathname);
  const withNoindex = (res: NextResponse) => {
    if (noindex) res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  };

  // BLOC 1 — Protéger /school/dashboard (enseignants uniquement)
  if (pathname.startsWith("/school/dashboard")) {
    // Un élève ne peut JAMAIS y accéder, même avec son token.
    if (!adultToken) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("space", "school");
      return NextResponse.redirect(url);
    }
    // Le routage par rôle (école vs parent) est géré côté serveur par la
    // page /school/dashboard elle-même (elle lit account.plan et redirige
    // un compte non-école vers /parents). On ne se fie PAS au cookie
    // pb-role ici : il n'est pas toujours posé (login email/mdp) et peut
    // être résiduel, ce qui redirigerait à tort une école vers /parents.
    return withNoindex(NextResponse.next());
  }

  // BLOC 2 — Routes enfant : adulte OU élève
  const isChildRoute = CHILD_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`));
  if (isChildRoute) {
    // /dashboardstudent est EXCLUSIVEMENT l'espace élève : un parent
    // (token adulte) ne doit jamais y atterrir. S'il y va (URL saisie,
    // bouton Accueil résiduel, etc.), on le renvoie vers /dashboard.
    if (pathname === "/dashboardstudent" && adultToken) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

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
        return withNoindex(NextResponse.next({ request: { headers } }));
      }
      const url = request.nextUrl.clone();
      url.pathname = "/school";
      return NextResponse.redirect(url);
    }
  }

  // BLOC 3 — /school (exact), /login, /signup restent publics
  return withNoindex(NextResponse.next());
}

export const config = {
  matcher: [
    "/school/:path*",
    "/dashboard/:path*",
    "/dashboardstudent/:path*",
    "/learn/:path*",
    "/store/:path*",
    "/parents/:path*",
    "/coloriage/:path*",
    "/magic-drawing/:path*",
    "/livres-de-coloriage/:path*",
    "/mes-livres/:path*",
    "/parametres/:path*",
    "/auth/:path*",
    "/select-space/:path*",
    "/login",
    "/signup",
    "/boutique/checkout/:path*",
    "/boutique/panier/:path*",
    "/boutique/merci/:path*",
    "/boutique/mes-achats/:path*",
    "/boutique/paiement-echoue/:path*",
  ],
};
