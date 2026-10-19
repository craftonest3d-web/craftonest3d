/**
 * CRAFTONEST3D – Settings Service (Firestore)
 * Collection: "settings" — single document id "general"
 */
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import type { SiteSettings } from '../types';

const DOC_REF = () => doc(db, 'settings', 'general');

export const DEFAULT_SETTINGS: SiteSettings = {
  /* Business */
  whatsappNumber:   '918072851386',
  storeName:        'CRAFTONEST3D',
  storeEmail:       'craftonest3d@gmail.com',
  storePhone:       '+91 80728 51386',
  storeAddress:     'Your City, India',
  businessHours:    'Mon – Sat: 10:00 AM – 8:00 PM',
  announcementText: '✨ Custom 3D Printed Pencil Toppers | 🚚 Courier: Tamil Nadu ₹70 · Other States vary · Confirmed on WhatsApp',

  /* Payment */
  upiId:        '',
  upiNumber:    '918072851386',
  codAvailable: false,
  shopColours: [
    { label: 'Pink',     hex: '#FF6B9D' },
    { label: 'Blue',     hex: '#4A90E2' },
    { label: 'Purple',   hex: '#9B59B6' },
    { label: 'Green',    hex: '#2ECC71' },
    { label: 'Yellow',   hex: '#F1C40F' },
    { label: 'Red',      hex: '#E74C3C' },
    { label: 'Orange',   hex: '#E67E22' },
    { label: 'White',    hex: '#FFFFFF' },
    { label: 'Black',    hex: '#2C2C2C' },
    { label: 'Gold',     hex: '#D4AF37' },
    { label: 'Sky Blue', hex: '#87CEEB' },
    { label: 'Lavender', hex: '#C39BD3' },
  ],
  paymentReplyMessage:
    'Thank you for confirming your order! 🙏\n\n' +
    'Please pay the advance to one of the below:\n' +
    '• GPay / PhonePe: 918072851386\n' +
    '• UPI ID: (add your UPI id)\n\n' +
    'After payment, kindly share the screenshot here. We will start printing once the advance is received. 🖨️',

  festival: {
    enabled:    false,
    image:      '',
    title:      'Happy Festival! 🎉',
    message:    'Special festive offer — flat discount on all custom pencil toppers!',
    buttonText: 'Shop Offers',
    buttonLink: '/shop',
    showPopup:  true,
    showBanner: true,
    accent:     '#d4af37',
  },

  socialLinks: {
    facebook:  'https://facebook.com/craftonest3d',
    instagram: 'https://instagram.com/craftonest3d',
    youtube:   'https://youtube.com/@craftonest3d',
    pinterest: '',
  },

  /* Hero slides — used only if home page reads from Firestore */
  heroSlides: [
    {
      badge:            '✨ Custom 3D Printing Studio',
      heading:          'CRAFTONEST3D',
      headingHighlight: 'Where Ideas Take Shape',
      subtext:          'From imagination to reality — we turn your ideas into high-quality 3D printed creations. Personalized pencil toppers, keychains, miniatures, toys and more.',
      buttonText:       'START YOUR PROJECT',
      buttonLink:       '#cta',
      image:            '',
      bgColor:          '#0d0d0d',
    },
    {
      badge:            '✏️ Custom Name Pencil Toppers',
      heading:          'Personalized',
      headingHighlight: 'Pencil Toppers',
      subtext:          'Your name in 3D — choose your font, size and colour. Perfect for school, gifting and events.',
      buttonText:       'SHOP NOW',
      buttonLink:       '/shop',
      image:            '',
      bgColor:          '#111111',
    },
  ],

  /* Promo banners */
  promoBanners: [
    {
      badge:       'Best Seller',
      heading:     'Custom Name Toppers',
      subtext:     'Personalized pencil toppers with your name, font and colour of choice.',
      buttonText:  'Order Now',
      buttonLink:  '/shop',
      image:       '/products/pt-3.webp',
      bgColor:     '#1a1a1a',
    },
    {
      badge:       'Bulk Orders',
      heading:     'School & Event Packs',
      subtext:     'Custom name pencil toppers for classrooms, birthday parties and events.',
      buttonText:  'Get a Quote',
      buttonLink:  '/contact',
      image:       '/products/pt-10.webp',
      bgColor:     '#1a1a1a',
    },
  ],

  /* Section headings */
  featuredTitle:     'FEATURED PRODUCTS',
  featuredSubtext:   'Our most popular custom 3D printed pencil toppers.',
  whyTitle:          'OUR SERVICES',
  whySubtext:        'From custom prints to personalized products — here is what we create at CRAFTONEST3D.',
  categoriesTitle:   'Browse by Category',
  categoriesSubtext: 'Find exactly what you are looking for.',
  newsletterTitle:   'YOUR IDEA. OUR PRINT.',
  newsletterSubtext: 'Have an idea you would like to turn into a real object? Let us bring it to life.',

  /* About page */
  aboutHeading:     'About CRAFTONEST3D',
  aboutSubheading:  'We are a custom 3D printing studio turning your ideas into physical objects.',
  aboutStory:       'CRAFTONEST3D is a custom 3D printing studio specializing in personalized name products, pencil toppers, keychains, miniatures, toys, figurines, decorative models and functional parts. We use high-quality PLA and resin materials to create durable, detailed and beautiful prints. Every order is crafted with care and attention to detail.',
  aboutMission:     'To turn your ideas into physical objects through high-quality 3D printing — making custom, personalized and creative products accessible to everyone.',
  aboutVision:      'To become a trusted 3D printing studio known for quality, creativity and a customer-first approach — where every idea can take shape.',
  aboutImage:       '/products/pt-7.webp',

  /* Contact page */
  contactHeading:    'Get in Touch',
  contactSubheading: 'Have a custom 3D print idea? Share your concept and we will bring it to life.',
};

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const snap = await getDoc(DOC_REF());
    if (snap.exists()) {
      const merged = { ...DEFAULT_SETTINGS, ...(snap.data() as Partial<SiteSettings>) };
      // Guard: never allow an empty WhatsApp number (breaks wa.me links)
      if (!merged.whatsappNumber || merged.whatsappNumber.trim() === '') {
        merged.whatsappNumber = DEFAULT_SETTINGS.whatsappNumber;
      }
      // Clean the number — keep digits only (wa.me needs digits, no +, spaces, dashes)
      merged.whatsappNumber = merged.whatsappNumber.replace(/[^0-9]/g, '');
      return merged;
    }
  } catch {
    // Firestore unreachable — return defaults
  }
  return { ...DEFAULT_SETTINGS };
}

export async function saveSiteSettings(settings: SiteSettings): Promise<void> {
  await setDoc(DOC_REF(), { ...settings }, { merge: true });
}
