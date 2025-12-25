import { cert, getApp, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';

// Initialize Firebase Admin SDK (singleton pattern)
function getFirebaseAdmin() {
  if (getApps().length > 0) {
    return getApp();
  }

  let credentials;

  // For local development: use file path
  if (process.env.FIREBASE_ADMIN_CREDENTIALS && fs.existsSync(process.env.FIREBASE_ADMIN_CREDENTIALS)) {
    const serviceAccount = JSON.parse(
      fs.readFileSync(process.env.FIREBASE_ADMIN_CREDENTIALS, 'utf-8')
    );
    credentials = cert(serviceAccount);
  }
  // For Cloud Run: use base64-encoded credentials
  else if (process.env.FIREBASE_ADMIN_KEY_BASE64) {
    const serviceAccount = JSON.parse(
      Buffer.from(process.env.FIREBASE_ADMIN_KEY_BASE64, 'base64').toString('utf-8')
    );
    credentials = cert(serviceAccount);
  }
  else {
    throw new Error(
      'Firebase Admin credentials not found. Set FIREBASE_ADMIN_CREDENTIALS or FIREBASE_ADMIN_KEY_BASE64'
    );
  }

  return initializeApp({
    credential: credentials,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

// Initialize Firebase Admin
const firebaseAdmin = getFirebaseAdmin();

// Export Auth and Firestore instances
export const adminAuth = getAuth(firebaseAdmin);
export const adminDb = getFirestore(firebaseAdmin);

// Helper function to verify ID tokens (for API routes)
export async function verifyIdToken(idToken: string) {
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying ID token:', error);
    throw new Error('Invalid authentication token');
  }
}
