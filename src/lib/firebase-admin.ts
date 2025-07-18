import { initializeApp, cert, getApps, getApp, ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const getServiceAccount = (): ServiceAccount => {
  const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountStr) {
    throw new Error('The FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. This is required for server-side operations.');
  }
  try {
    return JSON.parse(serviceAccountStr);
  } catch (e) {
    throw new Error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Make sure it is a valid JSON string.');
  }
};

const app = getApps().length 
  ? getApp() 
  : initializeApp({
      credential: cert(getServiceAccount()),
    });

export const adminDb = getFirestore(app);
