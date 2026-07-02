/**
 * PaperNest – Shared TypeScript Types
 * Matches Firestore collection schemas.
 */

/** ── Product ──────────────────────────────────────── */
export interface Product {
  id: string;
  title: string;
  description: string;
  category: string;         // Category slug, e.g. "stickers"
  categoryLabel: string;    // Human-readable label, e.g. "Stickers"
  price: number;
  originalPrice: number;
  rating: number;           // 1–5
  reviews: number;
  badge?: 'New' | 'Best Seller' | 'Sale' | 'Featured' | '';
  badgeType?: 'new' | 'bestseller' | 'sale' | 'featured' | '';
  image: string;            // URL
  inStock: boolean;
  isFeatured: boolean;
  whatsappMessage?: string; // Pre-filled WhatsApp message (overrides default)
  createdAt?: Date;
}

/** ── Category ─────────────────────────────────────── */
export interface Category {
  id: string;
  name: string;             // Display name
  slug: string;             // URL slug
  icon?: string;            // Icon class or emoji
  sortOrder: number;
  isActive: boolean;
}

/** ── Site Settings ────────────────────────────────── */
export interface SiteSettings {
  whatsappNumber: string;   // E.g. "919876543210" (no + or spaces)
  storeName: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  businessHours: string;
  announcementText: string;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    pinterest?: string;
  };
}

/** ── Newsletter Subscriber ────────────────────────── */
export interface NewsletterSubscriber {
  email: string;
  subscribedAt: Date;
}

/** ── Contact Form ─────────────────────────────────── */
export interface ContactMessage {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  sentAt: Date;
}
