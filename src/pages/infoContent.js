/**
 * Long-form page content for the storefront's info pages (about, contact,
 * shipping, returns, payment, faq, privacy, terms).
 *
 * Kept in its own module so src/pages/InfoPages.jsx only exports components
 * (react-refresh requires that for hot reload to work).
 *
 * NOTE FOR THE OWNER: shipping windows, return windows and warranty terms below
 * are the standard ones for the store — edit them here so they match what the
 * business actually offers.
 */

import {
  BadgeCheck,
  CircleHelp,
  CreditCard,
  FileText,
  MapPin,
  RotateCcw,
  Truck,
} from 'lucide-react'

export const INFO_PAGES = {
  about: {
    icon: BadgeCheck,
    title: { ar: 'من نحن', en: 'About us' },
    lead: {
      ar: 'الفتح للتجارة الطبية — شريك موثوق للعيادات والمختبرات والجامعات الطبية منذ ١٩٩٨.',
      en: 'Al Fath Medical Supplies — a trusted partner for clinics, laboratories and medical faculties since 1998.',
    },
    sections: [
      {
        h: { ar: 'قصتنا', en: 'Our story' },
        p: [
          {
            ar: 'بدأنا من متجر صغير في أسوان، واليوم نتورّد الأجهزة الطبية والمستلزمات المعقّمة لعيادات ومختبرات وجامعات في كل محافظات مصر. نفس المبدأ منذ اليوم الأول: منتج أصلي بسعر عادل، وموافقة من وزارة الصحة، ودعم فني بعد البيع.',
            en: 'We started as a small shop in Aswan; today we supply medical devices and sterile consumables to clinics, labs and universities across every governorate in Egypt. The same principle since day one: genuine products at a fair price, Ministry of Health approved, with after-sales technical support.',
          },
        ],
      },
      {
        h: { ar: 'لماذا يثق بنا عملاؤنا', en: 'Why customers trust us' },
        list: [
          {
            ar: 'وكلاء معتمدون للماركات العالمية — لا استيراد غير رسمي.',
            en: 'Authorised distributors for global brands — no grey imports.',
          },
          {
            ar: 'فاتورة ضريبية وسجل تجاري لكل عملية بيع.',
            en: 'Tax invoice and commercial registration for every sale.',
          },
          {
            ar: 'ضمان يصل إلى سنتين على الأجهزة مع صيانة في الموقع.',
            en: 'Up to two years of warranty on devices, with on-site servicing.',
          },
          {
            ar: 'أسعار جملة للجامعات والمختبرات وطلبات الكميات الكبيرة.',
            en: 'Wholesale pricing for universities, labs and bulk orders.',
          },
          {
            ar: 'فريق مبيعات متخصص يتحدث لغة الطبيب والفني.',
            en: 'A specialist sales team that speaks the clinician’s language.',
          },
        ],
      },
      {
        h: { ar: 'أرقام', en: 'In numbers' },
        p: [
          {
            ar: 'أكثر من ٢٦ سنة في السوق المصري، وآلاف الطلبات المُنفّذة سنويًا لعيادات ومختبرات ومحلات صيدلية.',
            en: 'More than 26 years in the Egyptian market, with thousands of orders fulfilled every year for clinics, labs and pharmacies.',
          },
        ],
      },
    ],
  },

  contact: {
    icon: MapPin,
    title: { ar: 'تواصل معنا', en: 'Contact us' },
    lead: {
      ar: 'فريق المبيعات والدعم متاح من السبت إلى الخميس، ويرد على واتساب خلال دقائق.',
      en: 'Our sales and support team is available Saturday to Thursday and replies on WhatsApp within minutes.',
    },
    sections: [
      {
        h: { ar: 'أرقام التواصل', en: 'Reach us' },
        list: [
          { ar: 'الهاتف والمبيعات: ‎+20 11 57447575', en: 'Phone & sales: +20 11 57447575' },
          { ar: 'واتساب: ‎+20 11 57447575', en: 'WhatsApp: +20 11 57447575' },
          { ar: 'المقر: أسوان، مصر', en: 'Location: Aswan, Egypt' },
          {
            ar: 'مواعيد العمل: السبت – الخميس، ٩ صباحاً – ٩ مساءً',
            en: 'Working hours: Saturday – Thursday, 9:00 AM – 9:00 PM',
          },
        ],
      },
      {
        h: { ar: 'طلبات الجملة والمنشآت', en: 'Wholesale & institutions' },
        p: [
          {
            ar: 'للمستشفيات والمعاهد والجامعات: اطلب عرض سعر مخصص من صفحة المنتج أو عبر واتساب، ويصلك عرض خلال ٢٤ ساعة يشمل سعر الكميات ومواعيد التوريد.',
            en: 'For hospitals, institutes and universities: request a custom quotation from any product page or via WhatsApp, and you will receive a quote within 24 hours covering bulk pricing and delivery schedules.',
          },
        ],
      },
    ],
  },

  shipping: {
    icon: Truck,
    title: { ar: 'الشحن والتوصيل', en: 'Shipping & delivery' },
    lead: {
      ar: 'توصيل سريع داخل مصر، وشحن مجاني للطلبات فوق ٥٠٠ ج.م.',
      en: 'Fast delivery across Egypt, with free shipping on orders over EGP 500.',
    },
    sections: [
      {
        h: { ar: 'المصاريف والمجانية', en: 'Fees & free shipping' },
        list: [
          {
            ar: 'رسوم الشحن ٣٥ ج.م داخل مصر، وتُلغى تلقائياً لو قيمت السلة ٥٠٠ ج.م أو أكثر.',
            en: 'Shipping is EGP 35 across Egypt and is removed automatically once the cart reaches EGP 500.',
          },
          {
            ar: 'تُحسب المصاريف قبل الضريبة في ملخص الطلب قبل التأكيد.',
            en: 'Fees are shown in the order summary before you confirm.',
          },
        ],
      },
      {
        h: { ar: 'مواعيد التوصيل', en: 'Delivery times' },
        list: [
          { ar: 'القاهرة والجيزة والإسكندرية: ١ – ٢ يوم عمل.', en: 'Cairo, Giza & Alexandria: 1–2 working days.' },
          {
            ar: 'باقي المحافظات: ٢ – ٤ أيام عمل.',
            en: 'Other governorates: 2–4 working days.',
          },
          {
            ar: 'طلبات الأجهزة الكبيرة أو المعدات الطبية: ننسق معاك موعد التسليم على الهاتف.',
            en: 'Large devices and equipment: we coordinate the delivery slot with you by phone.',
          },
        ],
      },
      {
        h: { ar: 'الدفع عند الاستلام', en: 'Cash on delivery' },
        p: [
          {
            ar: 'متاح في كل المحافظات. جهّز قيمة الطلب نقداً لمندوب التوصيل، واحصل على فاتورة مطبوعة مع الطرد.',
            en: 'Available in every governorate. Have the order amount ready in cash for the courier, and you will receive a printed invoice with the parcel.',
          },
        ],
      },
    ],
  },

  returns: {
    icon: RotateCcw,
    title: { ar: 'الاسترجاع والاستبدال', en: 'Returns & exchange' },
    lead: {
      ar: 'حقك في الاسترجاع خلال ١٤ يوم من الاستلام، بشرط أن يكون المنتج بحالته الأصلية.',
      en: 'You may return within 14 days of delivery, provided the product is in its original condition.',
    },
    sections: [
      {
        h: { ar: 'المنتجات القابلة للإرجاع', en: 'Returnable products' },
        list: [
          {
            ar: 'غير مستخدم، بالكرتون والملصقات الأصلية، وداخل ١٤ يوم من تاريخ الاستلام.',
            en: 'Unused, in its original box and seals, within 14 days of delivery.',
          },
          {
            ar: 'يُرفق الفاتورة أو رقم الطلب عند التسليم للمندوب.',
            en: 'The invoice or order number must be shown when handing the item back.',
          },
          {
            ar: 'يُرد المبلغ خلال ٧ أيام عمل بنفس وسيلة الدفع أو تحويلاً بنكياً.',
            en: 'The amount is refunded within 7 working days to the same payment method or by bank transfer.',
          },
        ],
      },
      {
        h: { ar: 'المنتجات غير القابلة للإرجاع', en: 'Non-returnable products' },
        list: [
          {
            ar: 'الأدوية والأغذية والمكملات الغذائية بعد فتح العبوة.',
            en: 'Medicines, food and supplements once opened.',
          },
          {
            ar: 'المنتجات المعقّمة ذات العبوة المغلقة لو فُتحت (قفازات، كمامات، سراويل).',
            en: 'Sterile items whose seal has been opened (gloves, masks, scrubs).',
          },
          {
            ar: 'المنتجات المصنّعة حسب الطلب أو المُعدّة لجهاز بعينه.',
            en: 'Made-to-order items or products configured for a specific device.',
          },
          {
            ar: 'بطاقات الائتمان والاشتراكات الرقمية.',
            en: 'Credit and digital subscription products.',
          },
        ],
      },
      {
        h: { ar: 'العيب في الصنعة', en: 'Faulty items' },
        p: [
          {
            ar: 'لو وصلك منتج معيب أو مختلف عن الطلب، بلّغنا خلال ٤٨ ساعة على ‎+20 11 57447575 ونتكفّل بالاستبدال أو الاسترجاع على حسابنا بالكامل.',
            en: 'If an item arrives faulty or different from what you ordered, call us within 48 hours on +20 11 57447575 and we will replace or collect it entirely at our cost.',
          },
        ],
      },
    ],
  },

  payment: {
    icon: CreditCard,
    title: { ar: 'الدفع والسداد', en: 'Secure payment' },
    lead: {
      ar: 'الدفع عند الاستلام متاح الآن، وسداد بالبطاقة قيد الإضافة قريبًا.',
      en: 'Cash on delivery is available now; card payment is coming soon.',
    },
    sections: [
      {
        h: { ar: 'طرق الدفع المتاحة', en: 'Available methods' },
        list: [
          {
            ar: 'الدفع عند الاستلام (COD) — تدفع نقداً لمندوب التوصيل عند وصول الطلب.',
            en: 'Cash on delivery — you pay the courier in cash when the order arrives.',
          },
          {
            ar: 'تحويل بنكي أو فودافون كاش للطلبات بالجملة والعقود السنوية.',
            en: 'Bank transfer or Vodafone Cash for wholesale and annual contracts.',
          },
        ],
      },
      {
        h: { ar: 'قريباً', en: 'Coming soon' },
        p: [
          {
            ar: 'سداد بالبطاقات الائتمانية (فيزا وماستركارد) عبر بوابة دفع معتمدة. لمّا تتفعّل هتظهر في خيارات الدفع وقت إتمام الطلب.',
            en: 'Credit card payment (Visa and Mastercard) through a certified payment gateway. It will appear as a checkout option once enabled.',
          },
        ],
      },
      {
        h: { ar: 'بياناتك محفوظة', en: 'Your data is protected' },
        p: [
          {
            ar: 'بنحفظ أي بيانات بطاقات على سيرفراتنا خالص — الطلب بيتسجّل بالاسم والعنوان والتليفون بس.',
            en: 'We never store card details on our servers — an order only records your name, address and phone.',
          },
        ],
      },
    ],
  },

  faq: {
    icon: CircleHelp,
    title: { ar: 'الأسئلة الشائعة', en: 'FAQ' },
    lead: {
      ar: 'أكتر الأسئلة تكراراً من عملائنا.',
      en: 'The questions we get asked most often.',
    },
    sections: [
      {
        h: { ar: 'الطلبات والدفع', en: 'Orders & payment' },
        list: [
          {
            ar: 'إزاي أطلب؟ — ضيف المنتجات للسلة واضغط "إتمام الشراء"، أو اطلب عرض سعر للجملة ونتواصل معاك.',
            en: 'How do I order? Add products to the cart and press “Proceed to checkout”, or request a wholesale quote and we will call you.',
          },
          {
            ar: 'محتاج حساب عشان أطلب؟ — لأ، التوصيل شغال من غير تسجيل دخول.',
            en: 'Do I need an account? No — you can order as a guest.',
          },
          {
            ar: 'الأسعار شاملة الضريبة؟ — أه، كل الأسعار المعروضة شاملة ضريبة القيمة المضافة.',
            en: 'Are prices VAT-inclusive? Yes, every displayed price includes VAT.',
          },
          {
            ar: 'فيه حد أدنى للطلب؟ — بعض منتجات الجملة ليها حد أدنى مكتوب تحت اسم المنتج.',
            en: 'Is there a minimum order? Some wholesale products show a minimum under the product name.',
          },
        ],
      },
      {
        h: { ar: 'الشحن والاسترجاع', en: 'Shipping & returns' },
        list: [
          {
            ar: 'التوصيل بياخد قد إيه؟ — يوم أو يومين للمدن الكبيرة، و٢ – ٤ أيام لباقي المحافظات.',
            en: 'How long does delivery take? 1–2 days for major cities, 2–4 days elsewhere.',
          },
          {
            ar: 'أقدر أرجّع المنتج؟ — خلال ١٤ يوم ما دام غير مستخدم وبحالته الأصلية. التفاصيل في صفحة الاسترجاع.',
            en: 'Can I return a product? Within 14 days if unused and in its original condition. See the returns page.',
          },
          {
            ar: 'الضمان بيمشي إزاي؟ — بلّغنا بالعطل ونتعامل مع الوكيل، والصيانة بتيجي للموقع في أغلب الحالات.',
            en: 'How does the warranty work? Report the fault and we deal with the agent; in most cases we service on site.',
          },
        ],
      },
      {
        h: { ar: 'الطلبات بالجملة', en: 'Wholesale orders' },
        list: [
          {
            ar: 'بتتعاملوا مع الجامعات والمختبرات؟ — أه، عندنا أسعار خاصة وعقود توريد سنوية.',
            en: 'Do you work with universities and labs? Yes, we have special pricing and annual supply contracts.',
          },
          {
            ar: 'أقدر أشوف فاتورة ضريبية؟ — كل البيعات بفاتورة رسمية بالسجل التجاري ورقم الضريبة.',
            en: 'Can I get a tax invoice? Every sale comes with an official invoice carrying the commercial and tax registration numbers.',
          },
        ],
      },
    ],
  },

  privacy: {
    icon: FileText,
    title: { ar: 'سياسة الخصوصية', en: 'Privacy policy' },
    lead: {
      ar: 'بنستخدم بياناتك عشان ننفذ طلبك بس — وبنبيعها لأي حد.',
      en: 'We use your data only to fulfil your order — and we never sell it.',
    },
    sections: [
      {
        h: { ar: 'البيانات اللي بناخدها', en: 'What we collect' },
        list: [
          {
            ar: 'بيانات الطلب: الاسم، رقم التليفون، العنوان، المدينة، والملاحظات.',
            en: 'Order details: name, phone, address, city and any notes.',
          },
          {
            ar: 'لو عملت حساب: البريد الإلكتروني وكلمة السر (مخزّنة مشفّرة بـ PBKDF2).',
            en: 'If you create an account: email and password (stored hashed with PBKDF2).',
          },
          {
            ar: 'بيانات تقنية بسيطة عشان الموقع يفضل شغال (سلة المشتريات واللغة).',
            en: 'Basic technical data that keeps the site working (cart contents, language).',
          },
        ],
      },
      {
        h: { ar: 'إزاي بنستخدمها', en: 'How we use it' },
        list: [
          { ar: 'تنفيذ الطلب وتجهيز الشحن والاستفسار قبل التسليم.', en: 'Processing the order, arranging delivery and confirming it by phone.' },
          { ar: 'الرد على أسئلتك وطلبات عروض السعر.', en: 'Answering your questions and quotation requests.' },
          { ar: 'الالتزام بالفواتير الضريبية والسجلات النظامية.', en: 'Meeting tax invoicing and statutory record-keeping obligations.' },
        ],
      },
      {
        h: { ar: 'مع مين بتتقاسم', en: 'Who we share it with' },
        p: [
          {
            ar: 'شركة الشحن بس (الاسم والعنوان والتليفون) عشان يوصّل الطلب. مابنشاركش البيانات مع مسوّقين أو أطراف تالتة، ومابنخزّنش بيانات بطاقات أبداً.',
            en: 'Only the courier company (name, address and phone) to deliver your order. We do not share data with marketers or third parties, and we never store card details.',
          },
        ],
      },
      {
        h: { ar: 'حقوقك', en: 'Your rights' },
        p: [
          {
            ar: 'تقدر تطلب حذف حسابك وبياناتك في أي وقت عن طريق الرقم ‎+20 11 57447575 أو واتساب، وهنحذفها إلا اللي مطلوب نظامًا نحتفظ بيه للفواتير.',
            en: 'You can request deletion of your account and data at any time on +20 11 57447575 or WhatsApp; we keep only what tax rules require for invoices.',
          },
        ],
      },
    ],
  },

  terms: {
    icon: FileText,
    title: { ar: 'الشروط والأحكام', en: 'Terms & conditions' },
    lead: {
      ar: 'شروط استخدام الموقع وإتمام الطلبات من الفتح للتجارة الطبية.',
      en: 'Terms of using this site and placing orders with Al Fath Medical Supplies.',
    },
    sections: [
      {
        h: { ar: 'الطلبات', en: 'Orders' },
        list: [
          {
            ar: 'طلبك بيتأكّد بعد مكالمة تليفونية للتحقق من العنوان والكميات.',
            en: 'Your order is confirmed after a phone call to verify the address and quantities.',
          },
          {
            ar: 'بنحقّق الأسعار من قاعدة البيانات وقت الطلب؛ لو حصل خطأ في سعر منتج، بنبلغك قبل الشحن.',
            en: 'Prices are validated server-side at checkout; if a product is mispriced we contact you before shipping.',
          },
          {
            ar: 'الأرقام المرجعية للطلبات المتاحة من فريق المبيعات.',
            en: 'Order references are available from the sales team.',
          },
        ],
      },
      {
        h: { ar: 'الأسعار والتوفر', en: 'Pricing & availability' },
        list: [
          {
            ar: 'كل الأسعار بالجنيه المصري وشاملة ضريبة القيمة المضافة.',
            en: 'All prices are in Egyptian pounds and include VAT.',
          },
          {
            ar: 'لو المنتج نفد بعد ما طلبته، بنبلغك فوراً وبيتحدّث الاختيار أو يترد المبلغ.',
            en: 'If an item goes out of stock after you order, we notify you immediately and you choose a replacement or a refund.',
          },
        ],
      },
      {
        h: { ar: 'الملكية والمسؤولية', en: 'Ownership & liability' },
        p: [
          {
            ar: 'محتوى الموقع والصور والعلامات ملك للفتح للتجارة الطبية أو مرخّصة لها، ولا يُسمح بإعادة النشر بدون إذن. مسؤوليتنا محدودة بقيمة المنتج المُباع، ومش بنتحمّل مسؤولية استخدام غير لغرضه الطبي المعتمد.',
            en: 'The site content, images and marks belong to or are licensed to Al Fath Medical Supplies and may not be republished without permission. Our liability is limited to the value of the product sold, and we are not responsible for use outside its approved medical purpose.',
          },
        ],
      },
      {
        h: { ar: 'القانون الحاكم', en: 'Governing law' },
        p: [
          {
            ar: 'تنعقد هذه الشروط وفق قوانين جمهورية مصر العربية، وللأسوان اختصاص قضائي بها.',
            en: 'These terms are governed by the laws of the Arab Republic of Egypt, with Aswan courts having jurisdiction.',
          },
        ],
      },
    ],
  },
}

