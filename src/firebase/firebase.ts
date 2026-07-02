/**
 * PaperNest – Firebase Initialisation
 * Free Spark plan: Auth + Firestore only.
 * Storage is NOT used (requires paid Blaze plan).
 * Product images are stored as external URLs (Unsplash, etc.)
 */
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY             as string,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN         as string,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID          as string,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET      as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID              as string,
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID      as string,
};

// Prevent double-initialisation during hot-reload
const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth    = getAuth(firebaseApp);
export const db      = getFirestore(firebaseApp);

// Storage is not available on free Spark plan
// export const storage = getStorage(firebaseApp);

export default firebaseApp;
