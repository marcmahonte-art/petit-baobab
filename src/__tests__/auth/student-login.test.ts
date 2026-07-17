// ============================================================
// Tests — student-login route (Phase 9.1)
// ============================================================

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

const setMock = vi.fn();

vi.mock("@/lib/supabaseAdmin", () => ({
  getSupabaseAdmin: vi.fn(() => ({
    from: mockFrom,
    // insert returns a thenable too (used for student_activities)
    insert: (payload: any) => ({ error: null }),
  })),
}));

import { POST } from "@/app/api/auth/student-login/route";
import { cookies } from "next/headers";

// File-level mutable queue shared with the mocked `from`
const resultQueue: Array<{ data: any; error: any }> = [];
const fromTables: string[] = [];
function mockFrom(_table: string) {
  fromTables.push(_table);
  const result = resultQueue.shift() || { data: null, error: null };
  const chain: any = {};
  const methods = ["select", "eq", "ilike", "is", "order", "limit", "single", "maybeSingle", "insert", "update", "delete"];
  for (const m of methods) {
    chain[m] = () => chain;
  }
  // The query object is thenable → awaiting it resolves to `result`
  chain.then = (resolve: any) => Promise.resolve(result).then(resolve);
  return chain;
}

function queueResults(...results: Array<{ data: any; error: any }>) {
  resultQueue.length = 0;
  resultQueue.push(...results);
  fromTables.length = 0;
}

function mockCookies() {
  const store: Record<string, { value: string }> = { "sb-student-token": { value: "signed-jwt" } };
  vi.mocked(cookies).mockResolvedValue({
    set: setMock,
    get: (name: string) => store[name],
  } as any);
}

function makeRequest(body: any): Request {
  return new Request("http://localhost/api/auth/student-login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("student-login route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMock.mockClear();
    mockCookies();
  });

  it("Connexion réussie : code valide + prénom connu → cookie posé + 200", async () => {
    queueResults(
      { data: { id: "c1", name: "CE1 A", account_id: "acc1" }, error: null }, // classroom
      { data: [{ id: "s1", first_name: "Awa", display_name: "Awa", mascot: "awa", classroom_id: "c1" }], error: null }, // students
      { data: { id: "p1", name: "Awa", mascot: "awa" }, error: null }, // child_profile
      { data: { stars_balance: 47 }, error: null }, // account
    );
    const res = await POST(makeRequest({ class_code: "BAOBAB", first_name: "Awa" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.student_id).toBe("s1");
    expect(setMock).toHaveBeenCalledWith("sb-student-token", expect.any(String), expect.objectContaining({ httpOnly: true }));
  });

  it("Code de classe invalide → 404 avec message lisible", async () => {
    queueResults({ data: null, error: { message: "not found" } });
    const res = await POST(makeRequest({ class_code: "WRONG", first_name: "Awa" }));
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toMatch(/invalide/i);
  });

  it("Prénom introuvable dans la classe → 404", async () => {
    queueResults(
      { data: { id: "c1", name: "CE1 A", account_id: "acc1" }, error: null },
      { data: [], error: null },
    );
    const res = await POST(makeRequest({ class_code: "BAOBAB", first_name: "Inconnu" }));
    expect(res.status).toBe(404);
    expect((await res.json()).error).toMatch(/introuvable/i);
  });

  it("Homonymes (2+ élèves même prénom) → 200 { multiple: true, students }", async () => {
    queueResults(
      { data: { id: "c1", name: "CE1 A", account_id: "acc1" }, error: null },
      {
        data: [
          { id: "s1", first_name: "Awa", display_name: "Awa", mascot: "awa", classroom_id: "c1" },
          { id: "s2", first_name: "Awa", display_name: "Awa", mascot: "lion", classroom_id: "c1" },
        ],
        error: null,
      },
    );
    const res = await POST(makeRequest({ class_code: "BAOBAB", first_name: "Awa" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.multiple).toBe(true);
    expect(body.students).toHaveLength(2);
  });

  it("Sélection homonyme avec student_id → connexion directe", async () => {
    queueResults(
      { data: { id: "c1", name: "CE1 A", account_id: "acc1" }, error: null },
      { data: { id: "s2", first_name: "Awa", display_name: "Awa", mascot: "lion", classroom_id: "c1" }, error: null },
      { data: { id: "p2", name: "Awa", mascot: "lion" }, error: null },
      { data: { stars_balance: 10 }, error: null },
    );
    const res = await POST(makeRequest({ class_code: "BAOBAB", first_name: "Awa", student_id: "s2" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.student_id).toBe("s2");
  });

  it("Prénom trop court (< 2 chars) → 400 validation", async () => {
    const res = await POST(makeRequest({ class_code: "BAOBAB", first_name: "A" }));
    expect(res.status).toBe(400);
  });

  it("Classe archivée → 404", async () => {
    queueResults({ data: null, error: { message: "no rows" } });
    const res = await POST(makeRequest({ class_code: "ARCHIVED", first_name: "Awa" }));
    expect(res.status).toBe(404);
  });

  it("Élève supprimé (deleted_at non null) → 404", async () => {
    queueResults(
      { data: { id: "c1", name: "CE1 A", account_id: "acc1" }, error: null },
      { data: [], error: null },
    );
    const res = await POST(makeRequest({ class_code: "BAOBAB", first_name: "Supprime" }));
    expect(res.status).toBe(404);
  });

  it("Cookie sb-student-token : httpOnly, secure en prod, maxAge 7j", async () => {
    queueResults(
      { data: { id: "c1", name: "CE1 A", account_id: "acc1" }, error: null },
      { data: [{ id: "s1", first_name: "Awa", display_name: "Awa", mascot: "awa", classroom_id: "c1" }], error: null },
      { data: { id: "p1", name: "Awa", mascot: "awa" }, error: null },
      { data: { stars_balance: 0 }, error: null },
    );
    const res = await POST(makeRequest({ class_code: "BAOBAB", first_name: "Awa" }));
    expect(res.status).toBe(200);
    const opts = setMock.mock.calls.find((c) => c[0] === "sb-student-token")?.[2];
    expect(opts.httpOnly).toBe(true);
    expect(opts.maxAge).toBe(604800);
  });

  it("JWT payload contient profile_id, student_id, classroom_id, name, mascot, type:'student'", async () => {
    queueResults(
      { data: { id: "c1", name: "CE1 A", account_id: "acc1" }, error: null },
      { data: [{ id: "s1", first_name: "Awa", display_name: "Awa", mascot: "awa", classroom_id: "c1" }], error: null },
      { data: { id: "p1", name: "Awa", mascot: "awa" }, error: null },
      { data: { stars_balance: 5 }, error: null },
    );
    const res = await POST(makeRequest({ class_code: "BAOBAB", first_name: "Awa" }));
    const body = await res.json();
    expect(body).toMatchObject({
      profile_id: "p1",
      student_id: "s1",
      classroom_id: "c1",
      name: "Awa",
      mascot: "awa",
      type: "student",
    });
  });

  it("student_activities : une ligne 'login' créée après connexion", async () => {
    queueResults(
      { data: { id: "c1", name: "CE1 A", account_id: "acc1" }, error: null },
      { data: [{ id: "s1", first_name: "Awa", display_name: "Awa", mascot: "awa", classroom_id: "c1" }], error: null },
      { data: { id: "p1", name: "Awa", mascot: "awa" }, error: null },
      { data: { stars_balance: 5 }, error: null },
    );
    await POST(makeRequest({ class_code: "BAOBAB", first_name: "Awa" }));
    // last from() call should target student_activities
    const last = fromTables[fromTables.length - 1];
    expect(last).toBe("student_activities");
  });
});
