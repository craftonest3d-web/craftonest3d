/**
 * PaperNest – Settings Service (Firestore)
 * Collection: "settings" — single document id "general"
 */
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import type { SiteSettings } from '../types';

const DOC_REF = () => doc(db, 'settings', 'general');

export const DEFAULT_SETTINGS: SiteSettings = {
  /* Business */
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

  /* Hero slides */
  heroSlides: [
    {
      badge:            '\u2728 Premium Stationery Store',
      heading:          'Your One Stop Shop For',
      headingHighlight: 'Stationery & Gifts',
      subtext:          'Explore premium stationery, personalized gifts, stickers, photo prints and much more. Order easily on WhatsApp!',
      buttonText:       'Shop Now',
      buttonLink:       '/products',
      image:            'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=800&auto=format&fit=crop',
      bgColor:          '#fff0f3',
    },
    {
      badge:            '\uD83C\uDF81 Personalized Gifts',
      heading:          'Make Every Moment',
      headingHighlight: 'Extra Special',
      subtext:          'Custom mugs, photo frames, keychains and more. Personalized gifts for every occasion.',
      buttonText:       'Explore Gifts',
      buttonLink:       '/products?category=gifts',
      image:            'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop',
      bgColor:          '#e8f4ff',
    },
  ],

  /* Promo banners */
  promoBanners: [
    {
      badge:       'Best Sellers',
      heading:     'Personalized Gifts',
      subtext:     'Make every moment special with customized gifts for your loved ones.',
      buttonText:  'Explore Now',
      buttonLink:  '/products?category=gifts',
      image:       'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=300&auto=format&fit=crop',
      bgColor:     '#fff0f3',
    },
    {
      badge:       'New Collection',
      heading:     'Stickers & Prints',
      subtext:     'High-quality waterproof stickers and vivid photo prints for every style.',
      buttonText:  'Explore Now',
      buttonLink:  '/products?category=stickers',
      image:       'https://images.unsplash.com/photo-1572375995501-4b0894dbe0d1?q=80&w=300&auto=format&fit=crop',
      bgColor:     '#eef4ff',
    },
  ],

  /* Section headings */
  featuredTitle:     '\u2728 Featured Products',
  featuredSubtext:   'Handpicked bestsellers and new arrivals just for you.',
  whyTitle:          'Why Choose PaperNest?',
  whySubtext:        'We go the extra mile to make your stationery and gifting experience truly special.',
  categoriesTitle:   'Browse by Category',
  categoriesSubtext: 'Find exactly what you\'re looking for across our curated collections.',
  newsletterTitle:   'Get Exclusive Deals in Your Inbox',
  newsletterSubtext: 'Subscribe to receive special offers, new product launches and gift inspirations. Join 10,000+ happy subscribers!',

  /* About */
  aboutHeading:     'About PaperNest',
  aboutSubheading:  'We are a passionate team dedicated to bringing you the finest stationery and personalized gifts in India.',
  aboutStory:       'PaperNest was founded in 2024 with a simple mission: to make beautiful, high-quality stationery and personalized gifts accessible to everyone across India. What started as a small passion project has grown into a trusted brand loved by thousands.',
  aboutMission:     'To provide every customer with premium quality stationery and personalized gifts at affordable prices, delivered with care and a smile.',
  aboutVision:      'To become India\'s most loved online stationery and personalized gifts brand, recognized for our quality, creativity and customer-first approach.',
  aboutImage:       'https://images.unsplash.com/photo-1531346878377-a5be20888e57?q=80&w=800&auto=format&fit=crop',

  /* Contact */
  contactHeading:    'Get in Touch',
  contactSubheading: 'Have a question about our products or want to place a custom order? We\'d love to hear from you!',
};

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const snap = await getDoc(DOC_REF());
    if (snap.exists()) {
      return { ...DEFAULT_SETTINGS, ...(snap.data() as Partial<SiteSettings>) };
    }
  } catch {
    // Firestore unreachable — return defaults
  }
  return { ...DEFAULT_SETTINGS };
}

export async function saveSiteSettings(settings: SiteSettings): Promise<void> {
  await setDoc(DOC_REF(), { ...settings }, { merge: true });
}
