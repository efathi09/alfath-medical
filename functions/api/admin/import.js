import { json, cors } from '../_lib/db.js'
import { getStore } from '../_lib/store.js'
import { requireAdmin } from '../_lib/auth.js'
import { parseCsv } from '../_lib/csv.js'

export const onRequestOptions = () => cors()

function splitList(value) {
  return String(value ?? '')
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean)
}

function boolOf(value, fallback = true) {
  const s = String(value ?? '').trim().toLowerCase()
  if (s === '') return fallback
  return !['false', '0', 'no', 'لا'].includes(s)
}

function num(value, fallback = 0) {
  if (value === '' || value == null) return fallback
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

export const onRequestPost = async ({ request, env }) => {
  const denied = await requireAdmin(request, env)
  if (denied) return denied

  const raw = await request.text()
  let csvText = raw
  let mode = 'upsert'
  const trimmed = raw.trim()
  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed)
      csvText = parsed.csv ?? ''
      mode = parsed.mode ?? 'upsert'
    } catch {
      /* treat as raw csv */
    }
  }
  if (!csvText.trim()) return json({ error: 'EMPTY' }, { status: 400 })

  let rows
  try {
    rows = parseCsv(csvText)
  } catch (err) {
    return json({ error: 'INVALID_CSV', detail: String(err) }, { status: 400 })
  }

  try {
    const store = await getStore(env)
    let created = 0
    let updated = 0
    let skipped = 0

    for (const r of rows) {
      const nameAr = (r.name_ar ?? '').trim()
      const nameEn = (r.name_en ?? '').trim()
      if (!nameAr && !nameEn) {
        skipped += 1
        continue
      }
      const id = (r.id ?? '').trim()
      const payload = {
        sku: (r.sku ?? '').trim() || null,
        name: { ar: nameAr, en: nameEn },
        category: (r.category ?? '').trim() || null,
        brand: (r.brand ?? '').trim() || null,
        price: num(r.price, 0),
        oldPrice: String(r.oldPrice ?? '') === '' ? null : num(r.oldPrice, 0),
        stock: num(r.stock, 0),
        minOrder: num(r.minOrder, 1),
        rating: num(r.rating, 0),
        reviews: num(r.reviews, 0),
        unit: { ar: (r.unit_ar ?? '').trim() || 'قطعة', en: (r.unit_en ?? '').trim() || 'unit' },
        badges: splitList(r.badges),
        keywords: splitList(r.keywords),
        isActive: boolOf(r.isActive, true),
        sortOrder: num(r.sortOrder, 0),
      }
      try {
        const existing = id ? await store.getProduct(id) : null
        if (existing) {
          if (mode === 'insert') {
            skipped += 1
            continue
          }
          await store.updateProduct(id, payload)
          updated += 1
        } else {
          await store.createProduct(id ? { ...payload, id } : payload)
          created += 1
        }
      } catch {
        skipped += 1
      }
    }

    return json({ created, updated, skipped, total: rows.length })
  } catch (err) {
    return json({ error: 'DB_ERROR', detail: String(err) }, { status: 500 })
  }
}
