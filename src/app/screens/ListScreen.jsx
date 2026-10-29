import { useMemo, useState } from 'react'
import { ChevronDown, Search, X } from 'lucide-react'
import { useData } from '../../context/DataContext.jsx'
import { useLang, useLocalizer } from '../../context/LanguageContext.jsx'
import { useAppNav } from '../nav.jsx'
import { discountPercent } from '../../data/products.js'
import { getCategory } from '../../data/categories.js'
import ProductTile from '../ProductTile.jsx'

const SORTS = [
  { id: 'relevance', key: 'product.sort.relevance' },
  { id: 'cheapest', key: 'product.sort.cheapest' },
  { id: 'expensive', key: 'product.sort.expensive' },
  { id: 'rating', key: 'product.sort.rating' },
  { id: 'discount', key: 'product.sort.discount' },
  { id: 'reviews', key: 'product.sort.reviews' },
]

const PRICE_BANDS = [
  { id: 'all', key: 'filter.anyPrice' },
  { id: 'u200', key: 'filter.under200', test: (p) => p.price < 200 },
  { id: 'mid', key: 'filter.mid', test: (p) => p.price >= 200 && p.price <= 1000 },
  { id: 'o1000', key: 'filter.over1000', test: (p) => p.price > 1000 },
]

const RATING_OPTIONS = [
  { value: 0, key: 'filter.anyRating' },
  { value: 4, key: 'filter.r40' },
  { value: 4.5, key: 'filter.r45' },
  { value: 4.8, key: 'filter.r48' },
]

const DISCOUNT_OPTIONS = [
  { value: 0, key: 'filter.anyDiscount' },
  { value: 10, key: 'filter.d10' },
  { value: 25, key: 'filter.d25' },
  { value: 50, key: 'filter.d50' },
]

// The filter groups rendered as a fixed row above the product list. Each one
// expands inline (no bottom sheet / modal).
const GROUPS = [
  { id: 'brand', key: 'filter.brand' },
  { id: 'price', key: 'filter.price' },
  { id: 'rating', key: 'filter.rating' },
  { id: 'discount', key: 'filter.discount' },
]

const EMPTY_FILTERS = {
  brand: null,
  band: 'all',
  minPrice: '',
  maxPrice: '',
  rating: 0,
  minDiscount: 0,
  inStock: false,
}

export default function ListScreen() {
  const { t } = useLang()
  const localize = useLocalizer()
  const { products } = useData()
  const nav = useAppNav()
  const current = nav.current
  const params = useMemo(() => current.params ?? {}, [current])
  const categoryId = params.category ?? params.id

  const [sort, setSort] = useState('relevance')
  const [term, setTerm] = useState(params.query ?? '')
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [openGroup, setOpenGroup] = useState(null)

  const heading = useMemo(() => {
    if (params.query) return `«${params.query}»`
    if (params.titleKey) return t(params.titleKey)
    if (categoryId) {
      const category = getCategory(categoryId)
      return category ? localize(category, 'name') : t('nav.categories')
    }
    return t('bestsellers.title')
  }, [params, categoryId, t, localize])

  const base = useMemo(() => {
    let items = products
    if (params.query) {
      const q = params.query.trim().toLowerCase()
      items = items.filter((p) =>
        [localize(p, 'name'), p.brand, p.sku, ...(p.keywords ?? [])].join(' ').toLowerCase().includes(q),
      )
    } else if (categoryId) {
      items = items.filter((p) => p.category === categoryId)
    } else if (params.mode === 'offers') {
      items = items.filter((p) => p.oldPrice > p.price)
    } else if (params.mode === 'bestsellers') {
      const flagged = items.filter((p) => (p.badges ?? []).includes('bestSeller'))
      items = flagged.length ? flagged : items
    }
    return items
  }, [products, params, categoryId, localize])

  const brandOptions = useMemo(() => {
    const names = new Set()
    for (const p of base) if (p.brand) names.add(p.brand)
    return [...names].sort((a, b) => a.localeCompare(b))
  }, [base])

  const filtered = useMemo(() => {
    let items = base
    if (filters.brand) items = items.filter((p) => p.brand === filters.brand)
    if (filters.inStock) items = items.filter((p) => Number(p.stock) > 0)

    const band = PRICE_BANDS.find((b) => b.id === filters.band)
    if (band?.test) items = items.filter(band.test)

    const min = filters.minPrice === '' ? null : Number(filters.minPrice)
    const max = filters.maxPrice === '' ? null : Number(filters.maxPrice)
    if (min !== null && !Number.isNaN(min)) items = items.filter((p) => p.price >= min)
    if (max !== null && !Number.isNaN(max)) items = items.filter((p) => p.price <= max)

    if (filters.rating > 0) items = items.filter((p) => (p.rating ?? 0) >= filters.rating)
    if (filters.minDiscount > 0) {
      items = items.filter((p) => discountPercent(p) >= filters.minDiscount)
    }
    return items
  }, [base, filters])

  const sorted = useMemo(() => {
    const items = [...filtered]
    if (sort === 'cheapest') items.sort((a, b) => a.price - b.price)
    else if (sort === 'expensive') items.sort((a, b) => b.price - a.price)
    else if (sort === 'rating') items.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    else if (sort === 'discount') items.sort((a, b) => discountPercent(b) - discountPercent(a))
    else if (sort === 'reviews') items.sort((a, b) => (b.reviews ?? 0) - (a.reviews ?? 0))
    else if (params.mode === 'offers') items.sort((a, b) => discountPercent(b) - discountPercent(a))
    return items
  }, [filtered, sort, params.mode])

  const activeCount =
    (filters.brand ? 1 : 0) +
    (filters.band !== 'all' ? 1 : 0) +
    (filters.minPrice !== '' || filters.maxPrice !== '' ? 1 : 0) +
    (filters.rating > 0 ? 1 : 0) +
    (filters.minDiscount > 0 ? 1 : 0) +
    (filters.inStock ? 1 : 0)

  // Per-group counter so each chip in the fixed row shows its own active count.
  const groupCount = (id) => {
    if (id === 'brand') return filters.brand ? 1 : 0
    if (id === 'price') {
      return (filters.band !== 'all' ? 1 : 0) + (filters.minPrice !== '' || filters.maxPrice !== '' ? 1 : 0)
    }
    if (id === 'rating') return filters.rating > 0 ? 1 : 0
    if (id === 'discount') return filters.minDiscount > 0 ? 1 : 0
    return 0
  }

  function toggle(patch) {
    setFilters((prev) => ({ ...prev, ...patch }))
  }

  return (
    <div className="space-y-3 p-4">
      <form
        onSubmit={(event) => {
          event.preventDefault()
          if (term.trim()) nav.push({ name: 'list', params: { query: term.trim() } })
        }}
        className="app-search"
      >
        <Search className="size-4 shrink-0 text-app-600" aria-hidden="true" />
        <input
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder={t('header.searchPlaceholder')}
          aria-label={t('header.searchPlaceholder')}
          className="min-w-0 flex-1 bg-transparent text-sm text-ink-800 outline-none placeholder:text-ink-400"
        />
        {term && (
          <button
            type="button"
            onClick={() => setTerm('')}
            aria-label={t('header.clearSearch')}
            className="grid size-9 shrink-0 place-items-center rounded-full text-ink-500 active:scale-95"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        )}
        <button type="submit" aria-label={t('header.searchButton')} className="grid size-10 shrink-0 place-items-center rounded-xl bg-app-600 text-white active:scale-95">
          <Search className="size-4" aria-hidden="true" />
        </button>
      </form>

      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-extrabold text-ink-900">{heading}</h2>
        <span className="text-xs text-ink-500">
          <span className="num">{sorted.length}</span> {t('product.resultsCount')}
        </span>
      </div>

      {/* Sort chips — redesigned, now includes discount + reviews. */}
      <div className="no-scrollbar -mx-4 flex items-center gap-2 overflow-x-auto px-4">
        {SORTS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setSort(option.id)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
              sort === option.id ? 'bg-app-600 text-white' : 'bg-white text-ink-500 shadow-soft'
            }`}
          >
            {t(option.key)}
          </button>
        ))}
      </div>

      {/* Fixed filter row — always visible above the list, expands inline. */}
      <div className="flex flex-wrap items-center gap-2">
        {GROUPS.map((group) => {
          const count = groupCount(group.id)
          const isOpen = openGroup === group.id
          return (
            <button
              key={group.id}
              type="button"
              onClick={() => setOpenGroup(isOpen ? null : group.id)}
              aria-expanded={isOpen}
              className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                count || isOpen ? 'bg-app-600 text-white' : 'bg-white text-ink-500 shadow-soft'
              }`}
            >
              {t(group.key)}
              {count > 0 && (
                <span className="num grid min-w-4 place-items-center rounded-full bg-white px-1 text-[10px] text-app-700">
                  {count}
                </span>
              )}
              <ChevronDown
                className={`size-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </button>
          )
        })}

        <button
          type="button"
          onClick={() => toggle({ inStock: !filters.inStock })}
          className={`ms-auto flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
            filters.inStock ? 'bg-app-600 text-white' : 'bg-white text-ink-500 shadow-soft'
          }`}
        >
          {t('filter.inStockOnly')}
        </button>
      </div>

      {/* Inline panel for the open group — sits above the list, no overlay. */}
      {openGroup && (
        <div className="rounded-2xl bg-white p-4 shadow-soft">
          {openGroup === 'brand' && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => toggle({ brand: null })}
                className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                  !filters.brand ? 'bg-app-600 text-white' : 'bg-ink-100 text-ink-600'
                }`}
              >
                {t('filter.all')}
              </button>
              {brandOptions.map((brand) => (
                <button
                  key={brand}
                  type="button"
                  onClick={() => toggle({ brand })}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                    filters.brand === brand ? 'bg-app-600 text-white' : 'bg-ink-100 text-ink-600'
                  }`}
                >
                  {brand}
                </button>
              ))}
            </div>
          )}

          {openGroup === 'price' && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {PRICE_BANDS.map((band) => (
                  <button
                    key={band.id}
                    type="button"
                    onClick={() => toggle({ band: band.id, minPrice: '', maxPrice: '' })}
                    className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                      filters.band === band.id && filters.minPrice === '' && filters.maxPrice === ''
                        ? 'bg-app-600 text-white'
                        : 'bg-ink-100 text-ink-600'
                    }`}
                  >
                    {t(band.key)}
                  </button>
                ))}
              </div>

              {/* Custom range — clears the preset band while typing. */}
              <div className="flex items-center gap-2">
                <input
                  inputMode="numeric"
                  dir="ltr"
                  value={filters.minPrice}
                  onChange={(event) =>
                    setFilters((prev) => ({
                      ...prev,
                      minPrice: event.target.value.replace(/[^\d]/g, ''),
                      band: 'all',
                    }))
                  }
                  placeholder={t('filter.minPrice')}
                  aria-label={t('filter.minPrice')}
                  className="w-full min-w-0 rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm text-ink-800 outline-none focus:border-app-500"
                />
                <span className="text-ink-400">–</span>
                <input
                  inputMode="numeric"
                  dir="ltr"
                  value={filters.maxPrice}
                  onChange={(event) =>
                    setFilters((prev) => ({
                      ...prev,
                      maxPrice: event.target.value.replace(/[^\d]/g, ''),
                      band: 'all',
                    }))
                  }
                  placeholder={t('filter.maxPrice')}
                  aria-label={t('filter.maxPrice')}
                  className="w-full min-w-0 rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm text-ink-800 outline-none focus:border-app-500"
                />
              </div>
            </div>
          )}

          {openGroup === 'rating' && (
            <div className="flex flex-wrap gap-2">
              {RATING_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggle({ rating: option.value })}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                    filters.rating === option.value ? 'bg-app-600 text-white' : 'bg-ink-100 text-ink-600'
                  }`}
                >
                  {t(option.key)}
                </button>
              ))}
            </div>
          )}

          {openGroup === 'discount' && (
            <div className="flex flex-wrap gap-2">
              {DISCOUNT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggle({ minDiscount: option.value })}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                    filters.minDiscount === option.value ? 'bg-app-600 text-white' : 'bg-ink-100 text-ink-600'
                  }`}
                >
                  {t(option.key)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {activeCount > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-ink-500">
            <span className="num">{activeCount}</span> {t('filter.title')}
          </span>
          <button
            type="button"
            onClick={() => {
              setFilters(EMPTY_FILTERS)
              setOpenGroup(null)
            }}
            className="flex items-center gap-1 text-xs font-bold text-app-600"
          >
            <X className="size-3.5" aria-hidden="true" />
            {t('filter.clear')}
          </button>
        </div>
      )}

      {sorted.length === 0 ? (
        <div className="grid place-items-center rounded-2xl bg-white py-16 text-center shadow-soft">
          <p className="text-sm font-bold text-ink-500">{t('product.noProducts')}</p>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={() => setFilters(EMPTY_FILTERS)}
              className="mt-3 text-xs font-bold text-app-600"
            >
              {t('filter.clear')}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {sorted.map((product) => (
            <ProductTile
              key={product.id}
              product={product}
              onOpen={(p) => nav.push({ name: 'product', params: { id: p.id } })}
            />
          ))}
        </div>
      )}
    </div>
  )
}
