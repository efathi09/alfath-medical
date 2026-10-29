// Pushes the generated seed (categories + products) into a Postgres database.
//
//   1. put your connection string in .dev.vars  →  DATABASE_URL="postgresql://..."
//   2. node scripts/seed-neon.mjs            (idempotent: upserts)
//      node scripts/seed-neon.mjs --reset    (truncates products/quotes first)
//
// Safe to re-run. Uses ON CONFLICT so it never duplicates rows.
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SEED } from '../functions/api/_data/seed.js'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function loadDevVars() {
  const file = resolve(root, '.dev.vars')
  if (!existsSync(file)) return
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (!m) continue
    let val = m[2].trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    if (!process.env[m[1]]) process.env[m[1]] = val
  }
}
loadDevVars()

const url = process.env.DATABASE_URL
if (!url) {
  console.error('\n  DATABASE_URL is not set.')
  console.error('  Add it to .dev.vars, then re-run:  node scripts/seed-neon.mjs\n')
  process.exit(1)
}

const reset = process.argv.includes('--reset')

const { neon } = await import('@neondatabase/serverless')
const sql = neon(url)

const J = (v) => JSON.stringify(v ?? [])

try {
  if (reset) {
    console.log('  reset: deleting quotes + products + categories')
    await sql`DELETE FROM quotes`
    await sql`DELETE FROM products`
    await sql`DELETE FROM categories`
  }

  let cats = 0
  for (const c of SEED.categories) {
    await sql`
      INSERT INTO categories
        (id, slug, name_ar, name_en, desc_ar, desc_en, icon, art, tint,
         featured_ar, featured_en, groups, sort_order, is_active)
      VALUES
        (${c.id}, ${c.slug}, ${c.name_ar}, ${c.name_en}, ${c.desc_ar}, ${c.desc_en},
         ${c.icon}, ${c.art}, ${c.tint}, ${c.featured_ar}, ${c.featured_en},
         ${J(c.groups)}::jsonb, ${c.sort_order}, true)
      ON CONFLICT (id) DO UPDATE SET
        slug = EXCLUDED.slug,
        name_ar = EXCLUDED.name_ar,
        name_en = EXCLUDED.name_en,
        desc_ar = EXCLUDED.desc_ar,
        desc_en = EXCLUDED.desc_en,
        icon = EXCLUDED.icon,
        art = EXCLUDED.art,
        tint = EXCLUDED.tint,
        featured_ar = EXCLUDED.featured_ar,
        featured_en = EXCLUDED.featured_en,
        groups = EXCLUDED.groups,
        sort_order = EXCLUDED.sort_order
    `
    cats++
  }

  let prods = 0
  for (const p of SEED.products) {
    await sql`
      INSERT INTO products
        (id, sku, slug, name_ar, name_en, category_slug, brand,
         price_egp, compare_at_price_egp, rating, reviews, art, palette,
         unit_ar, unit_en, min_order, stock, badges, keywords, sort_order, is_active)
      VALUES
        (${p.id}, ${p.sku}, ${p.slug}, ${p.name_ar}, ${p.name_en}, ${p.category_slug}, ${p.brand},
         ${p.price_egp}, ${p.compare_at_price_egp}, ${p.rating}, ${p.reviews}, ${p.art}, ${p.palette},
         ${p.unit_ar}, ${p.unit_en}, ${p.min_order}, ${p.stock},
         ${J(p.badges)}::jsonb, ${J(p.keywords)}::jsonb, ${p.sort_order}, true)
      ON CONFLICT (id) DO UPDATE SET
        sku = EXCLUDED.sku,
        name_ar = EXCLUDED.name_ar,
        name_en = EXCLUDED.name_en,
        category_slug = EXCLUDED.category_slug,
        brand = EXCLUDED.brand,
        price_egp = EXCLUDED.price_egp,
        compare_at_price_egp = EXCLUDED.compare_at_price_egp,
        rating = EXCLUDED.rating,
        reviews = EXCLUDED.reviews,
        art = EXCLUDED.art,
        palette = EXCLUDED.palette,
        unit_ar = EXCLUDED.unit_ar,
        unit_en = EXCLUDED.unit_en,
        min_order = EXCLUDED.min_order,
        stock = EXCLUDED.stock,
        badges = EXCLUDED.badges,
        keywords = EXCLUDED.keywords,
        sort_order = EXCLUDED.sort_order
    `
    prods++
  }

  const [{ count: catCount }] = await sql`SELECT count(*)::int AS count FROM categories`
  const [{ count: prodCount }] = await sql`SELECT count(*)::int AS count FROM products`

  console.log(`\n  seeded categories : ${cats}`)
  console.log(`  seeded products   : ${prods}`)
  console.log(`  now in database   : ${catCount} categories, ${prodCount} products\n`)
} catch (err) {
  console.error('\n  seed failed:', String(err), '\n')
  process.exit(1)
}