import { FileText } from 'lucide-react'
import { useLang, useLocalizer } from '../context/LanguageContext.jsx'
import { useData } from '../context/DataContext.jsx'
import ProductArt from './ProductArt.jsx'
import SectionHeader from './ui/SectionHeader.jsx'

export default function CategoryTiles({ onNavigate, onQuote }) {
  const { t } = useLang()
  const localize = useLocalizer()
  const { products, categories } = useData()

  const countFor = (id) => products.filter((product) => product.category === id).length

  return (
    <section id="categories" className="container-x py-12 sm:py-14">
      <SectionHeader
        title={t('categories.title')}
        subtitle={t('categories.subtitle')}
        icon={LayoutGridIcon}
        action={
          <a href="#bestsellers" className="btn-outline px-4 py-2.5 text-xs">
            {t('nav.viewAllCategories')}
          </a>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category) => (
          <article
            key={category.id}
            className="group card relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
          >
            <div className="relative aspect-16/9 overflow-hidden">
              <ProductArt
                kind={category.art}
                palette={category.palette}
                className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div
                className={`absolute inset-0 bg-gradient-to-t ${category.tint} opacity-0 transition-opacity duration-300 group-hover:opacity-90`}
                aria-hidden="true"
              />
              <div className="absolute inset-0 flex flex-col justify-end p-4">
                <h3 className="text-base font-extrabold text-ink-900 transition-colors group-hover:text-white">
                  {localize(category, 'name')}
                </h3>
                <p className="mt-0.5 text-xs text-ink-600 transition-colors group-hover:text-white/85">
                  {localize(category, 'desc')}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 p-4">
              <span className="text-xs font-bold text-ink-500">
                <span className="num">{countFor(category.id)}</span> {t('categories.items')}
              </span>
              <button
                type="button"
                onClick={() => onNavigate?.(category.id, '')}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-extrabold text-brand-700 transition-colors hover:bg-brand-600 hover:text-white"
              >
                {t('categories.browse')}
              </button>
            </div>

            <ul className="flex flex-wrap gap-1.5 px-4 pb-4">
              {(category.groups?.[0]?.items ?? []).slice(0, 3).map((item) => (
                <li key={item.en}>
                  <button
                    type="button"
                    onClick={() => onNavigate?.(category.id, localize(item))}
                    className="rounded-lg border border-ink-100 px-2 py-1 text-[11px] font-medium text-ink-500 transition-colors hover:border-brand-300 hover:text-brand-700"
                  >
                    {localize(item)}
                  </button>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-dashed border-deal-300 bg-deal-50/60 px-6 py-5 sm:flex-row">
        <div className="text-center sm:text-start">
          <p className="text-sm font-extrabold text-deal-700">{t('cta.title')}</p>
          <p className="mt-0.5 text-xs text-deal-600/90">{t('cta.subtitle')}</p>
        </div>
        <button type="button" onClick={() => onQuote?.()} className="btn-accent shrink-0 px-5 py-2.5">
          <FileText className="size-4" aria-hidden="true" />
          {t('product.requestQuote')}
        </button>
      </div>
    </section>
  )
}

function LayoutGridIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}
