/**
 * PaperNest – Settings Service (Firestore)
 * Collection: "settings" — single document with id "general"
 *
 * getSiteSettings()   — async, reads from Firestore (falls back to defaults)
 * saveSiteSettings()  — admin: writes to Firestore
 * DEFAULT_SETTINGS    — exported so pages can render instantly before Firestore responds
 */
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import type { SiteSettings } from '../types';

const DOC_REF = () => doc(db, 'settings', 'general');

export const DEFAULT_SETTINGS: SiteSettings = {
  whatsappNumber:   '919876543210',
  storeName:        'PaperNest',
  storeEmail:       'hello@papernest.in',
  storePhone:       '+91 98765 43210',
  storeAddress:     '123, Stationery Street, Your City \u2013 400001',
  businessHours:    'Mon \u2013 Sat: 10:00 AM \u2013 8:00 PM',
  announcementText: '\uD83C\uDF89 Free delivery on orders above \u20B9499! Shop now \u2192',
  socialLinks: {
    facebook:  'https://facebook.com/papernest',
    instagram: 'https://instagram.com/papernest',
    youtube:   'https://youtube.com/@papernest',
    pinterest: 'https://pinterest.com/papernest',
  },
};

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const snap = await getDoc(DOC_REF());
    if (snap.exists()) {
      return { ...DEFAULT_SETTINGS, ...(snap.data() as Partial<SiteSettings>) };
    }
  } catch {
    // Firestore unreachable or credentials not yet set — return defaults silently
  }
  return { ...DEFAULT_SETTINGS };
}

export async function saveSiteSettings(settings: SiteSettings): Promise<void> {
  await setDoc(DOC_REF(), { ...settings }, { merge: true });
}
