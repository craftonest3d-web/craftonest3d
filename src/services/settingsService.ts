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
    { label: 'Black',      hex: '#1C1C1C' },
    { label: 'White',      hex: '#FFFFFF' },
    { label: 'Grey',       hex: '#9E9E9E' },
    { label: 'Silver',     hex: '#C0C0C0' },
    { label: 'Red',        hex: '#E74C3C' },
    { label: 'Dark Red',   hex: '#B71C1C' },
    { label: 'Orange',     hex: '#E67E22' },
    { label: 'Yellow',     hex: '#F1C40F' },
    { label: 'Gold',       hex: '#D4AF37' },
    { label: 'Lime',       hex: '#CDDC39' },
    { label: 'Green',      hex: '#2ECC71' },
    { label: 'Dark Green', hex: '#1B5E20' },
    { label: 'Teal',       hex: '#009688' },
    { label: 'Cyan',       hex: '#00BCD4' },
    { label: 'Sky Blue',   hex: '#87CEEB' },
    { label: 'Blue',       hex: '#2196F3' },
    { label: 'Navy',       hex: '#1A237E' },
    { label: 'Purple',     hex: '#9C27B0' },
    { label: 'Violet',     hex: '#7E57C2' },
    { label: 'Lavender',   hex: '#C39BD3' },
    { label: 'Pink',       hex: '#FF6B9D' },
    { label: 'Magenta',    hex: '#E91E63' },
    { label: 'Brown',      hex: '#795548' },
    { label: 'Beige',      hex: '#D7CCC8' },
    { label: 'Rose Gold',  hex: '#B76E79' },
    { label: 'Copper',     hex: '#B87333' },
    { label: 'Glow Green', hex: '#B2FF59' },
    { label: 'Transparent',hex: '#E8EAF6' },
  ],
  paymentReplyMessage:
    'Thank you for confirming your order! 🙏\n\n' +
    'Please pay the advance to one of the below:\n' +
    '• GPay / PhonePe: 918072851386\n' +
    '• UPI ID: (add your UPI id)\n\n' +
    'After payment, kindly share the screenshot here. We will start printing once the advance is received. 🖨️',

  siteLogo:     '',
  showLogoText: true,
  emptyCategoryText: '✨ New designs are on the way! We are busy crafting fresh items for this category. Check back soon or message us on WhatsApp for custom requests.',
  reviewsEnabled: false,
  reviews: [
    { name: 'Priya S.', text: 'Loved the custom name pencil toppers! My daughter was so happy. 😍', rating: 5 },
    { name: 'Arun K.', text: 'Great quality keychains and fast delivery. Highly recommend!', rating: 5 },
    { name: 'Meena R.', text: 'Ordered bulk for a school event — perfect finish and best price.', rating: 5 },
  ],

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
