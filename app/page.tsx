import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase-admin';
import HomePageClient from '@/components/HomePageClient';

const HomePage = async () => {
  // Check for session cookie
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('__session')?.value;

  let user = null;
  if (sessionCookie) {
    try {
      const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie);
      user = {
        id: decodedClaims.uid,
        email: decodedClaims.email,
      };
    } catch (error) {
      // Invalid session
      console.log('Invalid session on home page');
    }
  }

  return <HomePageClient user={user} />;
};

export default HomePage;
