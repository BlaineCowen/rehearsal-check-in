import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Public paths that don't require authentication
  const publicPaths = ['/auth', '/api/auth'];
  if (publicPaths.some(p => path.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow check-in routes without authentication
  if (path.includes('/api/rehearsals') && path.includes('/check-in')) {
    return NextResponse.next();
  }

  const session = await auth();

  // Redirect to auth page if no session
  if (!session?.user?.email) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  // If user is authenticated but doesn't have an organization
  // and isn't on the register or create-org path, redirect to register
  if (
    !session.user.organizations?.[0]?.id && 
    !path.startsWith('/register') && 
    !path.startsWith('/create-org') &&
    !path.startsWith('/api')
  ) {
    return NextResponse.redirect(new URL('/register', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/api/:path*",
    "/rehearsals/:path*",
    "/groups/:path*",
    "/students/:path*",
    "/register/:path*",
    "/create-org/:path*",
    "/api/auth/:path*",
  ],
};