// ============================================================
// Tests — student-session.ts (Phase 9.1)
// ============================================================

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

import { signStudentToken, verifyStudentToken, getStudentSession, STUDENT_COOKIE_NAME } from "@/lib/auth/student-session";
import { cookies } from "next/headers";
import type { StudentLoginResponse } from "@/types/school";

const payload: StudentLoginResponse = {
  profile_id: "p1",
  student_id: "s1",
  classroom_id: "c1",
  name: "Awa",
  mascot: "awa",
  classroom_name: "CE1 A",
  stars_balance: 47,
  type: "student",
};

describe("student-session", () => {
  beforeEach(() => {
    vi.mocked(cookies).mockReset();
  });

  it("signStudentToken → JWT valide décodable", async () => {
    const token = await signStudentToken(payload);
    expect(typeof token).toBe("string");
    const decoded = await verifyStudentToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded!.name).toBe("Awa");
  });

  it("verifyStudentToken token valide → payload", async () => {
    const token = await signStudentToken(payload);
    const decoded = await verifyStudentToken(token);
    expect(decoded).toMatchObject({ profile_id: "p1", type: "student" });
  });

  it("verifyStudentToken token expiré → null (pas de throw)", async () => {
    const { SignJWT } = await import("jose");
    const secret = new TextEncoder().encode(process.env.STUDENT_JWT_SECRET || "test_secret_at_least_32_chars_long_xxx");
    const expired = await new SignJWT({ ...payload, type: "student" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt(Math.floor(Date.now() / 1000) - 10)
      .setExpirationTime(Math.floor(Date.now() / 1000) - 5)
      .sign(secret);
    const decoded = await verifyStudentToken(expired);
    expect(decoded).toBeNull();
  });

  it("verifyStudentToken token falsifié → null", async () => {
    const decoded = await verifyStudentToken("not-a-real-token");
    expect(decoded).toBeNull();
  });

  it("getStudentSession cookie absent → null", async () => {
    vi.mocked(cookies).mockResolvedValue({ get: () => undefined } as any);
    const session = await getStudentSession();
    expect(session).toBeNull();
  });

  it("getStudentSession cookie présent → payload", async () => {
    const token = await signStudentToken(payload);
    vi.mocked(cookies).mockResolvedValue({
      get: (name: string) => (name === STUDENT_COOKIE_NAME ? { value: token } : undefined),
    } as any);
    const session = await getStudentSession();
    expect(session).toMatchObject({ student_id: "s1" });
  });
});
