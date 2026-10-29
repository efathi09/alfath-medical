import { SEED } from '../_data/seed.js'

export { SEED }

export function hasDb(env) {
  return Boolean(env && env.DATABASE_URL)
}

export async function getSql(env) {
  if (!hasDb(env)) return null
  const { neon } = await import('@neondatabase/serverless')
  return neon(env.DATABASE_URL)
}

export function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
      ...(init.headers || {}),
    },
  })
}

export function cors() {
  return new Response(null, {
    status: 204,
    headers: {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'access-control-allow-headers': 'content-type, authorization',
      'access-control-max-age': '86400',
    },
  })
}

/* --------------------------- row mappers --------------------------- */

export function mapProduct(row) {
  return {
    id: row.id,
    sku: row.sku,
    slug: row.slug ?? row.id,
    category: row.category_slug ?? row.category,
    name: { ar: row.name_ar, en: row.name_en },
    brand: row.brand,
    price: Number(row.price_egp ?? row.price ?? 0),
    oldPrice:
      row.compare_at_price_egp != null
        ? Number(row.compare_at_price_egp)
        : row.oldPrice != null
          ? Number(row.oldPrice)
          : undefined,
    rating: Number(row.rating ?? 0),
    reviews: Number(row.reviews ?? 0),
    art: row.art,
    palette: row.palette,
    unit: { ar: row.unit_ar ?? row.unit?.ar, en: row.unit_en ?? row.unit?.en },
    minOrder: row.min_order ?? row.minOrder ?? 1,
    stock: row.stock ?? 0,
    badges: row.badges ?? [],
    keywords: row.keywords ?? [],
    isActive: row.is_active ?? row.isActive ?? true,
    sortOrder: row.sort_order ?? row.sortOrder ?? 0,
  }
}

export function mapCategory(row) {
  return {
    id: row.id,
    slug: row.slug ?? row.id,
    name: { ar: row.name_ar, en: row.name_en },
    desc: { ar: row.desc_ar, en: row.desc_en },
    icon: row.icon,
    art: row.art,
    tint: row.tint,
    featured: { ar: row.featured_ar, en: row.featured_en },
    groups: row.groups ?? [],
    isActive: row.is_active ?? row.isActive ?? true,
    sortOrder: row.sort_order ?? row.sortOrder ?? 0,
  }
}