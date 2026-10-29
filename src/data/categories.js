export const categories = [
  {
    id: 'clinical',
    name: { ar: 'أجهزة سريرية', en: 'Clinical Devices' },
    desc: { ar: 'أجهزة قياس وتشخيص ورعاية', en: 'Monitoring, diagnostic & care' },
    icon: 'Activity',
    art: 'monitor',
    tint: 'from-brand-600 to-brand-900',
    featured: { ar: 'شاشات مراقبة المرضى', en: 'Patient monitors' },
    groups: [
      {
        title: { ar: 'أجهزة المراقبة والتشخيص', en: 'Monitoring & diagnosis' },
        items: [
          { ar: 'أجهزة ضغط الدم', en: 'Blood pressure monitors' },
          { ar: 'أجهزة قياس السكر', en: 'Blood glucose meters' },
          { ar: 'أجهزة قياس الحرارة', en: 'Thermometers' },
          { ar: 'أجهزة تركيز الأكسجين', en: 'Oxygen concentrators' },
          { ar: 'أجهزة رسم القلب', en: 'ECG machines' },
          { ar: 'أجهزة التحاليل المخبرية', en: 'Laboratory analyzers' },
        ],
      },
      {
        title: { ar: 'أجهزة الرعاية والتنفس', en: 'Care & respiratory' },
        items: [
          { ar: 'أجهزة التنفس الصناعي', en: 'CPAP ventilators' },
          { ar: 'أجهزة الشفط الطبي', en: 'Suction units' },
          { ar: 'أجهزة الليزر والفيزياء', en: 'Laser & physiotherapy' },
          { ar: 'أسرة المستشفيات الكهربائية', en: 'Electric hospital beds' },
          { ar: 'كراسي بعجلات', en: 'Wheelchairs' },
          { ar: 'أجهزة التعقيم', en: 'Sterilizers' },
        ],
      },
      {
        title: { ar: 'مستلزمات العيادات', en: 'Clinic essentials' },
        items: [
          { ar: 'أجهزة قياس العلامات الحيوية', en: 'Vital signs monitors' },
          { ar: 'مقاعد الانتظار الطبية', en: 'Waiting room chairs' },
          { ar: 'عربات الأدوات', en: 'Instrument trolleys' },
          { ar: 'أضواء الفحص', en: 'Examination lights' },
          { ar: 'مضخات أكسجين متنقلة', en: 'Portable oxygen pumps' },
          { ar: 'أجهزة الأوتوكلاف', en: 'Autoclaves' },
        ],
      },
    ],
  },
  {
    id: 'student',
    name: { ar: 'مستلزمات طلاب الطب', en: 'Student Supplies' },
    desc: { ar: 'أدوات محاكاة ومعاينات وسكاكين', en: 'Simulation, lab coats & instruments' },
    icon: 'GraduationCap',
    art: 'stethoscope',
    tint: 'from-sky-600 to-sky-900',
    featured: { ar: 'أطقم معاينات طلاب الطب', en: 'Student exam kits' },
    groups: [
      {
        title: { ar: 'أدوات المعاينة', en: 'Examination tools' },
        items: [
          { ar: 'سماعات طبية', en: 'Stethoscopes' },
          { ar: 'أجهزة قياس الضغط', en: 'Sphygmomanometers' },
          { ar: 'مدابيس الأذن', en: 'Otoscopes' },
          { ar: 'أدوات طب الأسنان', en: 'Dental instruments' },
          { ar: 'أشرطة القياس', en: 'Measuring tapes' },
          { ar: 'أدوات الجراحة الأساسية', en: 'Basic surgery tools' },
        ],
      },
      {
        title: { ar: 'المحاكاة والتدريب', en: 'Simulation & training' },
        items: [
          { ar: 'دمى محاكاة الإنسان', en: 'Manikins' },
          { ar: 'أجهزة محاكاة الإنعاش', en: 'CPR simulators' },
          { ar: 'مجسمات تشريح للتدريب', en: 'Anatomy models' },
          { ar: 'أطلس تعليمي', en: 'Anatomy atlases' },
          { ar: 'لوحات قياس النظر', en: 'Vision charts' },
          { ar: 'أجهزة قياس السمع', en: 'Audiometers' },
        ],
      },
      {
        title: { ar: 'الملابس والحماية', en: 'Uniforms & protection' },
        items: [
          { ar: 'سكراب قطن', en: 'Cotton scrubs' },
          { ar: 'معاطف بيضاء', en: 'Lab coats' },
          { ar: 'أحذية طبية', en: 'Clinic shoes' },
          { ar: 'نظارات واقية', en: 'Safety goggles' },
          { ar: 'شنرات السماعات الطبية', en: 'Stethoscope straps' },
          { ar: 'حقائب الأدوات', en: 'Instrument bags' },
        ],
      },
    ],
  },
  {
    id: 'food',
    name: { ar: 'أغذية صحية', en: 'Healthy Food' },
    desc: { ar: 'بروتين وفيتامينات وحميات', en: 'Protein, vitamins & diets' },
    icon: 'Apple',
    art: 'protein',
    tint: 'from-lime-600 to-emerald-800',
    featured: { ar: 'بروتين آيزو معتمد', en: 'ISO certified protein' },
    groups: [
      {
        title: { ar: 'البروتين والمكملات', en: 'Protein & supplements' },
        items: [
          { ar: 'بروتين واي', en: 'Whey protein' },
          { ar: 'كازيين', en: 'Casein' },
          { ar: 'كرياتين', en: 'Creatine' },
          { ar: 'فيتامينات ومعادن', en: 'Vitamins & minerals' },
          { ar: 'أحماض أمينية', en: 'Amino acids' },
          { ar: 'ألياف ومكمل غذائي', en: 'Dietary fibre' },
        ],
      },
      {
        title: { ar: 'حميات خاصة', en: 'Special diets' },
        items: [
          { ar: 'حلوى لمرضى السكر', en: 'Diabetic sweets' },
          { ar: 'منتجات قليلة الصوديوم', en: 'Low sodium' },
          { ar: 'غذاء الأطفال', en: 'Infant formula' },
          { ar: 'غذاء كبار السن', en: 'Senior nutrition' },
          { ar: 'وجبات مرضى جاهزة', en: 'Patient meal packs' },
          { ar: 'مشروبات الطاقة', en: 'Energy drinks' },
        ],
      },
      {
        title: { ar: 'منتجات طبيعية', en: 'Natural & organic' },
        items: [
          { ar: 'عسل طبيعي', en: 'Natural honey' },
          { ar: 'زيوت طبيعية', en: 'Natural oils' },
          { ar: 'تمور وفواكه مجففة', en: 'Dates & dried fruit' },
          { ar: 'أعشاب ومكملات نباتية', en: 'Herbal remedies' },
          { ar: 'شاي أعشاب', en: 'Herbal tea' },
          { ar: 'حبوب كاملة', en: 'Whole grains' },
        ],
      },
    ],
  },
  {
    id: 'disposable',
    name: { ar: 'مستلزمات طبية', en: 'Medical Disposables' },
    desc: { ar: 'مستهلكات يومية معقّمة', en: 'Sterile daily consumables' },
    icon: 'PackageCheck',
    art: 'gloves',
    tint: 'from-violet-600 to-indigo-900',
    featured: { ar: 'قفازات معقمة', en: 'Sterile gloves' },
    groups: [
      {
        title: { ar: 'الحماية الشخصية', en: 'Personal protection' },
        items: [
          { ar: 'قفازات طبية', en: 'Medical gloves' },
          { ar: 'كمامات وأقنعة', en: 'Masks & respirators' },
          { ar: 'أغطية الرأس', en: 'Head caps' },
          { ar: 'نظارات واقية', en: 'Safety goggles' },
          { ar: 'أطقم عزل', en: 'Isolation gowns' },
          { ar: 'أغطية الأحذية', en: 'Shoe covers' },
        ],
      },
      {
        title: { ar: 'المستهلكات السريرية', en: 'Bedside consumables' },
        items: [
          { ar: 'ملابس وأغطية أسرة طبية', en: 'Bed linen & covers' },
          { ar: 'فوط مرضى', en: 'Adult diapers' },
          { ar: 'مناديل مبللة', en: 'Wet wipes' },
          { ar: 'معقمات اليدين', en: 'Hand sanitizers' },
          { ar: 'أكي نفايات طبية', en: 'Medical waste bags' },
          { ar: 'فوط جراحية', en: 'Surgical drapes' },
        ],
      },
      {
        title: { ar: 'أدوات الحقن والوصل', en: 'Injection & access' },
        items: [
          { ar: 'سرنجات ومحاقن', en: 'Syringes & needles' },
          { ar: 'محاليل وريدية', en: 'IV fluids' },
          { ar: 'أنابيب وريدية', en: 'IV cannulas' },
          { ar: 'وصلات وأنابيب', en: 'Connectors & tubing' },
          { ar: 'شفرات جراحية', en: 'Surgical blades' },
          { ar: 'أطقم حقن', en: 'Injection kits' },
        ],
      },
    ],
  },
]

export const quickLinks = [
  { id: 'flash', label: { ar: 'تخفيضات اليوم', en: 'Flash Deals' }, icon: 'Zap', href: '#flash' },
  {
    id: 'student',
    label: { ar: 'خصم طلاب الطب', en: 'Student Discount' },
    icon: 'GraduationCap',
    href: '#students',
  },
  { id: 'bestsellers', label: { ar: 'الأكثر مبيعاً', en: 'Best Sellers' }, icon: 'Flame', href: '#bestsellers' },
  { id: 'new', label: { ar: 'وصل حديثاً', en: 'New Arrivals' }, icon: 'Sparkles', href: '#bestsellers' },
  { id: 'wholesale', label: { ar: 'أسعار الجملة', en: 'Wholesale Prices' }, icon: 'Percent', href: '#wholesale' },
  { id: 'brands', label: { ar: 'الماركات', en: 'Brands' }, icon: 'BadgeCheck', href: '#brands' },
]

export function getCategory(id) {
  return categories.find((category) => category.id === id)
}
