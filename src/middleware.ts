import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const token = request.cookies.get("sb-access-token")?.value
  const { pathname } = request.nextUrl

  // List of protected routes that require an active parent session
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
    // Save target path to redirect back after successful login
    loginUrl.searchParams.set("next", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API endpoints)
     * - _next/static (static production assets)
     * - _next/image (image optimization handler)
     * - favicon.ico (site favicon)
     * - illustrations, logo, and webp assets
     */
    "/((?!api|_next/static|_next/image|favicon.ico|illustrations|Logo|illustration).*)",
  ],
}
