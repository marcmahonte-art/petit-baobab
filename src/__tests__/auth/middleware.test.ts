// ============================================================
// Tests — middleware.ts (Phase 9.1)
// ============================================================

import { describe, it, expect, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { middleware } from "../../../middleware";

function makeReq(pathname: string, cookies: Record<string, string> = {}): NextRequest {
  const req = new NextRequest(new URL(`http://localhost${pathname}`));
  for (const [name, value] of Object.entries(cookies)) {
    req.cookies.set(name, value);
  }
  return req;
}

describe("middleware — protection des routes", () => {
  it("/school/dashboard sans sb-access-token → redirect /login", async () => {
    const res = await middleware(makeReq("/school/dashboard"));
    expect(res).toBeInstanceOf(NextResponse);
    expect(res.headers.get("location")).toContain("/login");
  });

  it("/school/dashboard avec sb-student-token → redirect /login (jamais d'accès élève)", async () => {
    const res = await middleware(makeReq("/school/dashboard", { "sb-student-token": "student-jwt" }));
    expect(res.headers.get("location")).toContain("/login");
  });

  it("/school/dashboard avec sb-access-token + pb-role=parent résiduel → 200 (NE PAS rediriger vers /parents)", async () => {
    // Cas de bug rencontré : un compte école se connecte, mais un cookie
    // pb-role=parent résiduel (session famille précédente) traîne.
    // Le middleware ne doit PAS rediriger vers /parents — la page
    // /school/dashboard lit account.plan et gère le routage elle-même.
    const res = await middleware(
      makeReq("/school/dashboard", { "sb-access-token": "adult-jwt", "pb-role": "parent" })
    );
    expect(res.headers.get("location")).toBeNull();
  });

  it("/school/dashboard avec sb-access-token → 200 (passe)", async () => {
    const res = await middleware(makeReq("/school/dashboard", { "sb-access-token": "adult-jwt" }));
    expect(res.headers.get("location")).toBeNull();
  });

  it("/dashboard avec sb-student-token (sans token adulte) → redirect /dashboardstudent (sécurité : l'élève ne voit pas le dashboard parent)", async () => {
    const res = await middleware(makeReq("/dashboard", { "sb-student-token": "student-jwt" }));
    expect(res.headers.get("location")).toContain("/dashboardstudent");
  });

  it("/dashboard sans aucun token → redirect /school", async () => {
    const res = await middleware(makeReq("/dashboard"));
    expect(res.headers.get("location")).toContain("/school");
  });

  it("/school (exact) → toujours 200 (public)", async () => {
    const res = await middleware(makeReq("/school"));
    expect(res.headers.get("location")).toBeNull();
  });

  it("/login → toujours 200 (public)", async () => {
    const res = await middleware(makeReq("/login"));
    expect(res.headers.get("location")).toBeNull();
  });
});
