/**
 * PaperNest – Shared TypeScript Types
 * Matches Firestore collection schemas.
 */

/** ── Product ──────────────────────────────────────── */
export interface Product {
  id: string;
  title: string;
  description: string;
  category: string;
  categoryLabel: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  badge?: 'New' | 'Best Seller' | 'Sale' | 'Featured' | '';
  badgeType?: 'new' | 'bestseller' | 'sale' | 'featured' | '';
  image: string;
  inStock: boolean;
  isFeatured: boolean;
  whatsappMessage?: string;
  createdAt?: Date;
}

/** ── Category ─────────────────────────────────────── */
export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
}

/** ── Hero Slide ───────────────────────────────────── */
export interface HeroSlide {
  badge: string;          // e.g. "✨ Premium Stationery Store"
  heading: string;        // e.g. "Your One Stop Shop For"
  headingHighlight: string; // e.g. "Stationery & Gifts"
  subtext: string;        // paragraph text
  buttonText: string;     // e.g. "Shop Now"
  buttonLink: string;     // e.g. "/products"
  image: string;          // hero image URL
  bgColor: string;        // e.g. "#fff0f3"
}

/** ── Promo Banner ─────────────────────────────────── */
export interface PromoBanner {
  badge: string;
  heading: string;
  subtext: string;
  buttonText: string;
  buttonLink: string;
  image: string;
  bgColor: string;
}

/** ── Site Settings ────────────────────────────────── */
export interface SiteSettings {
  /* Business info */
  whatsappNumber:   string;
  storeName:        string;
  storeEmail:       string;
  storePhone:       string;
  storeAddress:     string;
  businessHours:    string;
  announcementText: string;
  socialLinks: {
    facebook?:  string;
    instagram?: string;
    youtube?:   string;
    pinterest?: string;
  };

  /* Hero section */
  heroSlides: HeroSlide[];

  /* Promo banners */
  promoBanners: PromoBanner[];

  /* Section headings */
  featuredTitle:       string;  // e.g. "✨ Featured Products"
  featuredSubtext:     string;
  whyTitle:            string;  // e.g. "Why Choose PaperNest?"
  whySubtext:          string;
  categoriesTitle:     string;
  categoriesSubtext:   string;
  newsletterTitle:     string;
  newsletterSubtext:   string;

  /* About page */
  aboutHeading:        string;
  aboutSubheading:     string;
  aboutStory:          string;
  aboutMission:        string;
  aboutVision:         string;
  aboutImage:          string;

  /* Contact page */
  contactHeading:      string;
  contactSubheading:   string;
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
