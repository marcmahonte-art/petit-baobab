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

  it("/school/dashboard avec sb-access-token → 200 (passe)", async () => {
    const res = await middleware(makeReq("/school/dashboard", { "sb-access-token": "adult-jwt" }));
    expect(res.headers.get("location")).toBeNull();
  });

  it("/dashboard avec sb-student-token valide → 200 (passe, sans redirection)", async () => {
    const res = await middleware(makeReq("/dashboard", { "sb-student-token": "student-jwt" }));
    expect(res.headers.get("location")).toBeNull();
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
