import { cors } from '../_lib/db.js'
import { getStore } from '../_lib/store.js'
import { requireAdmin } from '../_lib/auth.js'
import { toCsv } from '../_lib/csv.js'

export const onRequestOptions = () => cors()

const HEADERS = [
  'id',
  'sku',
  'name_ar',
  'name_en',
  'category',
  'brand',
  'price',
  'oldPrice',
  'stock',
  'minOrder',
  'rating',
  'reviews',
  'unit_ar',
  'unit_en',
  'badges',
  'keywords',
  'isActive',
  'sortOrder',
]

export const onRequestGet = async ({ request, env }) => {
  const denied = await requireAdmin(request, env)
  if (denied) return denied

  try {
    const store = await getStore(env)
    const products = await store.listProducts({ includeInactive: true })
    const rows = products.map((p) => ({
      id: p.id,
      sku: p.sku ?? '',
      name_ar: p.name?.ar ?? '',
      name_en: p.name?.en ?? '',
      category: p.category ?? '',
      brand: p.brand ?? '',
      price: p.price ?? 0,
      oldPrice: p.oldPrice ?? '',
      stock: p.stock ?? 0,
      minOrder: p.minOrder ?? 1,
      rating: p.rating ?? 0,
      reviews: p.reviews ?? 0,
      unit_ar: p.unit?.ar ?? '',
      unit_en: p.unit?.en ?? '',
      badges: (p.badges ?? []).join('|'),
      keywords: (p.keywords ?? []).join('|'),
      isActive: p.isActive ? 'true' : 'false',
      sortOrder: p.sortOrder ?? 0,
    }))
    return new Response(`\uFEFF${toCsv(HEADERS, rows)}`, {
      headers: {
        'content-type': 'text/csv; charset=utf-8',
        'content-disposition': 'attachment; filename="products.csv"',
        'access-control-allow-origin': '*',
      },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'DB_ERROR', detail: String(err) }), {
      status: 500,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    })
  }
}
