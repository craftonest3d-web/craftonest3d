/**
 * CRAFTONEST3D – Simple visit counter (free, Firestore)
 * Doc: stats/visits  { total: number, updatedAt }
 * - Public visitors may increment (counts a visit once per browser session).
 * - Admin reads the total on the dashboard.
 */
import { doc, getDoc, setDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';

const REF = () => doc(db, 'stats', 'visits');

/** Count a visit once per browser session (avoids inflating on every page change). */
export async function recordVisitOncePerSession(): Promise<void> {
  try {
    const key = 'c3d-visit-counted';
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
    await setDoc(REF(), { total: increment(1), updatedAt: serverTimestamp() }, { merge: true });
  } catch {
    /* never block the site if counting fails */
  }
}

/** Read the current total (admin dashboard). */
export async function getVisitTotal(): Promise<number> {
  try {
    const snap = await getDoc(REF());
    return snap.exists() ? ((snap.data() as { total?: number }).total ?? 0) : 0;
  } catch {
    return 0;
  }
}
