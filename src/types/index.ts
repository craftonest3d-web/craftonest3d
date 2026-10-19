/**
 * CRAFTONEST3D – Shared TypeScript Types
 * Matches Firestore collection schemas.
 */

/** ── Product / Portfolio Work ──────────────────────── */
export interface ProductCustomOption {
  /** e.g. "Name", "Size", "Color" */
  label: string;
  /** "text" = free-text input, "select" = dropdown choices */
  type: 'text' | 'select';
  /** For select type: comma-separated choices e.g. "5cm,8cm,10cm,12cm" */
  choices?: string;
  placeholder?: string;
  required: boolean;
}

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
  badge?: 'New' | 'Best Seller' | 'Sale' | 'Featured' | 'Custom' | '';
  badgeType?: 'new' | 'bestseller' | 'sale' | 'featured' | 'custom' | '';
  image: string;
  inStock: boolean;
  isFeatured: boolean;
  /** Bulk / wholesale item → shows batch dropdown + "Enquire for Bulk Price" only (no cart) */
  isBulk?: boolean;
  material?: string;
  size?: string;
  /** Customization options the customer fills before enquiring */
  customOptions?: ProductCustomOption[];
  /** Size-based selling price, e.g. { "3cm": 79, "4cm": 99, "5cm": 129 } */
  sizePrices?: Record<string, number>;
  /** Size-based original/MRP price (struck through), e.g. { "3cm": 99, "4cm": 129 } */
  sizeOriginalPrices?: Record<string, number>;
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
  badge: string;          // e.g. "✨ Custom 3D Printing Studio"
  heading: string;        // e.g. "CRAFTONEST3D"
  headingHighlight: string; // e.g. "Where Ideas Take Shape"
  subtext: string;        // paragraph text
  buttonText: string;     // e.g. "Shop Now"
  buttonLink: string;     // e.g. "/our-work"
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

  /* Payment */
  upiId?:           string;   // e.g. "craftonest3d@okaxis"
  upiNumber?:       string;   // GPay/PhonePe number e.g. "918072851386"
  codAvailable?:    boolean;  // Cash on Delivery available?
  /** Ready-made payment reply the owner copy-pastes after confirming an order */
  paymentReplyMessage?: string;
  /** Available colours shown in the shop customizer (owner-managed) */
  shopColours?: { label: string; hex: string }[];
  /** Festival / seasonal greeting popup + home banner (owner-controlled) */
  festival?: {
    enabled: boolean;        // show it or not
    image: string;           // uploaded PNG / GIF greeting (shown as-is)
    title: string;           // e.g. "Happy Diwali! 🪔"
    message: string;         // e.g. "Flat 25% OFF all pencil toppers"
    buttonText: string;      // e.g. "Shop Festival Offers"
    buttonLink: string;      // e.g. "/shop"
    showPopup: boolean;      // popup on first visit
    showBanner: boolean;     // slim banner on home page
    accent: string;          // accent/glow colour, e.g. "#d4af37"
  };
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
  featuredTitle:       string;  // e.g. "RECENT WORKS"
  featuredSubtext:     string;
  whyTitle:            string;  // e.g. "OUR SERVICES"
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

/** ── Order (admin-only history) ────────────────────── */
export type OrderStatus = 'pending' | 'confirmed' | 'paid' | 'shipped' | 'completed' | 'cancelled';

export interface OrderItem {
  title: string;
  quantity: number;
  unitPrice: number;      // 0 = quote on request
  lineTotal: number;      // unitPrice * quantity
  /** Customization details, e.g. { "Name / Text": "Emma", "Size": "5cm" } */
  options: Record<string, string>;
}

export interface Order {
  id: string;
  /** Short human-friendly reference, e.g. "CN-7F3A" */
  ref: string;
  customerName: string;         // name entered in the customizer (best-effort)
  items: OrderItem[];
  total: number;                // sum of lineTotals (0 if all quote-only)
  itemCount: number;            // total pieces across items
  source: 'single' | 'cart';    // which flow created it
  status: OrderStatus;

  /* Payment info the owner logs manually after receiving money */
  paymentAmount?: number;       // amount actually received
  paymentRef?: string;          // UPI reference / txn id
  paymentNote?: string;         // free note (date, method, etc.)

  createdAt?: Date;
}
