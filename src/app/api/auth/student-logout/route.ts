import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { STUDENT_COOKIE_NAME } from "@/lib/auth/student-session";

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(STUDENT_COOKIE_NAME);
    cookieStore.delete("sb-student-session-active");
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Student logout error:", err);
    return NextResponse.json(
      { error: err.message || "Une erreur est survenue." },
      { status: 500 }
    );
  }
}
