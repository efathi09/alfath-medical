// Validates a products CSV before importing it through the admin panel.
//   node scripts/validate-products-csv.mjs data-templates/products-template.csv
//
// Checks: missing names, unknown categories, non-numeric price/stock, and
// duplicate id / sku values. Exit code is non-zero when there are blocking
// errors (missing name or bad price).
import { existsSync, readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseCsv } from '../functions/api/_lib/csv.js'
import { SEED } from '../functions/api/_data/seed.js'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const arg = process.argv[2] ?? 'data-templates/products-template.csv'
const file = resolve(root, arg)

if (!existsSync(file)) {
  console.error(`\n  file not found: ${file}\n`)
  process.exit(1)
}

const slugs = new Set((SEED.categories || []).map((c) => c.slug))
const rows = parseCsv(readFileSync(file, 'utf8'))

let errors = 0
let warnings = 0
const seenId = new Map()
const seenSku = new Map()

console.log(`\n  checking ${rows.length} row(s) in ${arg}\n`)

rows.forEach((r, i) => {
  const line = i + 2
  const nameAr = String(r.name_ar ?? '').trim()
  const nameEn = String(r.name_en ?? '').trim()
  const cat = String(r.category ?? '').trim()
  const id = String(r.id ?? '').trim()
  const sku = String(r.sku ?? '').trim()
  const price = r.price === '' || r.price == null ? NaN : Number(r.price)

  if (!nameAr && !nameEn) {
    console.log(`  x line ${line}: needs name_ar or name_en`)
    errors += 1
  }
  if (!Number.isFinite(price) || price < 0) {
    console.log(`  x line ${line}: invalid price "${r.price ?? ''}"`)
    errors += 1
  }
  if (cat && !slugs.has(cat)) {
    console.log(`  ! line ${line}: unknown category "${cat}" (product will show without a category)`)
    warnings += 1
  }
  if (!cat) {
    console.log(`  ! line ${line}: no category`)
    warnings += 1
  }
  if (id) {
    if (seenId.has(id)) {
      console.log(`  x line ${line}: duplicate id "${id}" (also line ${seenId.get(id)})`)
      errors += 1
    } else seenId.set(id, line)
  }
  if (sku) {
    if (seenSku.has(sku)) {
      console.log(`  x line ${line}: duplicate sku "${sku}" (also line ${seenSku.get(sku)})`)
      errors += 1
    } else seenSku.set(sku, line)
  }
})

console.log(`\n  errors: ${errors}   warnings: ${warnings}`)
console.log(`  available categories: ${[...slugs].join(', ')}\n`)
process.exit(errors > 0 ? 1 : 0)
