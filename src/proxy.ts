// ============================================================
// Petit Baobab — Proxy (ex-« middleware ») multi-rôles
// ============================================================
//
// ⚠️ Next 16 : la convention `middleware` est DÉPRÉCIÉE au profit de `proxy`.
// Surtout, le fichier doit se trouver dans le dossier qui contient `app/`
// (ici `src/`), car Next le cherche via `path.join(appDir, "..")` — voir
// `node_modules/next/dist/build/index.js` (recherche des fichiers de
// convention). Un `middleware.ts` posé à la racine du dépôt est donc
// purement et simplement IGNORÉ : c'est ce qui s'est produit ici, avec pour
// conséquences en production : aucun en-tête `X-Robots-Tag`, et tout
// `/learn/*` accessible sans session.
//
// Ce fichier est désormais la SEULE source de vérité. Ne pas recréer de
// `middleware.ts` à la racine (Next lèverait en plus l'erreur E900 si les
// deux fichiers étaient détectés au même niveau).
// ============================================================

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyStudentToken } from "@/lib/auth/student-session";

const ADULT_TOKEN = "sb-access-token";
const STUDENT_TOKEN = "sb-student-token";

// Routes enfant : accessibles à un adulte connecté OU à un élève.
// "/learn" couvre TOUT l'espace apprenant (/learn/dashboard,
// /learn/parcours, /learn/histoires, …) : toutes ces
// pages sont des pages d'espace enfant, jamais des pages publiques.
const CHILD_ROUTES = [
  "/dashboard",
  "/dashboardstudent",
  "/learn",
  "/coloriage",
  "/magic-drawing",
  "/livres-de-coloriage",
  "/mes-livres",
  "/parametres",
];

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

// Routes destinées à la FAMILLE : un visiteur non connecté doit passer par
// /login (espace famille par défaut), qui le renvoie ensuite sur la page
// demandée grâce à `?next=`. Les autres routes enfant renvoient vers /school,
// l'entrée élève (code de classe) — page qui propose aussi un lien vers /login.
// Sans cette distinction, un parent non connecté atterrissait sur l'espace
// école, sans rapport avec sa demande.
const FAMILY_ROUTES = ["/dashboard", "/parametres"];

function isFamilyRoute(pathname: string): boolean {
  return FAMILY_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`));
}

/**
 * Résumé de session basé sur la simple PRÉSENCE des cookies (pas de
 * vérification cryptographique). Utilisé pour l'affichage, pas pour décider
 * d'un accès : la garde d'accès est dans `proxy()` ci-dessous.
 */
export async function getSessionType(request: NextRequest) {
  // 1. Session élève
  const studentToken = request.cookies.get(STUDENT_TOKEN)?.value;
  if (studentToken) {
    return {
      type: "student" as const,
      profileId: null,
      classroomId: null,
    };
  }

  // 2. Session parent (token d'accès Supabase)
  const parentToken = request.cookies.get(ADULT_TOKEN)?.value;
  if (parentToken) {
    return {
      type: "parent" as const,
      profileId: null,
      classroomId: null,
    };
  }

  return null;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const adultToken = request.cookies.get(ADULT_TOKEN)?.value;
  const studentToken = request.cookies.get(STUDENT_TOKEN)?.value;

  // SEO : poser X-Robots-Tag: noindex sur les zones privées/utilitaires.
  const noindex = isNoindexPath(pathname);
  const withNoindex = (res: NextResponse) => {
    if (noindex) res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  };

  // BLOC 1 — Espace enseignant : TOUT /school/* exige un jeton adulte.
  // `/school` (exact) reste public : c'est la page de connexion (élève + lien
  // vers l'espace enseignant). Sans cette garde, tout le back-office
  // enseignant (/school/students, /school/classes, /school/assistant,
  // /school/etoiles, …) était servi à des visiteurs anonymes.
  if (pathname.startsWith("/school/")) {
    // Un élève ne peut JAMAIS y accéder, même avec son token.
    if (!adultToken) {
      const url = request.nextUrl.clone();
      url.search = "";
      url.pathname = "/login";
      url.searchParams.set("space", "school");
      return withNoindex(NextResponse.redirect(url));
    }
    // ⚠️ LIMITE ASSUMÉE : ce bloc ne teste que la PRÉSENCE du cookie
    // `sb-access-token` — ni sa signature, ni son expiration. C'est un simple
    // filtre « premier rideau », volontairement sans appel réseau : le proxy
    // s'exécute à chaque requête et une vérification Supabase y ajouterait un
    // aller-retour systématique. Le projet ne dispose pas non plus de
    // SUPABASE_JWT_SECRET, donc pas de vérification locale possible.
    //
    // La VRAIE vérification (session valide + plan `ecole_pro`) est faite côté
    // serveur par les pages et layouts via `requireTeacherPage()`, et par les
    // routes /api/school/* via `getTeacherSession()`. Conséquence d'un cookie
    // forgé ou expiré : il passait ce filtre et affichait une coquille de page
    // vide — les données restaient protégées par les routes API, mais l'UX
    // était cassée (pas de redirection vers la connexion). D'où l'ajout des
    // gardes de page : `src/app/school/{assistant,classes,students}/layout.tsx`
    // et les pages `activities`, `etoiles`, `progression`.
    //
    // On ne se fie PAS non plus au cookie pb-role ici : il n'est pas toujours
    // posé (login email/mdp) et peut être résiduel, ce qui redirigerait à tort
    // une école vers /parents.
    return withNoindex(NextResponse.next());
  }

  // BLOC 2 — Routes enfant : adulte OU élève
  const isChildRoute = CHILD_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`));
  if (isChildRoute) {
    // Le JWT élève est VÉRIFIÉ (signature + expiration), pas seulement
    // détecté : un cookie `sb-student-token` forgé ne doit ouvrir aucun accès.
    // Le cookie est httpOnly, mais un visiteur peut le poser à la main
    // (devtools, curl, script) — la présence seule n'est pas une preuve.
    const session = studentToken && !adultToken ? await verifyStudentToken(studentToken) : null;

    // /dashboardstudent est EXCLUSIVEMENT l'espace élève : un parent
    // (token adulte) ne doit jamais y atterrir. S'il y va (URL saisie,
    // bouton Accueil résiduel, etc.), on le renvoie vers /dashboard.
    if (pathname === "/dashboardstudent" && adultToken) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return withNoindex(NextResponse.redirect(url));
    }

    // /dashboard est l'espace PARENT : un élève doit être renvoyé vers son
    // espace dédié /dashboardstudent.
    const isParentRoute = PARENT_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`));
    if (isParentRoute && !adultToken && session) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboardstudent";
      return withNoindex(NextResponse.redirect(url));
    }

    if (!adultToken) {
      if (session) {
        // Injecter les identifiants élève en aval
        // (magic-drawing/route.ts exige x-classroom-id et x-profile-id).
        const headers = new Headers(request.headers);
        headers.set("x-session-type", "student");
        if (session.classroom_id) headers.set("x-classroom-id", session.classroom_id);
        if (session.profile_id) headers.set("x-profile-id", session.profile_id);
        if (session.student_id) headers.set("x-student-id", session.student_id);
        if (session.name) headers.set("x-student-name", session.name);
        return withNoindex(NextResponse.next({ request: { headers } }));
      }
      const url = request.nextUrl.clone();
      url.search = "";
      if (isFamilyRoute(pathname)) {
        url.pathname = "/login";
        url.searchParams.set("next", pathname);
      } else {
        url.pathname = "/school";
      }
      return withNoindex(NextResponse.redirect(url));
    }
  }

  // BLOC 3 — /school (exact), /login, /signup et le reste restent publics.
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
