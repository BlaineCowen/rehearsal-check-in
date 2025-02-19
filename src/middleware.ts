import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Allow check-in routes without authentication
  if (path.includes('/api/rehearsals') && path.includes('/check-in')) {
    return NextResponse.next();
  }

  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/:path*",
    "/rehearsals/:path*",
    "/groups/:path*",
    "/students/:path*",
  ],
};