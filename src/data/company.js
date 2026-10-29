/* ===========================================================================
   COMPANY PROFILE — هذا هو الملف الوحيد اللي تعدّل فيه بيانات شركتك
   Replace every placeholder value with your real information.
   Everything site-wide (header, footer, drawers, WhatsApp, emails) reads
   from this file, so a change here applies everywhere.
   =========================================================================== */

export const company = {
  /* ---- Brand / الاسم --------------------------------------------------- */
  nameKey: 'brand.name', // key inside src/i18n/translations.js
  taglineKey: 'brand.tagline', // key inside src/i18n/translations.js
  shortName: 'Al Fath',

  /* ---- Logo / اللوجو ----------------------------------------------------
     Files in /public. ShowWordmark=false if your image already has text. */
  logoMark: '/logo-192.png', // square icon shown in the header + footer
  logoLockup: '/logo.png', // full-res logo, for sharing / email / og:image
  favicon: '/logo-192.png',
  showWordmark: false, // logo image already contains the company name
  showTagline: true, // show "للتجارة الطبية" next to the logo

  /* ---- Contact / التواصل ------------------------------------------------ */
  phone: '+20 11 57447575', // display
  phoneHref: '+201157447575', // digits only, used for tel: links
  whatsapp: '201157447575', // digits only, no "+", no spaces
  email: '', // empty until a real domain exists — renderers hide the row entirely
  address: {
    ar: 'أسوان',
    en: 'Aswan',
  },
  workingHours: {
    ar: 'السبت – الخميس: ٩ صباحاً – ٩ مساءً',
    en: 'Saturday – Thursday: 9:00 AM – 9:00 PM',
  },

  /* ---- Legal / السجلات -------------------------------------------------- */
  vat: 'N/A',
  cr: 'N/A',
  termsUrl: '#/terms',
  privacyUrl: '#/privacy',

  /* ---- Social media / وسائل التواصل ------------------------------------
     Allowed: facebook | instagram | x | linkedin | youtube | tiktok
     Paste the real profile URLs below. An entry left EMPTY is not rendered at
     all, so the footer never shows a dead social link. */
  social: ['facebook', 'instagram', 'x', 'linkedin', 'youtube'],
  socialLinks: {
    facebook: '',
    instagram: '',
    x: '',
    linkedin: '',
    youtube: '',
  },

  /* ---- Payments / وسائل الدفع -------------------------------------------
     Allowed: cod | visa | mastercard | applepay | giftcard
     Only methods that actually work may be listed. Card badges stay off until a
     payment gateway is live, so the footer never advertises a method that
     checkout cannot take. */
  payments: [
    { id: 'cod', label: 'الدفع عند الاستلام', labelEn: 'Cash on delivery' },
  ],

  /* ---- Brands shown in the marquee / شريط الماركات ---------------------- */
  brands: [
    'PHILIPS',
    'OMRON',
    'BAXTER',
    '3M',
    'MEDLINE',
    'RESPIRONICS',
    'SCAVN',
    'LEICA',
    'CARDINAL HEALTH',
    'KIMBERLY-CLARK',
  ],

  /* ---- Trust badges / شريط المزايا --------------------------------------
     `key` must exist in translations.js (trust.*), `icon` must exist in
     lucide-react.                                                        */
  trustBadges: [
    { key: 'shipping', icon: 'Truck' },
    { key: 'warranty', icon: 'ShieldCheck' },
    { key: 'support', icon: 'Headset' },
    { key: 'secure', icon: 'LockKeyhole' },
    { key: 'bulk', icon: 'Percent' },
  ],
}