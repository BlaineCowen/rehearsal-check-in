import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function middleware(request: Request) {
  const session = await auth();

  // Protect all routes except /login
  if (!session?.user && !request.url.includes('/login')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};