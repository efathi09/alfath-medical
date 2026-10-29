export const heroSlides = [
  {
    id: 'hs-1',
    kicker: { ar: 'عرض الموسم', en: 'Season offer' },
    titleKey: 'hero.slide1Title',
    subKey: 'hero.slide1Sub',
    ctaKey: 'hero.slide1Cta',
    href: '#bestsellers',
    palette: 'teal',
    art: 'monitor',
    stat: { ar: 'ضمان سنتين', en: '2-year warranty' },
  },
  {
    id: 'hs-2',
    kicker: { ar: 'برنامج الطلاب', en: 'Student program' },
    titleKey: 'hero.slide2Title',
    subKey: 'hero.slide2Sub',
    ctaKey: 'hero.slide2Cta',
    href: '#students',
    palette: 'violet',
    art: 'stethoscope',
    stat: { ar: 'كود STUDENT25', en: 'Code STUDENT25' },
  },
  {
    id: 'hs-3',
    kicker: { ar: 'تغذية وصحة', en: 'Nutrition & health' },
    titleKey: 'hero.slide3Title',
    subKey: 'hero.slide3Sub',
    ctaKey: 'hero.slide3Cta',
    href: '#bestsellers',
    palette: 'lime',
    art: 'protein',
    stat: { ar: 'معتمد من وزارة الصحة', en: 'MoH approved' },
  },
  {
    id: 'hs-4',
    kicker: { ar: 'أسعار الجملة', en: 'Wholesale pricing' },
    titleKey: 'hero.slide4Title',
    subKey: 'hero.slide4Sub',
    ctaKey: 'hero.slide4Cta',
    href: '#wholesale',
    palette: 'indigo',
    art: 'gloves',
    stat: { ar: 'خصم حتى ٤٠٪', en: 'Up to 40% off' },
  },
]

function nextMidnightPlus(hours) {
  const now = new Date()
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, hours, 0, 0, 0)
  return end.getTime()
}

export function flashDeadline() {
  return nextMidnightPlus(2)
}

export const flashDeals = [
  { id: 'p-401', sold: 780, stockTotal: 1000, dealPrice: 69 },
  { id: 'p-301', sold: 512, stockTotal: 800, dealPrice: 329 },
  { id: 'p-402', sold: 640, stockTotal: 900, dealPrice: 49 },
  { id: 'p-201', sold: 268, stockTotal: 500, dealPrice: 229 },
  { id: 'p-103', sold: 42, stockTotal: 90, dealPrice: 2199 },
  { id: 'p-404', sold: 905, stockTotal: 1200, dealPrice: 59 },
]

export const testimonials = [
  { nameKey: 'testimonials.item1Name', roleKey: 'testimonials.item1Role', quoteKey: 'testimonials.item1', art: 'microscope', palette: 'teal' },
  { nameKey: 'testimonials.item2Name', roleKey: 'testimonials.item2Role', quoteKey: 'testimonials.item2', art: 'stethoscope', palette: 'sky' },
  { nameKey: 'testimonials.item3Name', roleKey: 'testimonials.item3Role', quoteKey: 'testimonials.item3', art: 'monitor', palette: 'indigo' },
]
