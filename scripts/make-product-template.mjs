// Writes a formatted Excel template for entering products:
//   data-templates/products-template.xlsx
// Column headers match the admin import endpoint exactly. Category / isActive
// columns get dropdowns; every header has an Arabic note explaining it.
//   node scripts/make-product-template.mjs
import { mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import ExcelJS from 'exceljs'
import { SEED } from '../functions/api/_data/seed.js'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = resolve(root, 'data-templates')
mkdirSync(outDir, { recursive: true })

const slugs = (SEED.categories || []).map((c) => c.slug)
const c0 = slugs[0] || 'clinical'
const disp = slugs.includes('disposable') ? 'disposable' : c0
const LAST_ROW = 500

const COLUMNS = [
  { key: 'id', width: 12, note: 'كود داخلي. سيبه فاضي وأول استيراد، النظام يديه كود تلقائي. لو عايز تحدّث منتج موجود اكتب نفس الكود.' },
  { key: 'sku', width: 14, note: 'كود المنتج عندك (اختياري) — مثال: ALF-1001' },
  { key: 'name_ar', width: 34, note: 'اسم المنتج بالعربي (مطلوب)' },
  { key: 'name_en', width: 30, note: 'اسم المنتج بالإنجليزي (اختياري)' },
  { key: 'category', width: 16, note: 'كود التصنيف. اختر من القائمة المنسدلة. التصنيفات المتاحة: ' + slugs.join(', ') },
  { key: 'brand', width: 16, note: 'الماركة / الشركة المصنّعة (اختياري)' },
  { key: 'price', width: 12, note: 'السعر بالجنيه (مطلوب، رقم فقط)' },
  { key: 'oldPrice', width: 12, note: 'السعر قبل الخصم (اختياري) — لو موجود يظهر مشطوب' },
  { key: 'stock', width: 10, note: 'الكمية المتاحة في المخزون (رقم)' },
  { key: 'minOrder', width: 11, note: 'أقل كمية للطلب الواحد (رقم، الافتراضي 1)' },
  { key: 'rating', width: 10, note: 'التقييم من 0 لـ 5 (اختياري)' },
  { key: 'reviews', width: 10, note: 'عدد التقييمات (اختياري)' },
  { key: 'unit_ar', width: 12, note: 'وحدة البيع بالعربي — مثال: قطعة، علبة، كرتونة' },
  { key: 'unit_en', width: 12, note: 'وحدة البيع بالإنجليزي — مثال: unit, box' },
  { key: 'badges', width: 20, note: 'شارات تظهر على المنتج، افصل بينها بعلامة | — مثال: bestSeller|offer|new' },
  { key: 'keywords', width: 22, note: 'كلمات بحث، افصل بينها بعلامة | — مثال: ضغط|قياس' },
  { key: 'isActive', width: 10, note: 'هل المنتج ظاهر في المتجر؟ true أو false' },
  { key: 'sortOrder', width: 10, note: 'ترتيب الظهور (الأصغر أولاً)' },
]

const EXAMPLES = [
  { sku: 'ALF-1001', name_ar: 'جهاز قياس ضغط الدم الرقمي', name_en: 'Digital Blood Pressure Monitor', category: c0, brand: 'Omron', price: 1850, oldPrice: 2100, stock: 25, minOrder: 1, rating: 4.7, reviews: 12, unit_ar: 'قطعة', unit_en: 'unit', badges: 'bestSeller|offer', keywords: 'ضغط|قياس ضغط', isActive: 'true', sortOrder: 1 },
  { sku: 'ALF-1002', name_ar: 'مقياس حرارة رقمي', name_en: 'Digital Thermometer', category: c0, brand: 'Braun', price: 320, oldPrice: '', stock: 60, minOrder: 1, rating: 4.5, reviews: 8, unit_ar: 'قطعة', unit_en: 'unit', badges: '', keywords: 'حرارة', isActive: 'true', sortOrder: 2 },
  { sku: 'ALF-1003', name_ar: 'كمامات طبية 3 طبقات (علبة 50)', name_en: '3-Ply Medical Masks (Box of 50)', category: disp, brand: 'Al Fath', price: 150, oldPrice: 180, stock: 200, minOrder: 5, rating: 4.8, reviews: 34, unit_ar: 'علبة', unit_en: 'box', badges: 'offer', keywords: 'كمامات|وقاية', isActive: 'true', sortOrder: 3 },
]

const wb = new ExcelJS.Workbook()
wb.creator = 'Al Fath'
wb.created = new Date()

/* ------------------------------ products ------------------------------ */
const ws = wb.addWorksheet('المنتجات', { views: [{ state: 'frozen', ySplit: 1 }] })
ws.columns = COLUMNS.map((c) => ({ header: c.key, key: c.key, width: c.width }))

const header = ws.getRow(1)
header.height = 26
header.eachCell((cell, col) => {
  const col0 = COLUMNS[col - 1]
  cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 }
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: col0.key === 'id' ? 'FF16A34A' : 'FF12536B' } }
  cell.alignment = { vertical: 'middle', horizontal: 'center' }
  cell.border = { bottom: { style: 'thin', color: { argb: 'FF0B3A4A' } } }
  if (col0.note) cell.note = col0.note
})

EXAMPLES.forEach((row, i) => {
  const r = ws.addRow(row)
  r.font = { color: { argb: 'FF6B7280' }, italic: true }
  ws.getCell(`C${i + 2}`).font = { color: { argb: 'FF6B7280' }, italic: true }
})

for (let row = 2; row <= LAST_ROW; row += 1) {
  ws.getCell(`E${row}`).dataValidation = {
    type: 'list',
    allowBlank: true,
    formulae: ['"' + slugs.join(',') + '"'],
    showErrorMessage: true,
    errorTitle: 'تصنيف غير صحيح',
    error: 'اختر تصنيفاً من القائمة',
  }
  ws.getCell(`Q${row}`).dataValidation = {
    type: 'list',
    allowBlank: true,
    formulae: ['"true,false"'],
  }
  for (const col of ['G', 'H', 'I', 'J', 'K', 'L', 'R']) {
    ws.getCell(`${col}${row}`).dataValidation = {
      type: 'decimal',
      operator: 'greaterThanOrEqual',
      formulae: [0],
      allowBlank: true,
      showErrorMessage: true,
      errorTitle: 'رقم مطلوب',
      error: 'اكتب رقماً (0 أو أكثر)',
    }
  }
}

/* ----------------------------- instructions --------------------------- */
const info = wb.addWorksheet('التعليمات', { views: [{ rightToLeft: true }] })
info.columns = [{ width: 110 }]
const lines = [
  ['طريقة تعبئة ملف المنتجات — الفتح الطبية'],
  [''],
  ['1) املا الصفوف في ورقة «المنتجات». سيب 3 صفوف الأمثلة أو امسحهم وابدأ من تحتهم.'],
  ['2) العمود name_ar مطلوب، وكذلك price. باقي الأعمدة اختيارية.'],
  ['3) عمود category اختر منه من القائمة المنسدلة. التصنيفات المتاحة حالياً:'],
  ['     ' + slugs.join('  |  ')],
  ['     (تقدر تضيف تصنيفات جديدة من لوحة التحكم ← التصنيفات، وكرر اسم الكود هنا)'],
  ['4) عمود id سيبه فاضي. النظام يدّي كل منتج كود تلقائي.'],
  ['     مهم: لو استوردت نفس الملف مرتين، هيتكرر المنتج. عشان تعدّل منتج موجود، صدّر الملف أولاً من لوحة التحكم (فيه الأكواد) وعدّل عليه.'],
  ['5) أعمدة badges و keywords: افصل بين القيم بعلامة |  مثال: bestSeller|offer'],
  ['     الشارات المتاحة: bestSeller (الأكثر مبيعاً)  |  offer (عرض)  |  new (جديد)'],
  ['6) الوحدات unit_ar / unit_en: مثال قطعة / unit، علبة / box، كرتونة / carton.'],
  [''],
  ['بعد ما تخلّص: احفظ الملف وابعتهولي، وأنا أحوّله وأستورده في المتجر.'],
]
lines.forEach(([text], i) => {
  const cell = info.getCell(`A${i + 1}`)
  cell.value = text
  if (i === 0) cell.font = { bold: true, size: 15, color: { argb: 'FF12536B' } }
  cell.alignment = { vertical: 'middle', wrapText: true }
})

const out = resolve(outDir, 'products-template.xlsx')
await wb.xlsx.writeFile(out)
console.log('wrote', out)
console.log('available category slugs:', slugs.join(', '))
