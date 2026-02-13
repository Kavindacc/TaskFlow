import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware is currently a passthrough
// JWT authentication is handled client-side via AuthContext
// You can add server-side JWT verification here later if needed

export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};