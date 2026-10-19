/**
 * CRAFTONEST3D – Product / Work Service (Firestore)
 * Collection: "products"
 *
 * NOTE on ordering: composite indexes (isFeatured + createdAt) must exist in
 * Firestore before the compound query works. We fall back to client-side sort
 * so the app never crashes while indexes are being built.
 */
import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc,
  deleteDoc, query, where, orderBy, serverTimestamp,
  Timestamp, type QuerySnapshot,
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import type { Product } from '../types';

type DocumentData = Record<string, unknown>;

const COL = 'products';

// ── Helper ─────────────────────────────────────────────────────────────────

function toProduct(id: string, data: Record<string, unknown>): Product {
  return {
    id,
    title:           (data.title          as string)  ?? '',
    description:     (data.description    as string)  ?? '',
    category:        (data.category       as string)  ?? '',
    categoryLabel:   (data.categoryLabel  as string)  ?? '',
    price:           (data.price          as number)  ?? 0,
    originalPrice:   (data.originalPrice  as number)  ?? 0,
    rating:          (data.rating         as number)  ?? 5,
    reviews:         (data.reviews        as number)  ?? 0,
    badge:           (data.badge          as Product['badge'])     ?? '',
    badgeType:       (data.badgeType      as Product['badgeType']) ?? '',
    image:           (data.image          as string)  ?? '',
    inStock:         (data.inStock        as boolean) ?? true,
    isFeatured:      (data.isFeatured     as boolean) ?? false,
    isBulk:          (data.isBulk         as boolean) ?? false,
    isCustomizable:  (data.isCustomizable as boolean | undefined),
    colourEnabled:   (data.colourEnabled  as boolean | undefined),
    availableColours:(data.availableColours as string[] | undefined) ?? undefined,
    images:          (data.images         as string[] | undefined) ?? undefined,
    videoUrl:        (data.videoUrl       as string | undefined),
    videoEnabled:    (data.videoEnabled   as boolean) ?? false,
    material:        (data.material       as string)  ?? undefined,
    size:            (data.size           as string)  ?? undefined,
    customOptions:   (data.customOptions  as import('../types').ProductCustomOption[] | undefined) ?? undefined,
    sizePrices:         (data.sizePrices         as Record<string, number> | undefined) ?? undefined,
    sizeOriginalPrices: (data.sizeOriginalPrices as Record<string, number> | undefined) ?? undefined,
    whatsappMessage: (data.whatsappMessage as string | undefined),
    createdAt:
      data.createdAt instanceof Timestamp ? data.createdAt.toDate() : undefined,
  };
}

function snapToProducts(snap: QuerySnapshot<DocumentData>): Product[] {
  return snap.docs.map((d) => toProduct(d.id, d.data() as Record<string, unknown>));
}

/** Sort newest-first, tolerating docs without createdAt */
function sortNewest(products: Product[]): Product[] {
  return [...products].sort((a, b) => {
    const ta = a.createdAt?.getTime() ?? 0;
    const tb = b.createdAt?.getTime() ?? 0;
    return tb - ta;
  });
}

// ── Public read functions ──────────────────────────────────────────────────

export async function getAllProducts(): Promise<Product[]> {
  try {
    const snap = await getDocs(query(collection(db, COL), orderBy('createdAt', 'desc')));
    return snapToProducts(snap);
  } catch {
    // Index not built yet or createdAt missing — fall back to unordered read
    const snap = await getDocs(collection(db, COL));
    return sortNewest(snapToProducts(snap));
  }
}

export async function getFeaturedProducts(): Promise<Product[]> {
  try {
    // Composite index: isFeatured ASC + createdAt DESC — may need to be created
    const snap = await getDocs(
      query(
        collection(db, COL),
        where('isFeatured', '==', true),
        orderBy('createdAt', 'desc'),
      ),
    );
    return snapToProducts(snap);
  } catch {
    // Fallback: fetch all, filter client-side (no composite index needed)
    const all = await getAllProducts();
    return all.filter((p) => p.isFeatured);
  }
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  try {
    const snap = await getDocs(
      query(
        collection(db, COL),
        where('category', '==', categorySlug),
        orderBy('createdAt', 'desc'),
      ),
    );
    return snapToProducts(snap);
  } catch {
    const all = await getAllProducts();
    return all.filter((p) => p.category === categorySlug);
  }
}

export async function searchProducts(queryStr: string): Promise<Product[]> {
  const all = await getAllProducts();
  const q = queryStr.toLowerCase();
  return all.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.categoryLabel.toLowerCase().includes(q),
  );
}

export async function getProductById(id: string): Promise<Product | null> {
  const snap = await getDoc(doc(db, COL, id));
  if (!snap.exists()) return null;
  return toProduct(snap.id, snap.data() as Record<string, unknown>);
}

// ── Admin CRUD ─────────────────────────────────────────────────────────────

/** Remove undefined values — Firestore rejects them */
function clean<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined) out[key] = val;
  }
  return out;
}

export async function addProduct(product: Omit<Product, 'id'>): Promise<string> {
  const { createdAt: _c, ...rest } = product as Product;
  const ref = await addDoc(collection(db, COL), {
    ...clean(rest),
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<void> {
  const { createdAt: _c, id: _id, ...rest } = data as Product;
  await updateDoc(doc(db, COL, id), clean(rest));
}

export async function deleteProduct(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}

// ── WhatsApp URL builder ───────────────────────────────────────────────────

/** Build a reliable WhatsApp URL. Cleans the number to digits only. */
export function waUrl(whatsappNumber: string, message: string): string {
  const num = (whatsappNumber || '').replace(/[^0-9]/g, '');
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
}

export function buildWhatsAppOrderUrl(product: Product, whatsappNumber: string): string {
  const materialLine = product.material ? `\nMaterial: ${product.material}` : '';
  const sizeLine = product.size ? `\nSize: ${product.size}` : '';
  const message =
    product.whatsappMessage ??
    `Hi CRAFTONEST3D! 👋\n\nI'm interested in this work:\n\n*${product.title}*\nCategory: ${product.categoryLabel}${materialLine}${sizeLine}\n\nI'd like to discuss a custom order. Could you share details?`;
  return waUrl(whatsappNumber, message);
}
