import { type NextRequest, NextResponse } from "next/server";

/**
 * Middleware for security and routing.
 *
 * Handles:
 * - CSRF token validation for mutating requests
 * - Secure headers enforcement
 * - Route protection (extendable)
 */

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // Skip CSRF check for API routes using safe HTTP methods
  if (pathname.startsWith("/api/") && !SAFE_METHODS.has(method)) {
    const csrfToken = request.headers.get("x-csrf-token");
    const cookieToken = request.cookies.get("csrf-token")?.value;

    // Validate CSRF token for state-mutating API requests
    if (!csrfToken || !cookieToken || csrfToken !== cookieToken) {
      return NextResponse.json(
        { message: "Invalid CSRF token", success: false },
        { status: 403 }
      );
    }
  }

  const response = NextResponse.next();

  // Add CSRF token cookie if not present
  if (!request.cookies.get("csrf-token")) {
    const token = crypto.randomUUID();
    response.cookies.set("csrf-token", token, {
      httpOnly: false, // Must be readable by JS to send as header
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
