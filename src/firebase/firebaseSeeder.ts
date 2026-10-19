/**
 * CRAFTONEST3D – Firestore Seeder
 * Phase 1: Pencil Toppers — 14 products with real images.
 * Prices set to 0 (Custom Quote) — update via Admin panel.
 */
import {
  collection, doc, getDoc, getDocs, setDoc, addDoc,
  serverTimestamp, query, limit, writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';

const DEFAULT_SETTINGS = {
  storeName:        'CRAFTONEST3D',
  storeEmail:       'hello@craftonest3d.in',
  storePhone:       '+91 98765 43210',
  whatsappNumber:   '918072851386',
  storeAddress:     'Maker Studio, Your City – 400001',
  businessHours:    'Mon – Sat: 10:00 AM – 8:00 PM',
  announcementText: 'Custom 3D Printed Pencil Toppers | Courier: Tamil Nadu Rs.70 * Other States vary',
  socialLinks: {
    facebook:  'https://facebook.com/craftonest3d',
    instagram: 'https://instagram.com/craftonest3d',
    youtube:   'https://youtube.com/@craftonest3d',
    pinterest: '',
  },
};

const SEED_CATEGORIES = [
  { name: 'All',            slug: 'all',            icon: '🖨️', sortOrder: 0, isActive: true },
  { name: 'Pencil Toppers', slug: 'pencil-toppers', icon: '✏️', sortOrder: 1, isActive: true },
];

// Name + Font + Size + Colour + Quantity on every product
const NAME_OPTIONS = [
  { label: 'Your Name / Text', type: 'text', placeholder: 'e.g. Emma, Priya, CRAFTO ✨', required: true },
  { label: 'Font Style', type: 'select', choices: 'Bubble,Bold,Cursive,Clean,Fun', required: true },
  { label: 'Size', type: 'select', choices: '3cm,4cm,5cm,6cm', required: true },
  { label: 'Colour', type: 'select', choices: 'Pink,Blue,Purple,Green,Yellow,Red,Orange,White,Black,Gold,Sky Blue,Lavender,Mint,Coral', required: true },
  { label: 'Quantity', type: 'select', choices: '1,2,3,5,10,15,20,25,50', required: true },
];

const PACK_OPTIONS = [
  { label: 'Name 1', type: 'text', placeholder: 'e.g. Emma', required: true },
  { label: 'Name 2', type: 'text', placeholder: 'e.g. Noah', required: false },
  { label: 'Name 3', type: 'text', placeholder: 'e.g. Mia', required: false },
  { label: 'Font Style', type: 'select', choices: 'Bubble,Bold,Cursive,Clean,Fun', required: true },
  { label: 'Size', type: 'select', choices: '3cm,4cm,5cm', required: true },
  { label: 'Colour', type: 'select', choices: 'Same Colour for All,Mix of 3 Colours,Custom per Name', required: true },
];

const BULK_OPTIONS = [
  { label: 'Names List', type: 'text', placeholder: 'Emma, Noah, Priya, Lucas, Mia… (list all names)', required: true },
  { label: 'Font Style', type: 'select', choices: 'Bubble,Bold,Cursive,Clean,Fun', required: true },
  { label: 'Size', type: 'select', choices: '3cm,4cm,5cm', required: true },
  { label: 'Colour', type: 'select', choices: 'Same Colour,Mix Random,Custom per Name', required: true },
  { label: 'Quantity', type: 'select', choices: '10 pcs,15 pcs,20 pcs,25 pcs,50 pcs,100 pcs', required: true },
];

const SEED_PRODUCTS = [
  {
    title: 'NameTag Topper — Classic',
    description: 'The original custom name pencil topper. Your name in 3D, fits all standard pencils. Smooth finish, lightweight and durable. Perfect everyday companion for school and office.',
    category: 'pencil-toppers', categoryLabel: 'Pencil Toppers',
    price: 49, originalPrice: 79, rating: 5, reviews: 24,
    badge: 'Best Seller', badgeType: 'bestseller',
    image: '/products/pt-1.webp',
    inStock: true, isFeatured: true, material: 'PLA',
    customOptions: NAME_OPTIONS,
    sizePrices:         { '3cm': 49, '4cm': 69, '5cm': 89, '6cm': 109 },
    sizeOriginalPrices: { '3cm': 79, '4cm': 99, '5cm': 129, '6cm': 149 },
  },
  {
    title: 'BubbleName Topper — Puffy 3D',
    description: 'Chunky, puffy bubble-letter style name topper. Bold and fun — kids absolutely love it. Bright colours available. Great for birthday gifts and school stationery sets.',
    category: 'pencil-toppers', categoryLabel: 'Pencil Toppers',
    price: 0, originalPrice: 0, rating: 5, reviews: 18,
    badge: 'New', badgeType: 'new',
    image: '/products/pt-2.webp',
    inStock: true, isFeatured: true, material: 'PLA',
    customOptions: NAME_OPTIONS,
  },
  {
    title: 'GlowScript Topper — Cursive Style',
    description: 'Elegant flowing cursive name topper. Stylish script lettering in a smooth 3D finish. Perfect for gifting, personalized stationery and desk accessories.',
    category: 'pencil-toppers', categoryLabel: 'Pencil Toppers',
    price: 0, originalPrice: 0, rating: 5, reviews: 15,
    badge: 'Featured', badgeType: 'featured',
    image: '/products/pt-3.webp',
    inStock: true, isFeatured: true, material: 'PLA',
    customOptions: NAME_OPTIONS,
  },
  {
    title: 'MiniBlock Topper — Bold & Clean',
    description: 'Strong block-letter name topper with a clean modern look. Great for older kids and adults. Fits pens and pencils. Available in premium matte colours.',
    category: 'pencil-toppers', categoryLabel: 'Pencil Toppers',
    price: 0, originalPrice: 0, rating: 5, reviews: 12,
    badge: 'New', badgeType: 'new',
    image: '/products/pt-4.webp',
    inStock: true, isFeatured: true, material: 'PLA',
    customOptions: NAME_OPTIONS,
  },
  {
    title: 'StarName Topper — With Star Accent',
    description: 'Custom name topper with a cute star accent on the side. Makes every pencil feel extra special. Popular for school gift sets and reward prizes.',
    category: 'pencil-toppers', categoryLabel: 'Pencil Toppers',
    price: 0, originalPrice: 0, rating: 5, reviews: 20,
    badge: 'Best Seller', badgeType: 'bestseller',
    image: '/products/pt-5.webp',
    inStock: true, isFeatured: true, material: 'PLA',
    customOptions: NAME_OPTIONS,
  },
  {
    title: 'HeartName Topper — Love Edition',
    description: 'Name topper with a sweet heart design element. Perfect for Valentine\'s Day, birthdays and gifting someone special. Available in all colours.',
    category: 'pencil-toppers', categoryLabel: 'Pencil Toppers',
    price: 0, originalPrice: 0, rating: 5, reviews: 17,
    badge: 'New', badgeType: 'new',
    image: '/products/pt-6.webp',
    inStock: true, isFeatured: false, material: 'PLA',
    customOptions: NAME_OPTIONS,
  },
  {
    title: 'RainbowName Topper — Multi Colour',
    description: 'Eye-catching multi-coloured name topper. Each letter in a different colour — stands out on any pencil. Great for creative kids who love colour.',
    category: 'pencil-toppers', categoryLabel: 'Pencil Toppers',
    price: 0, originalPrice: 0, rating: 5, reviews: 22,
    badge: 'Best Seller', badgeType: 'bestseller',
    image: '/products/pt-7.webp',
    inStock: true, isFeatured: true, material: 'PLA',
    customOptions: [
      { label: 'Your Name / Text', type: 'text', placeholder: 'e.g. Emma, Priya, CRAFTO ✨', required: true },
      { label: 'Colour Style', type: 'select', choices: 'Full Rainbow,Pink & Purple,Blue & Green,Warm Tones,Custom', required: true },
      { label: 'Size', type: 'select', choices: '3cm,4cm,5cm,6cm', required: true },
      { label: 'Quantity', type: 'select', choices: '1,2,3,5,10,15,20', required: true },
    ],
  },
  {
    title: 'EmojiName Topper — With Emoji',
    description: 'Fun name topper with your favourite emoji alongside your name. Choose from 50+ emoji designs. Perfect for kids who love expressing themselves.',
    category: 'pencil-toppers', categoryLabel: 'Pencil Toppers',
    price: 0, originalPrice: 0, rating: 5, reviews: 19,
    badge: 'New', badgeType: 'new',
    image: '/products/pt-8.webp',
    inStock: true, isFeatured: false, material: 'PLA',
    customOptions: [
      { label: 'Your Name / Text', type: 'text', placeholder: 'e.g. Emma, Priya', required: true },
      { label: 'Emoji Choice', type: 'select', choices: '⭐ Star,❤️ Heart,🌈 Rainbow,🦋 Butterfly,🌸 Flower,⚽ Football,🎮 Game,🎵 Music,🦄 Unicorn,👑 Crown,🔥 Fire,🌙 Moon', required: true },
      { label: 'Size', type: 'select', choices: '4cm,5cm,6cm', required: true },
      { label: 'Colour', type: 'select', choices: 'Pink,Blue,Purple,Green,Yellow,White,Black,Gold', required: true },
      { label: 'Quantity', type: 'select', choices: '1,2,3,5,10,15,20', required: true },
    ],
  },
  {
    title: 'TwinPack Topper — Set of 2',
    description: 'Two matching custom name pencil toppers in one order. Great for siblings, best friends or gifting pairs. Same name or two different names available.',
    category: 'pencil-toppers', categoryLabel: 'Pencil Toppers',
    price: 0, originalPrice: 0, rating: 5, reviews: 11,
    badge: 'New', badgeType: 'new',
    image: '/products/pt-9.webp',
    inStock: true, isFeatured: false, material: 'PLA',
    customOptions: [
      { label: 'Name 1', type: 'text', placeholder: 'e.g. Emma', required: true },
      { label: 'Name 2', type: 'text', placeholder: 'e.g. Noah (or same as Name 1)', required: true },
      { label: 'Font Style', type: 'select', choices: 'Bubble,Bold,Cursive,Clean,Fun', required: true },
      { label: 'Size', type: 'select', choices: '3cm,4cm,5cm', required: true },
      { label: 'Colour', type: 'select', choices: 'Same Colour,Two Different Colours,Custom', required: true },
    ],
  },
  {
    title: 'ClassPack — Set of 3 Names',
    description: 'Set of 3 fully customized name pencil toppers. Perfect for classroom gifting, school events, birthday party favours and teacher appreciation gifts.',
    category: 'pencil-toppers', categoryLabel: 'Pencil Toppers',
    price: 0, originalPrice: 0, rating: 5, reviews: 14,
    badge: 'Best Seller', badgeType: 'bestseller',
    image: '/products/pt-10.webp',
    inStock: true, isFeatured: true, material: 'PLA',
    customOptions: PACK_OPTIONS,
  },
  {
    title: 'FunkyName Topper — Wavy Style',
    description: 'Wavy, funky-style letters that give your name a playful personality. Unique design that stands out. Great for creative and artsy kids.',
    category: 'pencil-toppers', categoryLabel: 'Pencil Toppers',
    price: 0, originalPrice: 0, rating: 5, reviews: 8,
    badge: 'New', badgeType: 'new',
    image: '/products/pt-11.webp',
    inStock: true, isFeatured: false, material: 'PLA',
    customOptions: NAME_OPTIONS,
  },
  {
    title: 'SlimLine Topper — Sleek & Minimal',
    description: 'Slim, minimal and modern name topper. Clean lines, professional look. Great for older students, adults and desk setups. Fits pens and pencils perfectly.',
    category: 'pencil-toppers', categoryLabel: 'Pencil Toppers',
    price: 0, originalPrice: 0, rating: 5, reviews: 7,
    badge: 'New', badgeType: 'new',
    image: '/products/pt-12.webp',
    inStock: true, isFeatured: false, material: 'PLA',
    customOptions: NAME_OPTIONS,
  },
  {
    title: 'PartyPack — School Event Bundle (10 pcs)',
    description: 'Perfect for school parties, classroom events, birthday favours and corporate gifting. 10 custom name pencil toppers — each with a different name. Special low bulk per-piece price.',
    category: 'pencil-toppers', categoryLabel: 'Pencil Toppers',
    price: 39, originalPrice: 49, rating: 5, reviews: 9,
    badge: 'Best Seller', badgeType: 'bestseller',
    image: '/products/pt-13.webp',
    inStock: true, isFeatured: true, material: 'PLA',
    customOptions: BULK_OPTIONS,
    // Low BULK per-piece rate (single topper is ₹49 — bulk is cheaper per piece)
    sizePrices:         { '3cm': 35, '4cm': 39, '5cm': 45 },
    sizeOriginalPrices: { '3cm': 49, '4cm': 55, '5cm': 65 },
  },
  {
    title: 'MegaBulk Toppers — Custom Batch (25–100 pcs)',
    description: 'Large quantity custom name pencil toppers for schools, events, corporate gifting and wholesale. Lowest per-piece price on larger quantities. Each topper fully customized.',
    category: 'pencil-toppers', categoryLabel: 'Pencil Toppers',
    price: 29, originalPrice: 49, rating: 5, reviews: 5,
    badge: 'Custom', badgeType: 'custom',
    image: '/products/pt-14.webp',
    inStock: true, isFeatured: false, material: 'PLA',
    // Lowest BULK per-piece rate — cheaper than PartyPack because larger batch
    sizePrices:         { '3cm': 25, '4cm': 29, '5cm': 35 },
    sizeOriginalPrices: { '3cm': 49, '4cm': 55, '5cm': 65 },
    customOptions: [
      { label: 'Names List', type: 'text', placeholder: 'Paste or type all names here (one per line or comma separated)', required: true },
      { label: 'Font Style', type: 'select', choices: 'Bubble,Bold,Cursive,Clean,Fun', required: true },
      { label: 'Size', type: 'select', choices: '3cm,4cm,5cm', required: true },
      { label: 'Colour', type: 'select', choices: 'Same Colour,Mix Random,Custom per Name', required: true },
      { label: 'Quantity', type: 'select', choices: '25 pcs,50 pcs,75 pcs,100 pcs,150 pcs,200 pcs', required: true },
    ],
  },
];

// ── Seeders ────────────────────────────────────────────────────────────────

async function seedSettings(): Promise<string> {
  const ref  = doc(db, 'settings', 'general');
  const snap = await getDoc(ref);
  if (snap.exists()) return 'settings already exists — skipped';
  await setDoc(ref, DEFAULT_SETTINGS);
  return 'settings created ✓';
}

async function seedCategories(): Promise<string> {
  const snap = await getDocs(query(collection(db, 'categories'), limit(1)));
  if (!snap.empty) return 'categories already exists — skipped';
  const batch = writeBatch(db);
  SEED_CATEGORIES.forEach((cat) => {
    batch.set(doc(db, 'categories', cat.slug), cat);
  });
  await batch.commit();
  return `${SEED_CATEGORIES.length} categories created ✓`;
}

async function seedProducts(): Promise<string> {
  const snap = await getDocs(query(collection(db, 'products'), limit(1)));
  if (!snap.empty) return 'products already exists — skipped';
  for (const p of SEED_PRODUCTS) {
    await addDoc(collection(db, 'products'), { ...p, createdAt: serverTimestamp() });
  }
  return `${SEED_PRODUCTS.length} products created ✓`;
}

export async function seedFirestoreIfEmpty(): Promise<string[]> {
  const results: string[] = [];
  results.push(await seedSettings());
  results.push(await seedCategories());
  results.push(await seedProducts());
  return results;
}

/**
 * NON-DESTRUCTIVE sync: adds only seed items that are missing, and NEVER
 * deletes or overwrites anything you've edited in the admin.
 * - Categories are matched by slug.
 * - Products are matched by title (case-insensitive).
 * Use this to pull in newly-added sample items without losing your prices/edits.
 */
export async function syncNewSeedItems(): Promise<string[]> {
  const results: string[] = [];

  // Categories — add only missing slugs
  const catSnap = await getDocs(collection(db, 'categories'));
  const existingSlugs = new Set(catSnap.docs.map((d) => d.id));
  const catBatch = writeBatch(db);
  let catsAdded = 0;
  SEED_CATEGORIES.forEach((cat) => {
    if (!existingSlugs.has(cat.slug)) {
      catBatch.set(doc(db, 'categories', cat.slug), cat);
      catsAdded++;
    }
  });
  if (catsAdded > 0) await catBatch.commit();
  results.push(catsAdded > 0 ? `Added ${catsAdded} new categories ✓` : 'Categories already up to date');

  // Products — add only titles that don't already exist (preserves your edits)
  const prodSnap = await getDocs(collection(db, 'products'));
  const existingTitles = new Set(
    prodSnap.docs.map((d) => String((d.data() as { title?: string }).title ?? '').trim().toLowerCase()),
  );
  let prodsAdded = 0;
  for (const p of SEED_PRODUCTS) {
    if (!existingTitles.has(p.title.trim().toLowerCase())) {
      await addDoc(collection(db, 'products'), { ...p, createdAt: serverTimestamp() });
      prodsAdded++;
    }
  }
  results.push(prodsAdded > 0 ? `Added ${prodsAdded} new products ✓` : 'Products already up to date — nothing overwritten');

  results.push(await seedSettings());
  return results;
}

export async function clearAndReseed(): Promise<string[]> {
  const results: string[] = [];

  const prodSnap = await getDocs(collection(db, 'products'));
  const prodBatch = writeBatch(db);
  prodSnap.docs.forEach((d) => prodBatch.delete(d.ref));
  await prodBatch.commit();
  results.push(`Deleted ${prodSnap.size} old products`);

  const catSnap = await getDocs(collection(db, 'categories'));
  const catBatch = writeBatch(db);
  catSnap.docs.forEach((d) => catBatch.delete(d.ref));
  await catBatch.commit();
  results.push(`Deleted ${catSnap.size} old categories`);

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

  results.push(await seedSettings());
  return results;
}


