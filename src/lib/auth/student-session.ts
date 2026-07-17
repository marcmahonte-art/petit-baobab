// ============================================================
// Petit Baobab — Gestion des Sessions Élèves (Phase 3.1)
// ============================================================

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { StudentLoginResponse } from "@/types/school";

const JWT_SECRET = new TextEncoder().encode(
  process.env.STUDENT_JWT_SECRET || "your_student_jwt_secret_here_at_least_32_chars_long"
);

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
export async function getStudentSession(cookieStore?: any): Promise<StudentLoginResponse | null> {
  const store = cookieStore || (await cookies());
  const token = store.get("sb-student-token")?.value;
  if (!token) return null;
  return verifyStudentToken(token);
}
