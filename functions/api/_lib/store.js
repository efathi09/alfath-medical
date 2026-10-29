import { getSql, mapProduct, mapCategory, SEED } from './db.js'

/* ------------------------------------------------------------------ *
 * Row converters  (frontend shape  <->  database shape)
 * ------------------------------------------------------------------ */

export function newId(prefix) {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

function slugify(input, fallback) {
  const s = String(input ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
  return s || fallback
}

function numOr(value, fallback) {
  if (value === '' || value == null) return fallback
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

export function productToRow(p) {
  const id = String(p.id ?? newId('p'))
  return {
    id,
    sku: p.sku ? String(p.sku) : null,
    slug: p.slug ? String(p.slug) : slugify(p.name?.en || p.name?.ar, id),
    name_ar: p.name?.ar ?? '',
    name_en: p.name?.en ?? '',
    category_slug: p.category ?? null,
    brand: p.brand ?? null,
    price_egp: numOr(p.price, 0),
    compare_at_price_egp: numOr(p.oldPrice, null),
    rating: numOr(p.rating, 0),
    reviews: numOr(p.reviews, 0),
    art: p.art ?? 'box',
    palette: p.palette ?? 'brand',
    unit_ar: p.unit?.ar ?? 'قطعة',
    unit_en: p.unit?.en ?? 'unit',
    min_order: numOr(p.minOrder, 1),
    stock: numOr(p.stock, 0),
    badges: Array.isArray(p.badges) ? p.badges : [],
    keywords: Array.isArray(p.keywords) ? p.keywords : [],
    is_active: p.isActive ?? true,
    sort_order: numOr(p.sortOrder, 0),
  }
}

export function categoryToRow(c) {
  const id = String(c.id ?? newId('cat'))
  return {
    id,
    slug: c.slug ? String(c.slug) : slugify(c.name?.en || c.name?.ar, id),
    name_ar: c.name?.ar ?? '',
    name_en: c.name?.en ?? '',
    desc_ar: c.desc?.ar ?? '',
    desc_en: c.desc?.en ?? '',
    icon: c.icon ?? 'LayoutGrid',
    art: c.art ?? 'box',
    tint: c.tint ?? 'from-brand-600 to-brand-900',
    featured_ar: c.featured?.ar ?? '',
    featured_en: c.featured?.en ?? '',
    groups: Array.isArray(c.groups) ? c.groups : [],
    is_active: c.isActive ?? true,
    sort_order: numOr(c.sortOrder, 0),
  }
}

export function promoToRow(p) {
  return {
    id: String(p.id ?? newId('pr')),
    deal_price: numOr(p.dealPrice, 0),
    stock_total: numOr(p.stockTotal, 0),
    sold: numOr(p.sold, 0),
    is_active: p.isActive ?? true,
    sort_order: numOr(p.sortOrder, 0),
  }
}

export function mapPromo(row) {
  return {
    id: row.id,
    dealPrice: Number(row.deal_price ?? row.dealPrice ?? 0),
    stockTotal: Number(row.stock_total ?? row.stockTotal ?? 0),
    sold: Number(row.sold ?? 0),
    isActive: row.is_active ?? row.isActive ?? true,
    sortOrder: row.sort_order ?? row.sortOrder ?? 0,
  }
}

export function brandToRow(b) {
  return {
    id: String(b.id ?? newId('b')),
    name: String(b.name ?? '').trim(),
    is_active: b.isActive ?? true,
    sort_order: numOr(b.sortOrder, 0),
  }
}

export function mapBrand(row) {
  return {
    id: row.id,
    name: row.name,
    isActive: row.is_active ?? row.isActive ?? true,
    sortOrder: row.sort_order ?? row.sortOrder ?? 0,
  }
}

export function mapUser(row) {
  return {
    id: row.id,
    username: row.username,
    role: row.role ?? 'admin',
    isActive: row.is_active ?? row.isActive ?? true,
    createdAt: row.created_at ?? row.createdAt ?? null,
  }
}

export function mapCustomer(row) {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email ?? null,
    address: row.address ?? null,
    city: row.city ?? null,
    notes: row.notes ?? null,
    isActive: row.is_active ?? row.isActive ?? true,
    createdAt: row.created_at ?? row.createdAt ?? null,
  }
}

export function mapOrder(row) {
  return {
    id: row.id,
    number: row.number,
    customerId: row.customer_id ?? row.customerId ?? null,
    name: row.name,
    phone: row.phone,
    email: row.email ?? null,
    address: row.address ?? null,
    city: row.city ?? null,
    notes: row.notes ?? null,
    items: Array.isArray(row.items) ? row.items : [],
    subtotal: Number(row.subtotal ?? 0),
    shipping: Number(row.shipping ?? 0),
    discount: Number(row.discount ?? 0),
    total: Number(row.total ?? 0),
    status: row.status ?? 'pending',
    paymentMethod: row.payment_method ?? row.paymentMethod ?? 'cod',
    source: row.source ?? 'app',
    createdAt: row.created_at ?? row.createdAt ?? null,
    updatedAt: row.updated_at ?? row.updatedAt ?? null,
  }
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

const DEFAULT_SETTINGS = () => clone(SEED.settings ?? {})
const DEFAULT_BRANDS = () => clone(SEED.brands ?? [])
const DEFAULT_PROMOS = () => clone(SEED.promos ?? [])

function sortByOrderThenCreated(a, b) {
  const so = (a.sort_order ?? 0) - (b.sort_order ?? 0)
  if (so !== 0) return so
  return 0
}

/* ------------------------------------------------------------------ *
 * In-memory store — used when there is no database.
 * The dev server injects `onPersist` to write a local JSON file.
 * ------------------------------------------------------------------ */

export function createMemoryStore({ initial, onPersist } = {}) {
  let state = initial
  if (!state) {
    state = {
      products: SEED.products.map((row) => ({ ...row })),
      categories: SEED.categories.map((row) => ({ ...row })),
      quotes: [],
      customers: [],
      orders: [],
    }
  }
  // Backfill collections added after the first release (so old .data/db.json
  // files keep working) and never let a missing key crash the store.
  if (!Array.isArray(state.products)) state.products = SEED.products.map((row) => ({ ...row }))
  if (!Array.isArray(state.categories)) state.categories = SEED.categories.map((row) => ({ ...row }))
  if (!Array.isArray(state.quotes)) state.quotes = []
  if (!Array.isArray(state.brands)) state.brands = DEFAULT_BRANDS()
  if (!Array.isArray(state.promos)) state.promos = DEFAULT_PROMOS()
  if (!Array.isArray(state.users)) state.users = []
  if (!state.settings || typeof state.settings !== 'object') state.settings = DEFAULT_SETTINGS()
  if (!state.whatsapp || typeof state.whatsapp !== 'object') state.whatsapp = {}
  if (!Array.isArray(state.messages)) state.messages = []
  if (!Array.isArray(state.customers)) state.customers = []
  if (!Array.isArray(state.orders)) state.orders = []
  if (!Array.isArray(state.subscribers)) state.subscribers = []
  if (!Number.isFinite(state.orderSeq)) state.orderSeq = 10000
  const persist = () => {
    if (typeof onPersist === 'function') onPersist(state)
  }
  const findProduct = (id) => state.products.find((row) => String(row.id) === String(id))
  const findCategory = (id) => state.categories.find((row) => String(row.id) === String(id))

  return {
    source: 'local',
    snapshot: () => state,

    async listProducts({ includeInactive = false } = {}) {
      return state.products
        .filter((row) => includeInactive || row.is_active !== false)
        .sort(sortByOrderThenCreated)
        .map(mapProduct)
    },
    async getProduct(id) {
      const row = findProduct(id)
      return row ? mapProduct(row) : null
    },
    async createProduct(data) {
      const row = productToRow(data)
      if (findProduct(row.id)) throw new Error('PRODUCT_EXISTS')
      state.products.push(row)
      persist()
      return mapProduct(row)
    },
    async updateProduct(id, data) {
      const idx = state.products.findIndex((row) => String(row.id) === String(id))
      if (idx === -1) return null
      const merged = { ...mapProduct(state.products[idx]), ...data, id: state.products[idx].id }
      state.products[idx] = productToRow(merged)
      persist()
      return mapProduct(state.products[idx])
    },
    async deleteProduct(id) {
      const before = state.products.length
      state.products = state.products.filter((row) => String(row.id) !== String(id))
      const removed = state.products.length < before
      if (removed) persist()
      return removed
    },

    async listCategories({ includeInactive = false } = {}) {
      return state.categories
        .filter((row) => includeInactive || row.is_active !== false)
        .sort(sortByOrderThenCreated)
        .map(mapCategory)
    },
    async getCategory(id) {
      const row = findCategory(id)
      return row ? mapCategory(row) : null
    },
    async createCategory(data) {
      const row = categoryToRow(data)
      if (findCategory(row.id)) throw new Error('CATEGORY_EXISTS')
      state.categories.push(row)
      persist()
      return mapCategory(row)
    },
    async updateCategory(id, data) {
      const idx = state.categories.findIndex((row) => String(row.id) === String(id))
      if (idx === -1) return null
      const merged = { ...mapCategory(state.categories[idx]), ...data, id: state.categories[idx].id }
      state.categories[idx] = categoryToRow(merged)
      persist()
      return mapCategory(state.categories[idx])
    },
    async deleteCategory(id) {
      const used = state.products.some((row) => String(row.category_slug) === String(id))
      if (used) throw new Error('CATEGORY_IN_USE')
      const before = state.categories.length
      state.categories = state.categories.filter((row) => String(row.id) !== String(id))
      const removed = state.categories.length < before
      if (removed) persist()
      return removed
    },

    async listQuotes() {
      return [...state.quotes].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    },
    async createQuote(data) {
      const row = {
        id: newId('q'),
        name: data.name,
        phone: data.phone,
        company: data.company ?? null,
        items: Array.isArray(data.items) ? data.items : [],
        notes: data.notes ?? null,
        status: 'pending',
        source: data.source ?? 'website',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      state.quotes.push(row)
      persist()
      return row
    },
    async updateQuoteStatus(id, status) {
      const row = state.quotes.find((q) => String(q.id) === String(id))
      if (!row) return null
      row.status = status
      row.updated_at = new Date().toISOString()
      persist()
      return row
    },

    async getWhatsAppConfig() {
      return { ...state.whatsapp }
    },
    async updateWhatsAppConfig(patch = {}) {
      state.whatsapp = { ...state.whatsapp, ...patch }
      persist()
      return { ...state.whatsapp }
    },
    async listMessages({ limit = 100 } = {}) {
      return [...state.messages]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, limit)
    },
    async createMessage(data) {
      const row = {
        id: newId('msg'),
        wa_from: data.from ?? data.wa_from ?? null,
        name: data.name ?? null,
        text: data.text ?? null,
        type: data.type ?? 'text',
        direction: data.direction ?? 'in',
        wa_message_id: data.waMessageId ?? data.wa_message_id ?? null,
        created_at: new Date().toISOString(),
      }
      state.messages.push(row)
      persist()
      return row
    },

    async listSubscribers({ limit = 2000 } = {}) {
      return [...state.subscribers]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, limit)
        .map((row) => ({ ...row }))
    },
    async addSubscriber(email) {
      const clean = String(email ?? '').trim().toLowerCase()
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(clean)) throw new Error('EMAIL_INVALID')
      const existing = state.subscribers.find((row) => row.email === clean)
      if (existing) return { ...existing, duplicate: true }
      const row = {
        id: newId('sub'),
        email: clean,
        source: 'site',
        created_at: new Date().toISOString(),
      }
      state.subscribers.push(row)
      persist()
      return row
    },

    async stats() {
      const products = state.products
      const active = products.filter((row) => row.is_active !== false)
      const lowStock = active.filter((row) => Number(row.stock) > 0 && Number(row.stock) <= 5).length
      const outOfStock = active.filter((row) => Number(row.stock) <= 0).length
      const inventoryValue = active.reduce(
        (sum, row) => sum + Number(row.price_egp ?? 0) * Number(row.stock ?? 0),
        0,
      )
      const pending = state.quotes.filter((q) => q.status === 'pending').length
      return {
        products: products.length,
        activeProducts: active.length,
        categories: state.categories.length,
        quotes: state.quotes.length,
        pendingQuotes: pending,
        lowStock,
        outOfStock,
        inventoryValue,
        recentQuotes: [...state.quotes]
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5),
      }
    },

    async getSettings() {
      return clone(state.settings)
    },
    async updateSettings(patch) {
      state.settings = { ...state.settings, ...(patch && typeof patch === 'object' ? patch : {}) }
      persist()
      return clone(state.settings)
    },

    async listBrands({ includeInactive = false } = {}) {
      return state.brands
        .filter((row) => includeInactive || row.is_active !== false)
        .sort(sortByOrderThenCreated)
        .map(mapBrand)
    },
    async createBrand(data) {
      const row = brandToRow(data)
      if (state.brands.some((b) => String(b.id) === String(row.id))) throw new Error('BRAND_EXISTS')
      state.brands.push(row)
      persist()
      return mapBrand(row)
    },
    async updateBrand(id, data) {
      const idx = state.brands.findIndex((b) => String(b.id) === String(id))
      if (idx === -1) return null
      const merged = { ...mapBrand(state.brands[idx]), ...data, id: state.brands[idx].id }
      state.brands[idx] = brandToRow(merged)
      persist()
      return mapBrand(state.brands[idx])
    },
    async deleteBrand(id) {
      const before = state.brands.length
      state.brands = state.brands.filter((b) => String(b.id) !== String(id))
      const removed = state.brands.length < before
      if (removed) persist()
      return removed
    },

    async listPromos({ includeInactive = false } = {}) {
      return state.promos
        .filter((row) => includeInactive || row.is_active !== false)
        .sort(sortByOrderThenCreated)
        .map(mapPromo)
    },
    async createPromo(data) {
      const row = promoToRow(data)
      if (state.promos.some((p) => String(p.id) === String(row.id))) throw new Error('PROMO_EXISTS')
      state.promos.push(row)
      persist()
      return mapPromo(row)
    },
    async updatePromo(id, data) {
      const idx = state.promos.findIndex((p) => String(p.id) === String(id))
      if (idx === -1) return null
      const merged = { ...mapPromo(state.promos[idx]), ...data, id: state.promos[idx].id }
      state.promos[idx] = promoToRow(merged)
      persist()
      return mapPromo(state.promos[idx])
    },
    async deletePromo(id) {
      const before = state.promos.length
      state.promos = state.promos.filter((p) => String(p.id) !== String(id))
      const removed = state.promos.length < before
      if (removed) persist()
      return removed
    },

    async listUsers() {
      return state.users.map(mapUser)
    },
    async getUserByUsername(username) {
      const row = state.users.find(
        (u) => String(u.username).toLowerCase() === String(username).toLowerCase(),
      )
      return row ? { ...mapUser(row), passwordHash: row.password_hash } : null
    },
    async createUser(data) {
      const username = String(data.username ?? '').trim()
      if (!username) throw new Error('USERNAME_REQUIRED')
      if (state.users.some((u) => String(u.username).toLowerCase() === username.toLowerCase())) {
        throw new Error('USER_EXISTS')
      }
      const row = {
        id: newId('u'),
        username,
        password_hash: data.passwordHash,
        role: data.role ?? 'admin',
        is_active: data.isActive ?? true,
        created_at: new Date().toISOString(),
      }
      state.users.push(row)
      persist()
      return mapUser(row)
    },
    async updateUser(id, data) {
      const idx = state.users.findIndex((u) => String(u.id) === String(id))
      if (idx === -1) return null
      const row = state.users[idx]
      if (typeof data.passwordHash === 'string') row.password_hash = data.passwordHash
      if (data.role) row.role = data.role
      if (data.isActive != null) row.is_active = data.isActive
      if (data.username) row.username = String(data.username).trim()
      persist()
      return mapUser(row)
    },
    async deleteUser(id) {
      const before = state.users.length
      state.users = state.users.filter((u) => String(u.id) !== String(id))
      const removed = state.users.length < before
      if (removed) persist()
      return removed
    },
    async countUsers() {
      return state.users.length
    },

    async listCustomers() {
      return [...state.customers]
        .map(mapCustomer)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    },
    async getCustomer(id) {
      const row = state.customers.find((c) => String(c.id) === String(id))
      return row ? { ...mapCustomer(row), passwordHash: row.password_hash } : null
    },
    async getCustomerByEmail(email) {
      const target = String(email ?? '').trim().toLowerCase()
      if (!target) return null
      const row = state.customers.find((c) => String(c.email ?? '').toLowerCase() === target)
      return row ? { ...mapCustomer(row), passwordHash: row.password_hash } : null
    },
    async createCustomer(data) {
      const name = String(data.name ?? '').trim()
      const phone = String(data.phone ?? '').trim()
      if (!name) throw new Error('NAME_REQUIRED')
      if (!phone) throw new Error('PHONE_REQUIRED')
      const email = data.email ? String(data.email).trim().toLowerCase() : null
      if (email && state.customers.some((c) => String(c.email ?? '').toLowerCase() === email)) {
        throw new Error('EMAIL_EXISTS')
      }
      const row = {
        id: newId('cust'),
        name,
        phone,
        email,
        password_hash: data.passwordHash,
        address: data.address ?? null,
        city: data.city ?? null,
        notes: data.notes ?? null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      state.customers.push(row)
      persist()
      return mapCustomer(row)
    },
    async updateCustomer(id, data = {}) {
      const row = state.customers.find((c) => String(c.id) === String(id))
      if (!row) return null
      if (typeof data.passwordHash === 'string') row.password_hash = data.passwordHash
      if (data.name != null) row.name = String(data.name).trim()
      if (data.phone != null) row.phone = String(data.phone).trim()
      if (data.email !== undefined) row.email = data.email ? String(data.email).trim().toLowerCase() : null
      if (data.address !== undefined) row.address = data.address
      if (data.city !== undefined) row.city = data.city
      if (data.notes !== undefined) row.notes = data.notes
      row.updated_at = new Date().toISOString()
      persist()
      return mapCustomer(row)
    },

    async listOrders({ customerId, status } = {}) {
      return [...state.orders]
        .filter((o) => !customerId || String(o.customer_id) === String(customerId))
        .filter((o) => !status || String(o.status) === String(status))
        .map(mapOrder)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    },
    async getOrder(id) {
      const row = state.orders.find((o) => String(o.id) === String(id))
      return row ? mapOrder(row) : null
    },
    async createOrder(data) {
      const row = {
        id: newId('o'),
        number: (state.orderSeq += 1),
        customer_id: data.customerId ?? null,
        name: data.name,
        phone: data.phone,
        email: data.email ?? null,
        address: data.address ?? null,
        city: data.city ?? null,
        notes: data.notes ?? null,
        items: Array.isArray(data.items) ? data.items : [],
        subtotal: Number(data.subtotal ?? 0),
        shipping: Number(data.shipping ?? 0),
        discount: Number(data.discount ?? 0),
        total: Number(data.total ?? 0),
        status: 'pending',
        payment_method: data.paymentMethod ?? 'cod',
        source: data.source ?? 'app',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      state.orders.push(row)
      persist()
      return mapOrder(row)
    },
    async updateOrderStatus(id, status) {
      const row = state.orders.find((o) => String(o.id) === String(id))
      if (!row) return null
      row.status = status
      row.updated_at = new Date().toISOString()
      persist()
      return mapOrder(row)
    },

    async reports() {
      const active = state.products.filter((r) => r.is_active !== false)
      const byCategoryMap = new Map()
      for (const p of active) {
        const key = p.category_slug ?? 'uncategorized'
        const entry = byCategoryMap.get(key) ?? { id: key, count: 0, value: 0 }
        entry.count += 1
        entry.value += Number(p.price_egp ?? 0) * Number(p.stock ?? 0)
        byCategoryMap.set(key, entry)
      }
      const catName = new Map(state.categories.map((c) => [c.id, { ar: c.name_ar, en: c.name_en }]))
      const byCategory = [...byCategoryMap.values()].map((e) => ({
        ...e,
        name: catName.get(e.id) ?? { ar: e.id, en: e.id },
      }))
      const brandMap = new Map()
      for (const p of active) {
        const key = p.brand ?? '—'
        brandMap.set(key, (brandMap.get(key) ?? 0) + 1)
      }
      const brands = [...brandMap.entries()]
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
      const statusCounts = { pending: 0, contacted: 0, quoted: 0, won: 0, lost: 0 }
      for (const q of state.quotes) statusCounts[q.status] = (statusCounts[q.status] ?? 0) + 1
      const lowStock = active
        .filter((p) => Number(p.stock) <= 5)
        .sort((a, b) => Number(a.stock) - Number(b.stock))
        .slice(0, 20)
        .map((p) => ({
          id: p.id,
          name: { ar: p.name_ar, en: p.name_en },
          stock: Number(p.stock),
          brand: p.brand,
          category: p.category_slug,
        }))
      return {
        byCategory,
        brands,
        statusCounts,
        lowStock,
        currencyValue: active.reduce((s, p) => s + Number(p.price_egp ?? 0) * Number(p.stock ?? 0), 0),
      }
    },
  }
}

/* ------------------------------------------------------------------ *
 * Postgres store (Neon)
 * ------------------------------------------------------------------ */

export function createPgStore(sql) {
  return {
    source: 'postgres',

    async listProducts({ includeInactive = false } = {}) {
      const rows = includeInactive
        ? await sql`SELECT * FROM products ORDER BY sort_order ASC, created_at DESC LIMIT 1000`
        : await sql`SELECT * FROM products WHERE is_active = true ORDER BY sort_order ASC, created_at DESC LIMIT 1000`
      return rows.map(mapProduct)
    },
    async getProduct(id) {
      const rows = await sql`SELECT * FROM products WHERE id = ${id} LIMIT 1`
      return rows[0] ? mapProduct(rows[0]) : null
    },
    async createProduct(data) {
      const r = productToRow(data)
      const rows = await sql`
        INSERT INTO products
          (id, sku, slug, name_ar, name_en, category_slug, brand, price_egp,
           compare_at_price_egp, rating, reviews, art, palette, unit_ar, unit_en,
           min_order, stock, badges, keywords, is_active, sort_order)
        VALUES
          (${r.id}, ${r.sku}, ${r.slug}, ${r.name_ar}, ${r.name_en}, ${r.category_slug}, ${r.brand},
           ${r.price_egp}, ${r.compare_at_price_egp}, ${r.rating}, ${r.reviews}, ${r.art}, ${r.palette},
           ${r.unit_ar}, ${r.unit_en}, ${r.min_order}, ${r.stock},
           ${JSON.stringify(r.badges)}::jsonb, ${JSON.stringify(r.keywords)}::jsonb,
           ${r.is_active}, ${r.sort_order})
        RETURNING *
      `
      return mapProduct(rows[0])
    },
    async updateProduct(id, data) {
      const existing = await sql`SELECT * FROM products WHERE id = ${id} LIMIT 1`
      if (!existing[0]) return null
      const merged = { ...mapProduct(existing[0]), ...data, id }
      const r = productToRow(merged)
      const rows = await sql`
        UPDATE products SET
          sku = ${r.sku}, slug = ${r.slug}, name_ar = ${r.name_ar}, name_en = ${r.name_en},
          category_slug = ${r.category_slug}, brand = ${r.brand}, price_egp = ${r.price_egp},
          compare_at_price_egp = ${r.compare_at_price_egp}, rating = ${r.rating}, reviews = ${r.reviews},
          art = ${r.art}, palette = ${r.palette}, unit_ar = ${r.unit_ar}, unit_en = ${r.unit_en},
          min_order = ${r.min_order}, stock = ${r.stock},
          badges = ${JSON.stringify(r.badges)}::jsonb, keywords = ${JSON.stringify(r.keywords)}::jsonb,
          is_active = ${r.is_active}, sort_order = ${r.sort_order}
        WHERE id = ${id}
        RETURNING *
      `
      return mapProduct(rows[0])
    },
    async deleteProduct(id) {
      const rows = await sql`DELETE FROM products WHERE id = ${id} RETURNING id`
      return rows.length > 0
    },

    async listCategories({ includeInactive = false } = {}) {
      const rows = includeInactive
        ? await sql`SELECT * FROM categories ORDER BY sort_order ASC, created_at DESC LIMIT 200`
        : await sql`SELECT * FROM categories WHERE is_active = true ORDER BY sort_order ASC, created_at DESC LIMIT 200`
      return rows.map(mapCategory)
    },
    async getCategory(id) {
      const rows = await sql`SELECT * FROM categories WHERE id = ${id} LIMIT 1`
      return rows[0] ? mapCategory(rows[0]) : null
    },
    async createCategory(data) {
      const r = categoryToRow(data)
      const rows = await sql`
        INSERT INTO categories
          (id, slug, name_ar, name_en, desc_ar, desc_en, icon, art, tint,
           featured_ar, featured_en, groups, is_active, sort_order)
        VALUES
          (${r.id}, ${r.slug}, ${r.name_ar}, ${r.name_en}, ${r.desc_ar}, ${r.desc_en},
           ${r.icon}, ${r.art}, ${r.tint}, ${r.featured_ar}, ${r.featured_en},
           ${JSON.stringify(r.groups)}::jsonb, ${r.is_active}, ${r.sort_order})
        RETURNING *
      `
      return mapCategory(rows[0])
    },
    async updateCategory(id, data) {
      const existing = await sql`SELECT * FROM categories WHERE id = ${id} LIMIT 1`
      if (!existing[0]) return null
      const merged = { ...mapCategory(existing[0]), ...data, id }
      const r = categoryToRow(merged)
      const rows = await sql`
        UPDATE categories SET
          slug = ${r.slug}, name_ar = ${r.name_ar}, name_en = ${r.name_en},
          desc_ar = ${r.desc_ar}, desc_en = ${r.desc_en}, icon = ${r.icon}, art = ${r.art},
          tint = ${r.tint}, featured_ar = ${r.featured_ar}, featured_en = ${r.featured_en},
          groups = ${JSON.stringify(r.groups)}::jsonb, is_active = ${r.is_active},
          sort_order = ${r.sort_order}
        WHERE id = ${id}
        RETURNING *
      `
      return mapCategory(rows[0])
    },
    async deleteCategory(id) {
      const used = await sql`SELECT count(*)::int AS n FROM products WHERE category_slug = ${id}`
      if (used[0]?.n > 0) throw new Error('CATEGORY_IN_USE')
      const rows = await sql`DELETE FROM categories WHERE id = ${id} RETURNING id`
      return rows.length > 0
    },

    async listQuotes() {
      return await sql`SELECT * FROM quotes ORDER BY created_at DESC LIMIT 500`
    },
    async createQuote(data) {
      const rows = await sql`
        INSERT INTO quotes (name, phone, company, items, notes, source)
        VALUES (${data.name}, ${data.phone}, ${data.company ?? null},
                ${JSON.stringify(Array.isArray(data.items) ? data.items : [])}::jsonb,
                ${data.notes ?? null}, ${data.source ?? 'website'})
        RETURNING *
      `
      return rows[0]
    },
    async updateQuoteStatus(id, status) {
      const rows = await sql`
        UPDATE quotes SET status = ${status} WHERE id = ${id} RETURNING *
      `
      return rows[0] ?? null
    },

    async getWhatsAppConfig() {
      const rows = await sql`SELECT value FROM whatsapp_config WHERE id = 'default' LIMIT 1`
      return rows[0]?.value ?? {}
    },
    async updateWhatsAppConfig(patch = {}) {
      const current = await this.getWhatsAppConfig()
      const next = { ...current, ...patch }
      await sql`
        INSERT INTO whatsapp_config (id, value, updated_at)
        VALUES ('default', ${JSON.stringify(next)}::jsonb, now())
        ON CONFLICT (id) DO UPDATE SET value = EXCLUDED.value, updated_at = now()
      `
      return next
    },
    async listMessages({ limit = 100 } = {}) {
      return await sql`
        SELECT * FROM messages ORDER BY created_at DESC LIMIT ${limit}
      `
    },
    async listSubscribers({ limit = 2000 } = {}) {
      const rows = await sql`
        SELECT * FROM subscribers ORDER BY created_at DESC LIMIT ${Number(limit) || 2000}
      `
      return rows
    },
    async addSubscriber(email) {
      const clean = String(email ?? '').trim().toLowerCase()
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(clean)) throw new Error('EMAIL_INVALID')
      const existing = await sql`SELECT * FROM subscribers WHERE lower(email) = ${clean} LIMIT 1`
      if (existing[0]) return { ...existing[0], duplicate: true }
      const rows = await sql`
        INSERT INTO subscribers (id, email, source)
        VALUES (${newId('sub')}, ${clean}, 'site')
        ON CONFLICT (lower(email)) DO UPDATE SET email = EXCLUDED.email
        RETURNING *
      `
      return rows[0]
    },

    async createMessage(data) {
      const rows = await sql`
        INSERT INTO messages (wa_from, name, text, type, direction, wa_message_id)
        VALUES (${data.from ?? data.wa_from ?? null}, ${data.name ?? null},
                ${data.text ?? null}, ${data.type ?? 'text'},
                ${data.direction ?? 'in'},
                ${data.waMessageId ?? data.wa_message_id ?? null})
        RETURNING *
      `
      return rows[0]
    },

    async stats() {
      const [p] = await sql`SELECT
        count(*)::int AS total,
        count(*) FILTER (WHERE is_active)::int AS active,
        count(*) FILTER (WHERE is_active AND stock > 0 AND stock <= 5)::int AS low,
        count(*) FILTER (WHERE is_active AND stock <= 0)::int AS out,
        coalesce(sum(price_egp * stock) FILTER (WHERE is_active), 0)::int AS value
        FROM products`
      const [c] = await sql`SELECT count(*)::int AS total FROM categories`
      const [q] = await sql`SELECT
        count(*)::int AS total,
        count(*) FILTER (WHERE status = 'pending')::int AS pending
        FROM quotes`
      const recentQuotes = await sql`SELECT * FROM quotes ORDER BY created_at DESC LIMIT 5`
      return {
        products: p.total,
        activeProducts: p.active,
        categories: c.total,
        quotes: q.total,
        pendingQuotes: q.pending,
        lowStock: p.low,
        outOfStock: p.out,
        inventoryValue: Number(p.value),
        recentQuotes,
      }
    },

    async getSettings() {
      const rows = await sql`SELECT value FROM settings WHERE id = 'store' LIMIT 1`
      return rows[0]?.value ?? DEFAULT_SETTINGS()
    },
    async updateSettings(patch) {
      const rows = await sql`SELECT value FROM settings WHERE id = 'store' LIMIT 1`
      const merged = { ...(rows[0]?.value ?? DEFAULT_SETTINGS()), ...(patch || {}) }
      await sql`
        INSERT INTO settings (id, value) VALUES ('store', ${JSON.stringify(merged)}::jsonb)
        ON CONFLICT (id) DO UPDATE SET value = ${JSON.stringify(merged)}::jsonb, updated_at = now()
      `
      return merged
    },

    async listBrands({ includeInactive = false } = {}) {
      const rows = includeInactive
        ? await sql`SELECT * FROM brands ORDER BY sort_order ASC, id ASC LIMIT 500`
        : await sql`SELECT * FROM brands WHERE is_active = true ORDER BY sort_order ASC, id ASC LIMIT 500`
      return rows.map(mapBrand)
    },
    async createBrand(data) {
      const r = brandToRow(data)
      const rows = await sql`
        INSERT INTO brands (id, name, is_active, sort_order)
        VALUES (${r.id}, ${r.name}, ${r.is_active}, ${r.sort_order})
        RETURNING *
      `
      return mapBrand(rows[0])
    },
    async updateBrand(id, data) {
      const existing = await sql`SELECT * FROM brands WHERE id = ${id} LIMIT 1`
      if (!existing[0]) return null
      const r = brandToRow({ ...mapBrand(existing[0]), ...data, id })
      const rows = await sql`
        UPDATE brands SET name = ${r.name}, is_active = ${r.is_active}, sort_order = ${r.sort_order}
        WHERE id = ${id} RETURNING *
      `
      return mapBrand(rows[0])
    },
    async deleteBrand(id) {
      const rows = await sql`DELETE FROM brands WHERE id = ${id} RETURNING id`
      return rows.length > 0
    },

    async listPromos({ includeInactive = false } = {}) {
      const rows = includeInactive
        ? await sql`SELECT * FROM promos ORDER BY sort_order ASC, id ASC LIMIT 500`
        : await sql`SELECT * FROM promos WHERE is_active = true ORDER BY sort_order ASC, id ASC LIMIT 500`
      return rows.map(mapPromo)
    },
    async createPromo(data) {
      const r = promoToRow(data)
      const rows = await sql`
        INSERT INTO promos (id, deal_price, stock_total, sold, is_active, sort_order)
        VALUES (${r.id}, ${r.deal_price}, ${r.stock_total}, ${r.sold}, ${r.is_active}, ${r.sort_order})
        RETURNING *
      `
      return mapPromo(rows[0])
    },
    async updatePromo(id, data) {
      const existing = await sql`SELECT * FROM promos WHERE id = ${id} LIMIT 1`
      if (!existing[0]) return null
      const r = promoToRow({ ...mapPromo(existing[0]), ...data, id })
      const rows = await sql`
        UPDATE promos SET deal_price = ${r.deal_price}, stock_total = ${r.stock_total},
          sold = ${r.sold}, is_active = ${r.is_active}, sort_order = ${r.sort_order}
        WHERE id = ${id} RETURNING *
      `
      return mapPromo(rows[0])
    },
    async deletePromo(id) {
      const rows = await sql`DELETE FROM promos WHERE id = ${id} RETURNING id`
      return rows.length > 0
    },

    async listUsers() {
      const rows = await sql`SELECT * FROM users ORDER BY created_at ASC LIMIT 500`
      return rows.map(mapUser)
    },
    async getUserByUsername(username) {
      const rows = await sql`SELECT * FROM users WHERE lower(username) = lower(${username}) LIMIT 1`
      const row = rows[0]
      return row ? { ...mapUser(row), passwordHash: row.password_hash } : null
    },
    async createUser(data) {
      const username = String(data.username ?? '').trim()
      if (!username) throw new Error('USERNAME_REQUIRED')
      const rows = await sql`
        INSERT INTO users (id, username, password_hash, role, is_active)
        VALUES (${newId('u')}, ${username}, ${data.passwordHash}, ${data.role ?? 'admin'}, ${data.isActive ?? true})
        RETURNING *
      `
      return mapUser(rows[0])
    },
    async updateUser(id, data) {
      const existing = await sql`SELECT * FROM users WHERE id = ${id} LIMIT 1`
      if (!existing[0]) return null
      const row = existing[0]
      const password_hash =
        typeof data.passwordHash === 'string' ? data.passwordHash : row.password_hash
      const username = data.username ? String(data.username).trim() : row.username
      const rows = await sql`
        UPDATE users SET username = ${username}, password_hash = ${password_hash},
          role = ${data.role ?? row.role}, is_active = ${data.isActive ?? row.is_active}
        WHERE id = ${id} RETURNING *
      `
      return mapUser(rows[0])
    },
    async deleteUser(id) {
      const rows = await sql`DELETE FROM users WHERE id = ${id} RETURNING id`
      return rows.length > 0
    },
    async countUsers() {
      const rows = await sql`SELECT count(*)::int AS n FROM users`
      return rows[0]?.n ?? 0
    },

    async listCustomers() {
      const rows = await sql`SELECT * FROM customers ORDER BY created_at DESC LIMIT 500`
      return rows.map(mapCustomer)
    },
    async getCustomer(id) {
      const rows = await sql`SELECT * FROM customers WHERE id = ${id} LIMIT 1`
      const row = rows[0]
      return row ? { ...mapCustomer(row), passwordHash: row.password_hash } : null
    },
    async getCustomerByEmail(email) {
      const rows = await sql`SELECT * FROM customers WHERE lower(email) = lower(${email}) LIMIT 1`
      const row = rows[0]
      return row ? { ...mapCustomer(row), passwordHash: row.password_hash } : null
    },
    async createCustomer(data) {
      const name = String(data.name ?? '').trim()
      const phone = String(data.phone ?? '').trim()
      if (!name) throw new Error('NAME_REQUIRED')
      if (!phone) throw new Error('PHONE_REQUIRED')
      const email = data.email ? String(data.email).trim().toLowerCase() : null
      const rows = await sql`
        INSERT INTO customers (id, name, phone, email, password_hash, address, city, notes)
        VALUES (${newId('cust')}, ${name}, ${phone}, ${email}, ${data.passwordHash},
                ${data.address ?? null}, ${data.city ?? null}, ${data.notes ?? null})
        RETURNING *
      `
      return mapCustomer(rows[0])
    },
    async updateCustomer(id, data = {}) {
      const existing = await sql`SELECT * FROM customers WHERE id = ${id} LIMIT 1`
      const row = existing[0]
      if (!row) return null
      const name = data.name != null ? String(data.name).trim() : row.name
      const phone = data.phone != null ? String(data.phone).trim() : row.phone
      const email =
        data.email !== undefined
          ? data.email
            ? String(data.email).trim().toLowerCase()
            : null
          : row.email
      const passwordHash = typeof data.passwordHash === 'string' ? data.passwordHash : row.password_hash
      const rows = await sql`
        UPDATE customers SET
          name = ${name}, phone = ${phone}, email = ${email}, password_hash = ${passwordHash},
          address = ${data.address !== undefined ? data.address : row.address},
          city = ${data.city !== undefined ? data.city : row.city},
          notes = ${data.notes !== undefined ? data.notes : row.notes},
          updated_at = now()
        WHERE id = ${id}
        RETURNING *
      `
      return mapCustomer(rows[0])
    },

    async listOrders({ customerId, status, limit = 200 } = {}) {
      const rows = await sql`
        SELECT * FROM orders
        WHERE (${customerId || null}::text IS NULL OR customer_id = ${customerId || null})
          AND (${status || null}::text IS NULL OR status = ${status || null})
        ORDER BY created_at DESC
        LIMIT ${Number(limit) || 200}
      `
      return rows.map(mapOrder)
    },
    async getOrder(id) {
      const rows = await sql`SELECT * FROM orders WHERE id = ${id} LIMIT 1`
      return rows[0] ? mapOrder(rows[0]) : null
    },
    async createOrder(data) {
      const rows = await sql`
        INSERT INTO orders (id, customer_id, name, phone, email, address, city, notes,
                            items, subtotal, shipping, discount, total, payment_method, source)
        VALUES (${newId('o')}, ${data.customerId ?? null}, ${data.name}, ${data.phone}, ${data.email ?? null},
                ${data.address ?? null}, ${data.city ?? null}, ${data.notes ?? null},
                ${JSON.stringify(Array.isArray(data.items) ? data.items : [])}::jsonb,
                ${Number(data.subtotal ?? 0)}, ${Number(data.shipping ?? 0)},
                ${Number(data.discount ?? 0)}, ${Number(data.total ?? 0)},
                ${data.paymentMethod ?? 'cod'}, ${data.source ?? 'app'})
        RETURNING *
      `
      return mapOrder(rows[0])
    },
    async updateOrderStatus(id, status) {
      const rows = await sql`
        UPDATE orders SET status = ${status}, updated_at = now()
        WHERE id = ${id}
        RETURNING *
      `
      return rows[0] ? mapOrder(rows[0]) : null
    },

    async reports() {
      const cats = await sql`SELECT id, name_ar, name_en FROM categories`
      const catName = new Map(cats.map((c) => [c.id, { ar: c.name_ar, en: c.name_en }]))
      const byCat = await sql`
        SELECT category_slug AS id, count(*)::int AS count,
               coalesce(sum(price_egp * stock), 0)::int AS value
        FROM products WHERE is_active GROUP BY category_slug
      `
      const byCategory = byCat.map((e) => ({
        id: e.id ?? 'uncategorized',
        count: e.count,
        value: Number(e.value),
        name: catName.get(e.id) ?? { ar: e.id ?? '—', en: e.id ?? '—' },
      }))
      const brands = await sql`
        SELECT coalesce(brand, '—') AS name, count(*)::int AS count
        FROM products WHERE is_active GROUP BY brand ORDER BY count DESC
      `
      const statusRows = await sql`SELECT status, count(*)::int AS n FROM quotes GROUP BY status`
      const statusCounts = { pending: 0, contacted: 0, quoted: 0, won: 0, lost: 0 }
      for (const r of statusRows) statusCounts[r.status] = r.n
      const low = await sql`
        SELECT id, name_ar, name_en, stock, brand, category_slug
        FROM products WHERE is_active AND stock <= 5 ORDER BY stock ASC LIMIT 20
      `
      const lowStock = low.map((p) => ({
        id: p.id,
        name: { ar: p.name_ar, en: p.name_en },
        stock: Number(p.stock),
        brand: p.brand,
        category: p.category_slug,
      }))
      const value = byCategory.reduce((s, e) => s + e.value, 0)
      return { byCategory, brands, statusCounts, lowStock, currencyValue: value }
    },
  }
}

/* ------------------------------------------------------------------ *
 * Factory
 * ------------------------------------------------------------------ */

export async function getStore(env) {
  // 1) local dev server injects a file-backed store
  if (env && env.__STORE__) return env.__STORE__

  // 2) Postgres when configured
  const sql = await getSql(env)
  if (sql) return createPgStore(sql)

  // 3) in-memory fallback (per isolate; not durable across cold starts)
  const key = '__memory_store__'
  if (!globalThis[key]) globalThis[key] = createMemoryStore()
  return globalThis[key]
}
