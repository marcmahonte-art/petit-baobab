import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function proxy(request: NextRequest) {
  const token = request.cookies.get("sb-access-token")?.value
  const { pathname } = request.nextUrl

  const protectedPaths = [
    "/dashboard",
    "/coloriage",
    "/magic-drawing",
    "/livres-de-coloriage",
    "/parametres",
    "/parents",
  ]

  const isProtected = protectedPaths.some((path) => pathname === path || pathname.startsWith(path + "/"))

  if (isProtected && !token) {
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
