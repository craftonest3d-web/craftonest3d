/**
 * PaperNest – Category Service (Firestore)
 * Collection: "categories"
 * Public function signatures unchanged — existing pages need no edits.
 */
import {
  collection, doc, getDocs, addDoc, updateDoc,
  deleteDoc, query, orderBy,
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import type { Category } from '../types';

const COL = 'categories';

function toCategory(id: string, data: Record<string, unknown>): Category {
  return {
    id,
    name:      (data.name      as string)  ?? '',
    slug:      (data.slug      as string)  ?? '',
    icon:      (data.icon      as string | undefined),
    sortOrder: (data.sortOrder as number)  ?? 0,
    isActive:  (data.isActive  as boolean) ?? true,
  };
}

// ── Public read functions ──────────────────────────────────────────────────

export async function getAllCategories(): Promise<Category[]> {
  const snap = await getDocs(query(collection(db, COL), orderBy('sortOrder', 'asc')));
  return snap.docs
    .map((d) => toCategory(d.id, d.data() as Record<string, unknown>))
    .filter((c) => c.isActive);
}

/** Returns ALL categories including inactive (admin use) */
export async function getAllCategoriesAdmin(): Promise<Category[]> {
  const snap = await getDocs(query(collection(db, COL), orderBy('sortOrder', 'asc')));
  return snap.docs.map((d) => toCategory(d.id, d.data() as Record<string, unknown>));
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const all = await getAllCategories();
  return all.find((c) => c.slug === slug) ?? null;
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

export async function addCategory(category: Omit<Category, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, COL), clean(category));
  return ref.id;
}

export async function updateCategory(id: string, data: Partial<Category>): Promise<void> {
  await updateDoc(doc(db, COL, id), clean(data));
}

export async function deleteCategory(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}
