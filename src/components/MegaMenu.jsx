import { useEffect, useRef, useState } from 'react'
import {
  Activity,
  Apple,
  ChevronDown,
  FileText,
  Flame,
  GraduationCap,
  LayoutGrid,
  PackageCheck,
  Percent,
  Sparkles,
  Store,
} from 'lucide-react'
import { useLang, useLocalizer } from '../context/LanguageContext.jsx'
import { useData } from '../context/DataContext.jsx'
import { quickLinks } from '../data/categories.js'
import ProductArt from './ProductArt.jsx'

const quickIcon = {
  Activity: Activity,
  GraduationCap: GraduationCap,
  Apple: Apple,
  PackageCheck: PackageCheck,
  Zap: Flame,
  Flame: Flame,
  Sparkles: Sparkles,
  Percent: Percent,
  BadgeCheck: Store,
  Store: Store,
}

function CategoryColumn({ group, localize, onNavigate, query }) {
  return (
    <div className="min-w-0">
      <h4 className="mb-2.5 flex items-center gap-2 text-[13px] font-extrabold text-ink-900">
        <span className="h-3.5 w-1 rounded-full bg-brand-500" aria-hidden="true" />
        {localize(group, 'title')}
      </h4>
      <ul className="space-y-1">
        {group.items.map((item) => (
          <li key={item.en}>
            <button
              type="button"
              onClick={() => onNavigate(group.categoryId, query ? `${query} ${localize(item)}` : localize(item))}
              className="group/item flex w-full items-center rounded-lg px-2 py-1.5 text-start text-[13px] text-ink-600 transition-colors hover:bg-brand-50 hover:text-brand-700"
            >
              <span className="truncate">{localize(item)}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function MegaMenu({ query, onNavigate, onQuote }) {
  const { t } = useLang()
  const localize = useLocalizer()
  const { categories } = useData()
  const [openId, setOpenId] = useState(null)
  const closeTimer = useRef(null)
  const wrapperRef = useRef(null)

  useEffect(() => {
    function onKey(event) {
      if (event.key === 'Escape') setOpenId(null)
    }
    function onPointerDown(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setOpenId(null)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [])

  useEffect(() => () => window.clearTimeout(closeTimer.current), [])

  function handleEnter(id) {
    window.clearTimeout(closeTimer.current)
    setOpenId(id)
  }

  function handleLeave() {
    window.clearTimeout(closeTimer.current)
    closeTimer.current = window.setTimeout(() => setOpenId(null), 140)
  }

  const active = categories.find((category) => category.id === openId)

  return (
    <div ref={wrapperRef} className="relative z-40" onMouseLeave={handleLeave}>
      <nav aria-label={t('nav.categories')} className="container-x">
        <ul className="no-scrollbar hidden items-center gap-1 overflow-x-auto lg:flex">
          <li>
            <a
              href="#top"
              className="flex items-center gap-1.5 rounded-xl px-3 py-3 text-sm font-bold text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-700"
            >
              <Store className="size-4" aria-hidden="true" />
              {t('nav.home')}
            </a>
          </li>
          <li>
            <a
              href="#categories"
              className="flex items-center gap-1.5 rounded-xl px-3 py-3 text-sm font-bold text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-700"
            >
              <LayoutGrid className="size-4" aria-hidden="true" />
              {t('nav.allCategories')}
            </a>
          </li>

          {categories.map((category) => {
            const Icon = quickIcon[category.icon] ?? LayoutGrid
            const isOpen = openId === category.id
            return (
              <li key={category.id}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-haspopup="true"
                  onMouseEnter={() => handleEnter(category.id)}
                  onFocus={() => handleEnter(category.id)}
                  onClick={() => setOpenId((prev) => (prev === category.id ? null : category.id))}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-3 text-sm font-bold transition-colors ${
                    isOpen ? 'bg-brand-600 text-white' : 'text-ink-700 hover:bg-brand-50 hover:text-brand-700'
                  }`}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {localize(category, 'name')}
                  <ChevronDown
                    className={`size-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                  />
                </button>
              </li>
            )
          })}

          <li>
            <a
              href="#flash"
              className="flex items-center gap-1.5 rounded-xl px-3 py-3 text-sm font-bold text-deal-600 transition-colors hover:bg-deal-50"
            >
              <Flame className="size-4" aria-hidden="true" />
              {t('nav.flash')}
            </a>
          </li>
          <li>
            <a
              href="#students"
              className="flex items-center gap-1.5 rounded-xl px-3 py-3 text-sm font-bold text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-700"
            >
              <Sparkles className="size-4" aria-hidden="true" />
              {t('nav.student')}
            </a>
          </li>
          <li>
            <a
              href="#brands"
              className="flex items-center gap-1.5 rounded-xl px-3 py-3 text-sm font-bold text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-700"
            >
              <Percent className="size-4" aria-hidden="true" />
              {t('nav.brands')}
            </a>
          </li>
        </ul>
      </nav>

      {active && (
        <div
          className="absolute inset-x-0 top-full hidden lg:block"
          onMouseEnter={() => handleEnter(active.id)}
        >
          <div className="container-x pt-1">
            <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-lift">
              <div className="grid grid-cols-12 gap-6 p-6">
                <div className="col-span-3">
                  <div className="overflow-hidden rounded-2xl bg-gradient-to-br p-4 text-white">
                    <ProductArt
                      kind={active.art}
                      palette={active.palette}
                      className="aspect-4/3 w-full rounded-xl object-cover"
                    />
                    <p className="mt-3 text-sm font-extrabold">{localize(active, 'featured')}</p>
                    <p className="mt-1 text-xs text-white/80">{localize(active, 'desc')}</p>
                    <button
                      type="button"
                      onClick={() => {
                        onNavigate(active.id, '')
                        setOpenId(null)
                      }}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-white/25"
                    >
                      {t('categories.browse')}
                    </button>
                  </div>
                </div>

                <div className="col-span-6 grid grid-cols-3 gap-5">
                  {(active.groups ?? []).map((group) => (
                    <CategoryColumn
                      key={group.title.en}
                      group={{ ...group, categoryId: active.id }}
                      localize={localize}
                      onNavigate={(id, text) => {
                        onNavigate(id, text)
                        setOpenId(null)
                      }}
                      query={query}
                    />
                  ))}
                </div>

                <div className="col-span-3 border-s border-ink-100 ps-5">
                  <h4 className="mb-3 text-[13px] font-extrabold text-ink-900">{t('nav.quickLinks')}</h4>
                  <ul className="space-y-1">
                    {quickLinks.map((link) => {
                      const Icon = quickIcon[link.icon] ?? Store
                      return (
                        <li key={link.id}>
                          <a
                            href={link.href}
                            onClick={() => setOpenId(null)}
                            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] font-medium text-ink-600 transition-colors hover:bg-deal-50 hover:text-deal-600"
                          >
                            <Icon className="size-4 text-ink-400" aria-hidden="true" />
                            {localize(link, 'label')}
                          </a>
                        </li>
                      )
                    })}
                  </ul>
                  <button
                    type="button"
                    onClick={() => {
                      onQuote()
                      setOpenId(null)
                    }}
                    className="btn-quote mt-4 py-2.5"
                  >
                    <FileText className="size-4" aria-hidden="true" />
                    {t('product.requestQuote')}
                  </button>
                  <p className="mt-2 text-[11px] text-ink-400">{t('product.bulkNote')}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 bg-ink-50/70 px-6 py-3">
                <span className="text-xs font-bold text-ink-500">{t('nav.megaTitle')}</span>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onMouseEnter={() => handleEnter(category.id)}
                      onClick={() => {
                        onNavigate(category.id, '')
                        setOpenId(null)
                      }}
                      className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-ink-600 shadow-sm transition-colors hover:bg-brand-600 hover:text-white"
                    >
                      {localize(category, 'name')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
