import { NextResponse, type NextRequest } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

// Use Node.js runtime for Firebase Admin
export const config = {
  runtime: 'nodejs',
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

export async function middleware(request: NextRequest) {
  // Get session cookie
  const sessionCookie = request.cookies.get('__session')?.value;

  let user = null;
  if (sessionCookie) {
    try {
      // Verify session cookie
      const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
      user = decodedClaims;
    } catch (error) {
      // Invalid or expired session cookie
      console.log('Invalid session cookie:', error);
    }
  }

  // Protect /practice route - redirect to home if not authenticated
  if (request.nextUrl.pathname.startsWith('/practice') && !user) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Protect /dashboard route
  if (request.nextUrl.pathname.startsWith('/dashboard') && !user) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}
