import { useMemo, useState } from 'react'
import { Flame, PackageSearch, SearchX, SlidersHorizontal } from 'lucide-react'
import { useLang, useLocalizer } from '../context/LanguageContext.jsx'
import { useData } from '../context/DataContext.jsx'
import { searchProducts } from '../data/products.js'
import ProductCard from './ProductCard.jsx'
import SectionHeader from './ui/SectionHeader.jsx'

const SORTS = ['relevance', 'cheapest', 'expensive', 'rating', 'discount']

export default function BestSellers({ category, query, onCategoryChange, onClearFilters, onQuote }) {
  const { t } = useLang()
  const localize = useLocalizer()
  const { products, categories } = useData()
  const [sort, setSort] = useState('relevance')
  const [visible, setVisible] = useState(8)
  const [filters, setFilters] = useState({ category, query })

  if (filters.category !== category || filters.query !== query) {
    setFilters({ category, query })
    setVisible(8)
  }

  const list = useMemo(() => {
    let base = query?.trim() ? searchProducts(query, products) : products
    if (category && category !== 'all') base = base.filter((product) => product.category === category)

    const sorted = [...base]
    switch (sort) {
      case 'cheapest':
        sorted.sort((a, b) => a.price - b.price)
        break
      case 'expensive':
        sorted.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating)
        break
      case 'discount':
        sorted.sort((a, b) => b.oldPrice / b.price - a.oldPrice / a.price)
        break
      default:
        sorted.sort((a, b) => b.rating * 10 + b.reviews / 100 - (a.rating * 10 + a.reviews / 100))
    }
    return sorted
  }, [category, query, sort, products])

  function scrollRow(dir) {
    const track = document.getElementById('bestsellers-track')
    if (!track) return
    track.scrollBy({ left: dir * (track.clientWidth * 0.75), behavior: 'smooth' })
  }

  const tabs = [
    { id: 'all', label: t('bestsellers.tabs.all') },
    ...categories.map((categoryOption) => ({
      id: categoryOption.id,
      label: localize(categoryOption, 'name'),
    })),
  ]

  return (
    <section id="bestsellers" className="container-x py-12 sm:py-16">
      <SectionHeader
        title={t('bestsellers.title')}
        subtitle={query?.trim() ? `${t('header.resultsFor')}: ${query}` : t('bestsellers.subtitle')}
        icon={Flame}
        action={
          <div className="flex items-center gap-2">
            <label className="hidden items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 sm:flex">
              <SlidersHorizontal className="size-4 shrink-0 text-ink-400" aria-hidden="true" />
              <span className="text-[11px] font-bold whitespace-nowrap text-ink-500">{t('product.sortBy')}</span>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                aria-label={t('product.sortBy')}
                className="cursor-pointer bg-transparent text-xs font-bold text-ink-800 focus:outline-none"
              >
                {SORTS.map((option) => (
                  <option key={option} value={option}>
                    {t(`product.sort.${option}`)}
                  </option>
                ))}
              </select>
            </label>
            <div className="hidden gap-2 md:flex">
              <button
                type="button"
                onClick={() => scrollRow(-1)}
                aria-label={t('hero.prev')}
                className="min-h-10 rounded-xl border border-ink-200 bg-white px-3 text-xs font-bold text-ink-600 transition-colors hover:border-brand-400 hover:text-brand-700"
              >
                {t('hero.prev')}
              </button>
              <button
                type="button"
                onClick={() => scrollRow(1)}
                aria-label={t('hero.next')}
                className="min-h-10 rounded-xl border border-ink-200 bg-white px-3 text-xs font-bold text-ink-600 transition-colors hover:border-brand-400 hover:text-brand-700"
              >
                {t('hero.next')}
              </button>
            </div>
          </div>
        }
      />

      <div className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        {tabs.map((tab) => {
          const active = (category ?? 'all') === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onCategoryChange?.(tab.id)}
              aria-pressed={active}
              className={`chip shrink-0 px-4 py-2 text-xs transition-colors ${
                active
                  ? 'bg-brand-600 text-white shadow-soft'
                  : 'border border-ink-200 bg-white text-ink-600 hover:border-brand-300 hover:text-brand-700'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {list.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-ink-200 bg-white px-6 py-16 text-center">
          <SearchX className="mx-auto size-12 text-ink-300" aria-hidden="true" />
          <p className="mt-4 text-base font-extrabold text-ink-900">{t('product.noProducts')}</p>
          <p className="mt-1 text-sm text-ink-500">{t('header.noResults')}</p>
          <button
            type="button"
            onClick={() => onClearFilters?.()}
            className="btn-outline mt-5 px-5 py-2.5"
          >
            {t('product.clearFilters')}
          </button>
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between gap-3 text-xs font-bold text-ink-500">
            <span>
              <span className="num">{list.length}</span> {t('product.resultsCount')}
            </span>
            {query?.trim() && (
              <button
                type="button"
                onClick={() => onClearFilters?.()}
                className="text-brand-700 underline-offset-4 hover:underline"
              >
                {t('product.clearFilters')}
              </button>
            )}
          </div>

          <div
            id="bestsellers-track"
            className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3 xl:grid-cols-4"
          >
            {list.slice(0, visible).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuote={onQuote}
                className="w-[248px] shrink-0 snap-start sm:w-auto"
              />
            ))}
          </div>

          {visible < list.length && (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => setVisible((prev) => prev + 8)}
                className="btn-outline px-6 py-3"
              >
                <PackageSearch className="size-4" aria-hidden="true" />
                {t('bestsellers.viewAll')}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  )
}
