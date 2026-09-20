// ============================================================
// Tests — src/proxy.ts (garde d'accès + noindex)
// ============================================================
//
// Historique : ces tests visaient `middleware.ts` à la racine du dépôt.
// Ce fichier n'était JAMAIS chargé par Next (la convention est cherchée
// dans le dossier contenant `app/`, soit `src/`). Il a été fusionné dans
// `src/proxy.ts`, qui est le fichier réellement exécuté.

import { describe, it, expect } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { proxy } from "@/proxy";
import { signStudentToken } from "@/lib/auth/student-session";
import type { StudentLoginResponse } from "@/types/school";

const STUDENT_PAYLOAD: StudentLoginResponse = {
  profile_id: "prof-1",
  student_id: "stu-1",
  classroom_id: "class-1",
  account_id: "acc-1",
  name: "Awa",
  mascot: "bobo",
  classroom_name: "CE1 A",
  stars_balance: 5,
  type: "student",
};

function makeReq(pathname: string, cookies: Record<string, string> = {}): NextRequest {
  const req = new NextRequest(new URL(`http://localhost${pathname}`));
  for (const [name, value] of Object.entries(cookies)) {
    req.cookies.set(name, value);
  }
  return req;
}

describe("proxy — protection des routes", () => {
  it("/school/dashboard sans sb-access-token → redirect /login", async () => {
    const res = await proxy(makeReq("/school/dashboard"));
    expect(res).toBeInstanceOf(NextResponse);
    expect(res.headers.get("location")).toContain("/login");
  });

  it("/school/dashboard avec sb-student-token → redirect /login (jamais d'accès élève)", async () => {
    const res = await proxy(makeReq("/school/dashboard", { "sb-student-token": "student-jwt" }));
    expect(res.headers.get("location")).toContain("/login");
  });

  it("/school/dashboard avec sb-access-token + pb-role=parent résiduel → 200 (NE PAS rediriger vers /parents)", async () => {
    // Cas de bug rencontré : un compte école se connecte, mais un cookie
    // pb-role=parent résiduel (session famille précédente) traîne.
    // Le proxy ne doit PAS rediriger vers /parents — la page
    // /school/dashboard lit account.plan et gère le routage elle-même.
    const res = await proxy(
      makeReq("/school/dashboard", { "sb-access-token": "adult-jwt", "pb-role": "parent" })
    );
    expect(res.headers.get("location")).toBeNull();
  });

  it("/school/dashboard avec sb-access-token → 200 (passe)", async () => {
    const res = await proxy(makeReq("/school/dashboard", { "sb-access-token": "adult-jwt" }));
    expect(res.headers.get("location")).toBeNull();
  });

  it("/dashboard avec un JWT élève VALIDE (sans token adulte) → redirect /dashboardstudent", async () => {
    const token = await signStudentToken(STUDENT_PAYLOAD);
    const res = await proxy(makeReq("/dashboard", { "sb-student-token": token }));
    expect(res.headers.get("location")).toContain("/dashboardstudent");
  });

  it("/dashboard avec un sb-student-token FORGÉ → redirect /login (la présence du cookie ne suffit pas)", async () => {
    const res = await proxy(makeReq("/dashboard", { "sb-student-token": "student-jwt" }));
    const loc = res.headers.get("location") ?? "";
    expect(loc).toContain("/login");
    expect(loc).toContain("next=%2Fdashboard");
  });

  it("/dashboard sans aucun token → redirect /login?next=/dashboard (espace famille)", async () => {
    const res = await proxy(makeReq("/dashboard"));
    const loc = res.headers.get("location") ?? "";
    expect(loc).toContain("/login");
    expect(loc).toContain("next=%2Fdashboard");
  });

  it("/parametres sans session → redirect /login?next=/parametres (page famille)", async () => {
    const res = await proxy(makeReq("/parametres"));
    const loc = res.headers.get("location") ?? "";
    expect(loc).toContain("/login");
    expect(loc).toContain("next=%2Fparametres");
  });

  it("/school (exact) → toujours 200 (public)", async () => {
    const res = await proxy(makeReq("/school"));
    expect(res.headers.get("location")).toBeNull();
  });

  it("/login → toujours 200 (public)", async () => {
    const res = await proxy(makeReq("/login"));
    expect(res.headers.get("location")).toBeNull();
  });
});

describe("proxy — espace apprenant /learn/*", () => {
  it.each(["/learn/dashboard", "/learn/parcours", "/learn/souvenirs", "/learn/histoires"])(
    "%s sans session → redirect /school",
    async (pathname) => {
      const res = await proxy(makeReq(pathname));
      expect(res.headers.get("location")).toContain("/school");
    }
  );

  it("/learn/dashboard avec un JWT élève valide → 200 + identifiants injectés", async () => {
    const token = await signStudentToken(STUDENT_PAYLOAD);
    const res = await proxy(makeReq("/learn/dashboard", { "sb-student-token": token }));
    expect(res.headers.get("location")).toBeNull();
    expect(res.headers.get("x-middleware-override-headers")).toContain("x-classroom-id");
  });

  it("/learn/dashboard avec un cookie élève forgé → redirect /school", async () => {
    const res = await proxy(makeReq("/learn/dashboard", { "sb-student-token": "forge" }));
    expect(res.headers.get("location")).toContain("/school");
  });

  it("/learn/dashboard avec un token adulte → 200", async () => {
    const res = await proxy(makeReq("/learn/dashboard", { "sb-access-token": "adult-jwt" }));
    expect(res.headers.get("location")).toBeNull();
  });
});

describe("proxy — X-Robots-Tag: noindex", () => {
  it.each(["/dashboard", "/learn/dashboard", "/parametres", "/login"])(
    "%s → X-Robots-Tag: noindex, nofollow",
    async (pathname) => {
      const res = await proxy(makeReq(pathname));
      expect(res.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
    }
  );

  it("/school → pas de noindex (page publique)", async () => {
    const res = await proxy(makeReq("/school"));
    expect(res.headers.get("X-Robots-Tag")).toBeNull();
  });

  it("/ → pas de noindex (page publique)", async () => {
    const res = await proxy(makeReq("/"));
    expect(res.headers.get("X-Robots-Tag")).toBeNull();
  });
});
