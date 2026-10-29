// Converts a filled Excel template into the CSV the admin import expects.
//   node scripts/xlsx-to-products-csv.mjs data-templates/products-template.xlsx
//   -> data-templates/products-import.csv
//
// Then check it with:  npm run products:check data-templates/products-import.csv
import { writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import ExcelJS from 'exceljs'
import { toCsv } from '../functions/api/_lib/csv.js'

const HEADERS = [
  'id', 'sku', 'name_ar', 'name_en', 'category', 'brand', 'price', 'oldPrice',
  'stock', 'minOrder', 'rating', 'reviews', 'unit_ar', 'unit_en', 'badges',
  'keywords', 'isActive', 'sortOrder',
]

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const input = process.argv[2] ?? 'data-templates/products-template.xlsx'
const output = process.argv[3] ?? 'data-templates/products-import.csv'

function normalize(v) {
  if (v == null) return ''
  if (v instanceof Date) return v.toISOString().slice(0, 10)
  if (typeof v === 'object') {
    if (Array.isArray(v.richText)) return v.richText.map((t) => t.text).join('')
    if ('text' in v) return String(v.text)
    if ('result' in v) return normalize(v.result)
    return String(v)
  }
  return String(v)
}

const wb = new ExcelJS.Workbook()
await wb.xlsx.readFile(resolve(root, input))
const ws = wb.worksheets[0]

const colByKey = {}
ws.getRow(1).eachCell((cell, col) => {
  const key = String(cell.value ?? '').trim()
  if (key) colByKey[key] = col
})

const missing = HEADERS.filter((h) => !(h in colByKey) && h !== 'id' && h !== 'sku')
if (!HEADERS.includes('name_ar') && !('name_ar' in colByKey)) {
  console.error('\n  the sheet header row is not recognised — expected columns like name_ar, price, category\n')
  process.exit(1)
}

const rows = []
ws.eachRow((row, rowNumber) => {
  if (rowNumber === 1) return
  const obj = {}
  let hasValue = false
  for (const h of HEADERS) {
    const col = colByKey[h]
    const value = col ? normalize(row.getCell(col).value) : ''
    obj[h] = value
    if (String(value).trim() !== '') hasValue = true
  }
  if (hasValue) rows.push(obj)
})

const target = resolve(root, output)
writeFileSync(target, '\uFEFF' + toCsv(HEADERS, rows) + '\r\n', 'utf8')
console.log('wrote', target, `(${rows.length} row(s))`)
if (missing.length) console.log('note: columns not found in the sheet ->', missing.join(', '))
