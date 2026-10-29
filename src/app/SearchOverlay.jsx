import { useMemo, useState } from 'react'
import { ChevronRight, Search, X } from 'lucide-react'
import { useData } from '../context/DataContext.jsx'
import { useLang, useLocalizer } from '../context/LanguageContext.jsx'
import { useAppNav } from './nav.jsx'
import ProductArt from '../components/ProductArt.jsx'
import { formatPrice } from '../components/ui/Logo.jsx'

export default function SearchOverlay({ onClose }) {
  const { t, lang } = useLang()
  const localize = useLocalizer()
  const { products, categories } = useData()
  const nav = useAppNav()
  const [term, setTerm] = useState('')

  const results = useMemo(() => {
    const q = term.trim().toLowerCase()
    if (!q) return []
    return products
      .filter((p) => [localize(p, 'name'), p.brand, p.sku, ...(p.keywords ?? [])].join(' ').toLowerCase().includes(q))
      .slice(0, 12)
  }, [term, products, localize])

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-ink-50 pt-safe">
      <form
        onSubmit={(event) => {
          event.preventDefault()
          if (!term.trim()) return
          onClose()
          nav.push({ name: 'list', params: { query: term.trim() } })
        }}
        className="flex items-center gap-2 border-b border-ink-100 bg-white px-3 py-2.5 shadow-soft"
      >
        <button type="button" onClick={onClose} aria-label={t('common.close')} className="app-icon-button">
          <ChevronRight className="size-5" aria-hidden="true" />
        </button>
        <div className="app-search flex-1">
          <Search className="size-4 text-ink-400" aria-hidden="true" />
          <input
            autoFocus
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder={t('header.searchPlaceholder')}
            aria-label={t('header.searchPlaceholder')}
            className="min-w-0 flex-1 bg-transparent text-sm text-ink-800 outline-none placeholder:text-ink-400"
          />
          {term && (
            <button type="button" onClick={() => setTerm('')} aria-label={t('header.clearSearch')} className="grid size-8 shrink-0 place-items-center rounded-full text-ink-500">
              <X className="size-4 text-ink-400" aria-hidden="true" />
            </button>
          )}
        </div>
        <button type="submit" className="grid size-11 shrink-0 place-items-center rounded-full bg-app-600 text-white shadow-soft active:scale-95" aria-label={t('header.searchButton')}>
          <Search className="size-5" aria-hidden="true" />
        </button>
      </form>

      <div className="flex-1 overflow-y-auto p-4">
        {!term && (
          <div className="space-y-2">
            <p className="text-xs font-bold text-ink-400">{t('nav.categories')}</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => {
                    onClose()
                    nav.push({ name: 'category', params: { id: category.id } })
                  }}
                  className="min-h-10 rounded-full border border-ink-100 bg-white px-4 py-2 text-xs font-bold text-ink-700 shadow-soft active:scale-[0.98]"
                >
                  {localize(category, 'name')}
                </button>
              ))}
            </div>
          </div>
        )}

        {term && results.length === 0 && (
          <p className="py-16 text-center text-sm font-bold text-ink-500">{t('header.noResults')}</p>
        )}

        <div className="space-y-2">
          {results.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => {
                onClose()
                nav.push({ name: 'product', params: { id: product.id } })
              }}
              className="flex min-h-18 w-full items-center gap-3 rounded-2xl border border-ink-100 bg-white p-2.5 text-start shadow-soft active:scale-[0.99]"
            >
              <ProductArt kind={product.art} palette={product.palette} className="size-12 shrink-0 rounded-xl" />
              <span className="min-w-0 flex-1">
                <span className="line-clamp-1 text-[13px] font-bold text-ink-900">{localize(product, 'name')}</span>
                <span className="ltr-nums block text-[11px] text-ink-400">{product.brand}</span>
              </span>
              <span className="shrink-0 text-[13px] font-extrabold text-app-700">{formatPrice(product.price, lang)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
