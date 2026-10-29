import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { categories as seedCategories } from '../data/categories.js'
import { products as seedProducts } from '../data/products.js'
import { company } from '../data/company.js'
import { heroSlides, flashDeals } from '../data/promos.js'
import { apiUrl } from '../lib/api.js'

const DataContext = createContext(null)

const STORAGE_KEY = 'me.catalog'

// Served by functions/api/* (Cloudflare Pages Functions) in production,
// and by scripts/dev-api.mjs locally. If the request fails we simply keep
// whatever we already have (seed -> cache -> last good response).
const API = {
  products: apiUrl('/api/products'),
  categories: apiUrl('/api/categories'),
  settings: apiUrl('/api/settings'),
  promos: apiUrl('/api/promos'),
  brands: apiUrl('/api/brands'),
}

/* ---- Defaults derived from the static company/promos modules ---------- */

function defaultSettings() {
  return {
    phone: company.phone,
    phoneHref: company.phoneHref,
    whatsapp: company.whatsapp,
    email: company.email,
    address: company.address,
    workingHours: company.workingHours,
    vat: company.vat,
    cr: company.cr,
    social: company.social,
    payments: company.payments,
    trustBadges: company.trustBadges,
    banners: heroSlides.map((s, i) => ({ ...s, isActive: true, sortOrder: i })),
  }
}

function defaultBrands() {
  return (company.brands ?? []).map((name, i) => ({
    id: `b-${i + 1}`,
    name,
    isActive: true,
    sortOrder: i,
  }))
}

function readCache() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || !Array.isArray(parsed.products) || parsed.products.length === 0) return null
    return parsed
  } catch {
    return null
  }
}

function writeCache(products, categories) {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ products, categories, at: Date.now() }),
    )
  } catch {
    /* storage full or unavailable — the app keeps working from memory */
  }
}

// Computed once at boot (before first paint) so we never need to setState
// synchronously inside an effect. Priority: cache -> bundled seed.
let bootCatalog
function initialCatalog() {
  if (!bootCatalog) {
    const cached = readCache()
    if (cached) {
      bootCatalog = {
        products: cached.products,
        categories:
          Array.isArray(cached.categories) && cached.categories.length
            ? cached.categories
            : seedCategories,
        source: 'cache',
      }
    } else {
      bootCatalog = { products: seedProducts, categories: seedCategories, source: 'seed' }
    }
  }
  return bootCatalog
}

export function DataProvider({ children }) {
  // Seed/cache data first so the very first paint is instant and the app is
  // fully usable offline (the PWA promise does not change).
  const [products, setProducts] = useState(() => initialCatalog().products)
  const [categories, setCategories] = useState(() => initialCatalog().categories)
  const [source, setSource] = useState(() => initialCatalog().source)
  const [settings, setSettings] = useState(() => defaultSettings())
  const [promos, setPromos] = useState(() => flashDeals)
  const [brands, setBrands] = useState(() => defaultBrands())

  useEffect(() => {
    let alive = true
    let attempt = 0
    let retryTimer = 0

    // Every endpoint is applied on its own: one failed or slow request must not
    // discard the rest (previously Promise.all rejected the whole batch, so the
    // app silently kept the bundled seed instead of the live catalog).
    async function load() {
      try {
        const results = await Promise.allSettled([
          fetch(API.products, { headers: { accept: 'application/json' } }),
          fetch(API.categories, { headers: { accept: 'application/json' } }),
          fetch(API.settings, { headers: { accept: 'application/json' } }),
          fetch(API.promos, { headers: { accept: 'application/json' } }),
          fetch(API.brands, { headers: { accept: 'application/json' } }),
        ])
        if (!alive) return

        const body = async (entry) => {
          if (entry.status !== 'fulfilled' || !entry.value.ok) return null
          try {
            return await entry.value.json()
          } catch {
            return null
          }
        }

        const [nextProducts, nextCategories, nextSettings, nextPromos, nextBrands] =
          await Promise.all(results.map(body))
        if (!alive) return

        const hasProducts = Array.isArray(nextProducts) && nextProducts.length > 0
        const hasCategories = Array.isArray(nextCategories) && nextCategories.length > 0
        const hasPromos = Array.isArray(nextPromos) && nextPromos.length > 0
        const hasBrands = Array.isArray(nextBrands) && nextBrands.length > 0

        if (hasProducts) {
          setProducts(nextProducts)
          setSource('api')
        }
        if (hasCategories) {
          setCategories(nextCategories)
        }
        if (nextSettings && typeof nextSettings === 'object' && !Array.isArray(nextSettings)) {
          setSettings(nextSettings)
        }
        if (hasPromos) setPromos(nextPromos)
        if (hasBrands) setBrands(nextBrands)

        if (hasProducts) {
          writeCache(nextProducts, hasCategories ? nextCategories : initialCatalog().categories)
          return
        }

        // The catalog never arrived (cold start before connectivity is up):
        // retry a few times with a growing delay instead of showing stale data.
        if (attempt < 4 && alive) {
          attempt += 1
          retryTimer = window.setTimeout(load, 1500 * attempt)
        }
      } catch {
        /* offline or API unavailable — keep seed/cache */
        if (attempt < 4 && alive) {
          attempt += 1
          retryTimer = window.setTimeout(load, 1500 * attempt)
        }
      }
    }

    load()

    return () => {
      alive = false
      window.clearTimeout(retryTimer)
    }
  }, [])

  const value = useMemo(
    () => ({ products, categories, source, settings, promos, brands }),
    [products, categories, source, settings, promos, brands],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  // Safe fallback so a component still renders if it is ever mounted
  // outside the provider (e.g. isolated tests).
  return (
    ctx ?? {
      products: seedProducts,
      categories: seedCategories,
      source: 'seed',
      settings: defaultSettings(),
      promos: flashDeals,
      brands: defaultBrands(),
    }
  )
}

/**
 * The company profile merged with any admin-managed overrides from the
 * `settings` row. Contact details, payments, trust badges and the brand
 * marquee all read from here so changes in /admin apply site-wide.
 */
export function useCompany() {
  const { settings, brands } = useData()
  return useMemo(() => {
    const activeNames =
      Array.isArray(brands) && brands.length
        ? brands.filter((b) => b.isActive !== false).map((b) => b.name)
        : company.brands
    return { ...company, ...(settings || {}), brands: activeNames }
  }, [settings, brands])
}
