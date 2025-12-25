import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase-admin';
import { getUserSessions, getUserStats } from '@/lib/firestore-db';
import DashboardClient from '@/components/DashboardClient';

export default async function DashboardPage() {
  // Check authentication
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('__session')?.value;

  if (!sessionCookie) {
    redirect('/');
  }

  const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie);
  const userId = decodedClaims.uid;

  // Fetch practice sessions and stats from Firestore
  try {
    const sessions = await getUserSessions(userId, 20);
    const stats = await getUserStats(userId);

    return <DashboardClient sessions={sessions || []} stats={stats || null} />;
  } catch (error) {
    console.error('Dashboard error:', error);
    return <DashboardClient sessions={[]} stats={null} />;
  }
}
