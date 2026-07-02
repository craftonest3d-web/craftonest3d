/**
 * PaperNest – Firestore Seeder
 * Seeds settings, categories and products if collections are empty.
 * Called from AdminDashboard "Seed Data" button and from main.tsx on startup.
 */
import {
  collection, doc, getDoc, getDocs, setDoc, addDoc,
  serverTimestamp, query, limit, writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';

const DEFAULT_SETTINGS = {
  storeName:        'PaperNest',
  storeEmail:       'hello@papernest.in',
  storePhone:       '+91 98765 43210',
  whatsappNumber:   '919876543210',
  storeAddress:     '123, Stationery Street, Your City – 400001',
  businessHours:    'Mon – Sat: 10:00 AM – 8:00 PM',
  announcementText: '🎉 Free delivery on orders above ₹499! Shop now →',
  socialLinks: {
    facebook:  'https://facebook.com/papernest',
    instagram: 'https://instagram.com/papernest',
    youtube:   'https://youtube.com/@papernest',
    pinterest: 'https://pinterest.com/papernest',
  },
};

const SEED_CATEGORIES = [
  { name: 'All Products',       slug: 'all',        icon: '🛍️', sortOrder: 0, isActive: true },
  { name: 'Stationery',         slug: 'stationery', icon: '✏️', sortOrder: 1, isActive: true },
  { name: 'Notebooks',          slug: 'notebooks',  icon: '📓', sortOrder: 2, isActive: true },
  { name: 'Personalized Gifts', slug: 'gifts',      icon: '🎁', sortOrder: 3, isActive: true },
  { name: 'Custom Mugs',        slug: 'mugs',       icon: '☕', sortOrder: 4, isActive: true },
  { name: 'Stickers',           slug: 'stickers',   icon: '🌟', sortOrder: 5, isActive: true },
  { name: 'Photo Prints',       slug: 'prints',     icon: '🖼️', sortOrder: 6, isActive: true },
  { name: 'Gift Boxes',         slug: 'giftboxes',  icon: '📦', sortOrder: 7, isActive: true },
  { name: 'Greeting Cards',     slug: 'cards',      icon: '💌', sortOrder: 8, isActive: true },
];

const SEED_PRODUCTS = [
  {
    title: 'Pastel Gel Pen Set (10 Pieces)',
    description: 'Smooth-writing pastel gel pens perfect for journaling, note-taking and art.',
    category: 'stationery', categoryLabel: 'Stationery',
    price: 149, originalPrice: 199, rating: 5, reviews: 48,
    badge: 'New', badgeType: 'new',
    image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?q=80&w=500&auto=format&fit=crop',
    inStock: true, isFeatured: true,
  },
  {
    title: 'A5 Spiral Notebook (200 Pages)',
    description: 'Premium ruled spiral notebook with thick 90 GSM pages.',
    category: 'notebooks', categoryLabel: 'Notebooks',
    price: 85, originalPrice: 110, rating: 5, reviews: 72,
    badge: 'Best Seller', badgeType: 'bestseller',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=500&auto=format&fit=crop',
    inStock: true, isFeatured: true,
  },
  {
    title: 'Personalized Photo Mug',
    description: 'Custom printed ceramic mug with your photo or message. Perfect gift.',
    category: 'mugs', categoryLabel: 'Custom Mugs',
    price: 299, originalPrice: 349, rating: 5, reviews: 35,
    badge: 'Sale', badgeType: 'sale',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=500&auto=format&fit=crop',
    inStock: true, isFeatured: true,
  },
  {
    title: 'Aesthetic Vinyl Sticker Pack (30 pcs)',
    description: 'Set of 30 premium waterproof vinyl stickers. Aesthetic and durable.',
    category: 'stickers', categoryLabel: 'Stickers',
    price: 99, originalPrice: 129, rating: 5, reviews: 26,
    badge: 'New', badgeType: 'new',
    image: 'https://images.unsplash.com/photo-1572375995501-4b0894dbe0d1?q=80&w=500&auto=format&fit=crop',
    inStock: true, isFeatured: true,
  },
  {
    title: 'Custom Name Keychain',
    description: 'Acrylic name keychain personalized with any name or text.',
    category: 'gifts', categoryLabel: 'Personalized Gifts',
    price: 149, originalPrice: 199, rating: 5, reviews: 31,
    badge: 'Best Seller', badgeType: 'bestseller',
    image: 'https://images.unsplash.com/photo-1548484352-ea579e01314a?q=80&w=500&auto=format&fit=crop',
    inStock: true, isFeatured: true,
  },
  {
    title: 'Personalized Photo Frame',
    description: 'Beautiful wooden photo frame with custom name engraving.',
    category: 'gifts', categoryLabel: 'Personalized Gifts',
    price: 349, originalPrice: 389, rating: 4, reviews: 29,
    badge: 'Sale', badgeType: 'sale',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=500&auto=format&fit=crop',
    inStock: true, isFeatured: true,
  },
  {
    title: 'Washi Tape Set (15 Rolls)',
    description: 'Decorative washi tapes in floral and pastel patterns.',
    category: 'stationery', categoryLabel: 'Stationery',
    price: 199, originalPrice: 249, rating: 5, reviews: 42,
    badge: 'Featured', badgeType: 'featured',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=500&auto=format&fit=crop',
    inStock: true, isFeatured: false,
  },
  {
    title: 'Leather Journal Diary',
    description: 'Handcrafted genuine leather journal with 240 ivory pages.',
    category: 'notebooks', categoryLabel: 'Notebooks',
    price: 499, originalPrice: 599, rating: 5, reviews: 67,
    badge: 'Best Seller', badgeType: 'bestseller',
    image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?q=80&w=500&auto=format&fit=crop',
    inStock: true, isFeatured: false,
  },
  {
    title: 'Gift Hamper Box – Deluxe',
    description: 'Curated gift hamper with stationery, stickers, mugs and more.',
    category: 'giftboxes', categoryLabel: 'Gift Boxes',
    price: 799, originalPrice: 999, rating: 5, reviews: 18,
    badge: 'New', badgeType: 'new',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=500&auto=format&fit=crop',
    inStock: true, isFeatured: false,
  },
  {
    title: '4×6 Photo Prints (Set of 10)',
    description: 'High-quality glossy photo prints. Upload your favourite memories.',
    category: 'prints', categoryLabel: 'Photo Prints',
    price: 99, originalPrice: 149, rating: 5, reviews: 53,
    badge: 'Sale', badgeType: 'sale',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=500&auto=format&fit=crop',
    inStock: true, isFeatured: false,
  },
  {
    title: 'Custom Birthday Card (Pack of 5)',
    description: 'Personalized handmade birthday cards with envelopes.',
    category: 'cards', categoryLabel: 'Greeting Cards',
    price: 149, originalPrice: 179, rating: 5, reviews: 38,
    badge: 'New', badgeType: 'new',
    image: 'https://images.unsplash.com/photo-1513135467880-6c41603b87ff?q=80&w=500&auto=format&fit=crop',
    inStock: true, isFeatured: false,
  },
  {
    title: 'Wooden Pen Stand with Drawer',
    description: 'Minimalist wooden desk organizer with pen stand and drawer.',
    category: 'stationery', categoryLabel: 'Stationery',
    price: 349, originalPrice: 399, rating: 4, reviews: 22,
    badge: '', badgeType: '',
    image: 'https://images.unsplash.com/photo-1587614382346-4ec70e388b28?q=80&w=500&auto=format&fit=crop',
    inStock: true, isFeatured: false,
  },
];

// ── Individual seeders ─────────────────────────────────────────────────────

async function seedSettings(): Promise<string> {
  const ref  = doc(db, 'settings', 'general');
  const snap = await getDoc(ref);
  if (snap.exists()) return 'settings already exists — skipped';
  await setDoc(ref, DEFAULT_SETTINGS);
  return 'settings/general created ✓';
}

async function seedCategories(): Promise<string> {
  const snap = await getDocs(query(collection(db, 'categories'), limit(1)));
  if (!snap.empty) return 'categories already exists — skipped';
  const batch = writeBatch(db);
  SEED_CATEGORIES.forEach((cat) => {
    // Use slug as document ID — guarantees no duplicates
    batch.set(doc(db, 'categories', cat.slug), cat);
  });
  await batch.commit();
  return `${SEED_CATEGORIES.length} categories created ✓`;
}

async function seedProducts(): Promise<string> {
  const snap = await getDocs(query(collection(db, 'products'), limit(1)));
  if (!snap.empty) return 'products already exists — skipped';
  // Use sequential adds to respect serverTimestamp ordering
  for (const p of SEED_PRODUCTS) {
    await addDoc(collection(db, 'products'), { ...p, createdAt: serverTimestamp() });
  }
  return `${SEED_PRODUCTS.length} products created ✓`;
}

// ── Main export ────────────────────────────────────────────────────────────

/** Returns a summary of what was done, throws on Firestore permission error */
export async function seedFirestoreIfEmpty(): Promise<string[]> {
  const results: string[] = [];
  results.push(await seedSettings());
  results.push(await seedCategories());
  results.push(await seedProducts());
  return results;
}

/** Delete EVERY document in products + categories, then re-seed fresh.
 *  Use this to remove duplicates. */
export async function clearAndReseed(): Promise<string[]> {
  const results: string[] = [];

  // Delete all products
  const prodSnap = await getDocs(collection(db, 'products'));
  const prodBatch = writeBatch(db);
  prodSnap.docs.forEach((d) => prodBatch.delete(d.ref));
  await prodBatch.commit();
  results.push(`Deleted ${prodSnap.size} old products`);

  // Delete all categories
  const catSnap = await getDocs(collection(db, 'categories'));
  const catBatch = writeBatch(db);
  catSnap.docs.forEach((d) => catBatch.delete(d.ref));
  await catBatch.commit();
  results.push(`Deleted ${catSnap.size} old categories`);

  // Re-seed fresh (categories with slug as doc ID to prevent future dupes)
  const catBatch2 = writeBatch(db);
  SEED_CATEGORIES.forEach((cat) => {
    catBatch2.set(doc(db, 'categories', cat.slug), cat);
  });
  await catBatch2.commit();
  results.push(`Added ${SEED_CATEGORIES.length} categories ✓`);

  for (const p of SEED_PRODUCTS) {
    await addDoc(collection(db, 'products'), { ...p, createdAt: serverTimestamp() });
  }
  results.push(`Added ${SEED_PRODUCTS.length} products ✓`);

  // Ensure settings exist
  results.push(await seedSettings());

  return results;
}
