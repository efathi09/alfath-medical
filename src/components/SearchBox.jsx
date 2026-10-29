import { useMemo, useRef, useState } from 'react'
import { Clock, Search, TrendingUp, X } from 'lucide-react'
import { useLang, useLocalizer } from '../context/LanguageContext.jsx'
import { useData } from '../context/DataContext.jsx'
import { searchProducts } from '../data/products.js'
import ProductArt from './ProductArt.jsx'
import { formatPrice } from './ui/Logo.jsx'

const popular = {
  ar: ['سماعة طبية', 'قفازات', 'قياس ضغط', 'بروتين', 'محلول وريدي'],
  en: ['Stethoscope', 'Gloves', 'Blood pressure', 'Protein', 'IV fluid'],
}

export default function SearchBox({
  value,
  onChange,
  category,
  onCategoryChange,
  onSubmit,
  className = '',
  autoFocus = false,
}) {
  const { t, lang } = useLang()
  const localize = useLocalizer()
  const { products, categories } = useData()
  const [open, setOpen] = useState(autoFocus)
  const [recent, setRecent] = useState([])
  const wrapRef = useRef(null)

  const results = useMemo(() => (value.trim() ? searchProducts(value, products).slice(0, 6) : []), [value, products])
  const suggestions = lang === 'ar' ? popular.ar : popular.en

  function commitSearch(term = value) {
    const cleaned = term.trim()
    if (!cleaned) return
    setRecent((prev) => [cleaned, ...prev.filter((item) => item !== cleaned)].slice(0, 4))
    setOpen(false)
    onSubmit?.(cleaned)
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter') {
      event.preventDefault()
      commitSearch()
    }
    if (event.key === 'Escape') setOpen(false)
  }

  function handleBlur(event) {
    const next = event.relatedTarget
    if (next && wrapRef.current?.contains(next)) return
    setOpen(false)
  }

  return (
    <div ref={wrapRef} onBlur={handleBlur} className={`relative ${className}`}>
      <div className="flex h-12 items-stretch overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-sm transition-shadow focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-100">
        <div className="relative hidden shrink-0 border-e border-ink-200 bg-ink-50 md:block">
          <select
            value={category}
            onChange={(event) => onCategoryChange?.(event.target.value)}
            aria-label={t('header.searchIn')}
            className="h-full cursor-pointer appearance-none bg-transparent py-0 pe-8 ps-3 text-xs font-bold text-ink-700 focus:outline-none"
          >
            <option value="all">{t('header.allCategories')}</option>
            {categories.map((categoryOption) => (
              <option key={categoryOption.id} value={categoryOption.id}>
                {localize(categoryOption, 'name')}
              </option>
            ))}
          </select>
          <svg
            viewBox="0 0 20 20"
            aria-hidden="true"
            className="pointer-events-none absolute end-2.5 top-1/2 size-4 -translate-y-1/2 text-ink-400"
          >
            <path d="M5 7.5l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute start-3.5 top-1/2 size-4.5 -translate-y-1/2 text-ink-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={value}
            autoFocus={autoFocus}
            onChange={(event) => onChange(event.target.value)}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={t('header.searchPlaceholder')}
            aria-label={t('header.searchButton')}
            aria-expanded={open}
            role="combobox"
            aria-controls="search-suggestions"
            className="h-full w-full bg-transparent py-0 pe-10 ps-11 text-sm text-ink-800 placeholder:text-ink-400 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              aria-label={t('common.close')}
              className="absolute end-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => commitSearch()}
          className="grid w-14 shrink-0 place-items-center bg-brand-600 text-white transition-colors hover:bg-brand-700"
          aria-label={t('header.searchButton')}
        >
          <Search className="size-5" aria-hidden="true" />
        </button>
      </div>

      {open && (
        <div
          id="search-suggestions"
          role="listbox"
          className="absolute inset-x-0 top-[calc(100%+8px)] z-50 max-h-[70vh] overflow-y-auto rounded-2xl border border-ink-100 bg-white p-2 shadow-lift"
        >
          {results.length > 0 ? (
            <>
              <p className="px-3 py-2 text-[11px] font-bold text-ink-400">{t('header.resultsFor')}</p>
              <ul className="space-y-0.5">
                {results.map((product) => (
                  <li key={product.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected="false"
                      onClick={() => {
                        onChange(product.name.en)
                        onCategoryChange?.(product.category)
                        setOpen(false)
                        onSubmit?.(product.name.en, product)
                      }}
                      className="flex w-full items-center gap-3 rounded-xl p-2 text-start transition-colors hover:bg-brand-50"
                    >
                      <ProductArt
                        kind={product.art}
                        palette={product.palette}
                        className="size-11 shrink-0 rounded-lg"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-1 block text-[13px] font-bold text-ink-800">
                          {localize(product, 'name')}
                        </span>
                        <span className="ltr-nums text-[11px] text-ink-400">{product.brand}</span>
                      </span>
                      <span className="shrink-0 text-xs font-extrabold text-brand-700">
                        {formatPrice(product.price, lang)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="p-1">
              {recent.length > 0 && (
                <div className="mb-3">
                  <p className="mb-2 px-2 text-[11px] font-bold text-ink-400">{t('header.recent')}</p>
                  <div className="flex flex-wrap gap-1.5 px-2">
                    {recent.map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => onChange(term)}
                        className="chip bg-ink-100 text-ink-600 hover:bg-ink-200"
                      >
                        <Clock className="size-3" aria-hidden="true" />
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <p className="mb-2 px-2 text-[11px] font-bold text-ink-400">{t('header.popular')}</p>
              <div className="flex flex-wrap gap-1.5 px-2 pb-1">
                {suggestions.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      onChange(term)
                      commitSearch(term)
                    }}
                    className="chip bg-brand-50 text-brand-700 hover:bg-brand-100"
                  >
                    <TrendingUp className="size-3" aria-hidden="true" />
                    {term}
                  </button>
                ))}
              </div>
              {value.trim() && (
                <button
                  type="button"
                  onClick={() => commitSearch()}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-ink-900 px-3 py-2.5 text-xs font-bold text-white transition-colors hover:bg-ink-800"
                >
                  <Search className="size-4" aria-hidden="true" />
                  {t('header.searchButton')}: {value}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
