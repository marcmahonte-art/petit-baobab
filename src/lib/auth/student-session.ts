// ============================================================
// Petit Baobab — Gestion des Sessions Élèves (Phase 3.1)
// ============================================================

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { StudentLoginResponse } from "@/types/school";

const STUDENT_JWT_SECRET = process.env.STUDENT_JWT_SECRET;
if (!STUDENT_JWT_SECRET) {
  throw new Error(
    "STUDENT_JWT_SECRET est manquant. Définissez cette variable d'environnement " +
      "en production : sans elle, les JWT élève seraient forgeables."
  );
}
const JWT_SECRET = new TextEncoder().encode(STUDENT_JWT_SECRET);

export const STUDENT_COOKIE_NAME = "sb-student-token";
export const STUDENT_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 24 * 7, // 7 jours
  path: "/",
};

/**
 * Signe un token JWT pour l'élève connecté avec une validité de 7 jours.
 */
export async function signStudentToken(payload: StudentLoginResponse): Promise<string> {
  return await new SignJWT({ ...payload, type: "student" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

/**
 * Vérifie la validité du token JWT élève.
 */
export async function verifyStudentToken(token: string): Promise<StudentLoginResponse | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.type !== "student") return null;
    return payload as unknown as StudentLoginResponse;
  } catch (error) {
    return null;
  }
}

/**
 * Récupère la session de l'élève depuis le cookie 'sb-student-token'.
 */
export async function getStudentSession(
  cookieStore?: Awaited<ReturnType<typeof cookies>>
): Promise<StudentLoginResponse | null> {
  const store = cookieStore || (await cookies());
  const token = store.get(STUDENT_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyStudentToken(token);
}
