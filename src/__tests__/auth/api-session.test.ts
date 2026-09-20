// ============================================================
// Tests — resolveApiSession (repli cookie pour les routes API)
// ============================================================
//
// Contexte : ces routes exigeaient l'en-tête `x-session-type`, que le proxy ne
// peut pas poser sur /api/*. Elles répondaient donc 401 même connectées.

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

import { resolveApiSession } from "@/lib/auth/api-session";
import { signStudentToken, STUDENT_COOKIE_NAME } from "@/lib/auth/student-session";
import { cookies } from "next/headers";
import type { StudentLoginResponse } from "@/types/school";

const payload: StudentLoginResponse = {
  profile_id: "p1",
  student_id: "s1",
  classroom_id: "c1",
  account_id: "a1",
  name: "Awa",
  mascot: "bobo",
  classroom_name: "CE1 A",
  stars_balance: 5,
  type: "student",
};

function makeRequest(headers: Record<string, string> = {}): Request {
  return new Request("http://localhost/api/magic-drawing", { method: "POST", headers });
}

function withCookie(value: string | undefined) {
  vi.mocked(cookies).mockResolvedValue({
    get: (name: string) => (name === STUDENT_COOKIE_NAME && value ? { value } : undefined),
  } as never);
}

describe("resolveApiSession", () => {
  beforeEach(() => {
    vi.mocked(cookies).mockReset();
  });

  it("cookie élève VALIDE → session student avec profileId et classroomId", async () => {
    withCookie(await signStudentToken(payload));
    const session = await resolveApiSession(makeRequest());
    expect(session.type).toBe("student");
    expect(session.profileId).toBe("p1");
    expect(session.classroomId).toBe("c1");
    expect(session.studentName).toBe("Awa");
  });

  it("cookie élève FORGÉ → repli parent (aucun accès élève accordé)", async () => {
    withCookie("jwt-forge");
    const session = await resolveApiSession(makeRequest());
    expect(session.type).toBe("parent");
    expect(session.profileId).toBeNull();
  });

  it("aucun cookie → session parent (la route vérifie ensuite la session adulte)", async () => {
    withCookie(undefined);
    const session = await resolveApiSession(makeRequest());
    expect(session.type).toBe("parent");
  });

  it("en-tête x-session-type: student → session student (repli si le proxy couvre /api)", async () => {
    withCookie(undefined);
    const session = await resolveApiSession(
      makeRequest({ "x-session-type": "student", "x-profile-id": "p9", "x-classroom-id": "c9" })
    );
    expect(session.type).toBe("student");
    expect(session.profileId).toBe("p9");
    expect(session.classroomId).toBe("c9");
  });

  it("en-tête x-session-type: parent → session parent", async () => {
    withCookie(undefined);
    const session = await resolveApiSession(makeRequest({ "x-session-type": "parent" }));
    expect(session.type).toBe("parent");
  });

  it("le JWT élève VÉRIFIÉ prime sur un en-tête parent (pas de contournement)", async () => {
    withCookie(await signStudentToken(payload));
    const session = await resolveApiSession(makeRequest({ "x-session-type": "parent" }));
    expect(session.type).toBe("student");
    expect(session.profileId).toBe("p1");
  });
});
