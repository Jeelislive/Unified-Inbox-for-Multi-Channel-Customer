import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "./lib/auth";

/**
 * Middleware to protect routes
 * Redirects unauthenticated users to login
 */
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/login", "/signup"];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Check if route is protected (dashboard routes)
  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/inbox") ||
    pathname.startsWith("/contacts") ||
    pathname.startsWith("/analytics");

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Check authentication
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    // Redirect to login with return URL
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
