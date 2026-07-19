import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function getSessionType(request: NextRequest) {
  // 1. Student session – only check cookie existence (no JWT verification at edge)
  const studentToken = request.cookies.get("sb-student-token")?.value;
  if (studentToken) {
    return {
      type: "student" as const,
      profileId: null,
      classroomId: null,
    };
  }

  // 2. Parent session – check Supabase access token
  const parentToken = request.cookies.get("sb-access-token")?.value;
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
  const session = await getSessionType(request)
  const { pathname } = request.nextUrl

  const protectedPaths = [
    "/dashboard",
    "/dashboardstudent",
    "/coloriage",
    "/magic-drawing",
    "/livres-de-coloriage",
    "/parametres",
    "/parents",
  ]

  const isProtected = protectedPaths.some((path) => pathname === path || pathname.startsWith(path + "/"))

  if (isProtected && !session) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("next", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon\\.ico|.+\\.[\\w]+$).*)",
  ],
}
