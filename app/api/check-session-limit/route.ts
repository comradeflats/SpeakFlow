import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { checkSessionLimit, getSessionCounts } from '@/lib/firestore-db';

export async function POST(request: NextRequest) {
  try {
    const { type } = await request.json();

    if (!type || (type !== 'assessment' && type !== 'practice')) {
      return NextResponse.json(
        { error: 'Invalid session type' },
        { status: 400 }
      );
    }

    // Get authenticated user from session cookie
    const sessionCookie = request.cookies.get('__session')?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie);
    const userId = decodedClaims.uid;

    // Check session limit
    const limit = await checkSessionLimit(userId, type as 'assessment' | 'practice');
    const counts = await getSessionCounts(userId);

    return NextResponse.json({
      allowed: limit.allowed,
      remaining: limit.remaining,
      counts
    });
  } catch (error) {
    console.error('Error checking session limit:', error);
    return NextResponse.json(
      { error: 'Failed to check session limit' },
      { status: 500 }
    );
  }
}
