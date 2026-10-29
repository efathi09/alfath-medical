import { useEffect, useMemo, useState } from 'react'
import { GraduationCap, Headset, Percent, Search, ShieldCheck, SlidersHorizontal, Truck, Zap } from 'lucide-react'
import { useData } from '../../context/DataContext.jsx'
import { useLang, useLocalizer } from '../../context/LanguageContext.jsx'
import { useAppNav } from '../nav.jsx'
import { discountPercent } from '../../data/products.js'
import ProductArt from '../../components/ProductArt.jsx'
import ProductTile from '../ProductTile.jsx'

const FEATURES = [
  { icon: Truck, key: 'features.shipping' },
  { icon: ShieldCheck, key: 'features.warranty' },
  { icon: Headset, key: 'features.support' },
  { icon: Percent, key: 'features.bulk' },
]

export default function HomeScreen() {
  const { t } = useLang()
  const localize = useLocalizer()
  const { products, categories, settings } = useData()
  const nav = useAppNav()

  const banners = useMemo(() => {
    const list = (settings?.banners ?? []).filter((b) => b.isActive !== false)
    return list.length ? list : []
  }, [settings])

  const deals = useMemo(
    () => products.filter((p) => p.oldPrice > p.price).sort((a, b) => discountPercent(b) - discountPercent(a)).slice(0, 8),
    [products],
  )

  const best = useMemo(() => {
    const flagged = products.filter((p) => (p.badges ?? []).includes('bestSeller'))
    return (flagged.length ? flagged : products).slice(0, 8)
  }, [products])

  return (
    <div className="space-y-6 pb-6">
      <BannerCarousel banners={banners} />

      <section className="-mt-2 flex items-center gap-2 px-4">
        <button
          type="button"
          onClick={nav.openSearch}
          aria-label={t('header.searchButton')}
          className="app-search flex-1 text-start active:scale-[0.99]"
        >
          <Search className="size-4 shrink-0 text-app-600" aria-hidden="true" />
          <span className="truncate">{t('header.searchPlaceholder')}</span>
        </button>
        <button
          type="button"
          onClick={() => nav.push({ name: 'list', params: { titleKey: 'nav.allProducts' } })}
          className="app-action"
        >
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          {t('nav.allProducts')}
        </button>
      </section>

      <section className="px-4">
        <div className="grid grid-cols-4 gap-2">
          {categories.slice(0, 4).map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => nav.push({ name: 'category', params: { id: category.id } })}
              className="flex flex-col items-center gap-2 rounded-2xl bg-white p-2.5 shadow-soft active:scale-95"
            >
              <span className="grid size-12 place-items-center overflow-hidden rounded-xl bg-app-50">
                <ProductArt kind={category.art} palette="sky" className="size-full" />
              </span>
              <span className="line-clamp-2 text-center text-[10px] leading-[14px] font-bold text-ink-700">
                {localize(category, 'name')}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-2 px-4">
        {FEATURES.map(({ icon, key }) => {
          const Icon = icon
          return (
            <div key={key} className="flex items-center gap-2 rounded-xl bg-app-50 px-3 py-2 text-[11px] font-bold text-app-800">
              <Icon className="size-4 shrink-0 text-app-600" aria-hidden="true" />
              {t(key)}
            </div>
          )
        })}
      </section>

      {deals.length > 0 && (
        <section>
          <div className="flex items-center justify-between px-4 pb-3">
            <h2 className="flex items-center gap-2 text-[15px] font-extrabold text-ink-900">
              <Zap className="size-4 text-rose-500" aria-hidden="true" />
              {t('flash.title')}
            </h2>
            <button
              type="button"
              onClick={() => nav.push({ name: 'list', params: { mode: 'offers', titleKey: 'flash.title' } })}
              className="flex items-center gap-1 text-xs font-bold text-app-600"
            >
              {t('nav.viewAll')}
            </button>
          </div>
          <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-1">
            {deals.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => nav.push({ name: 'product', params: { id: product.id } })}
                className="w-40 shrink-0 overflow-hidden rounded-2xl bg-white text-start shadow-soft active:scale-95"
              >
                <div className="relative">
                  <span className="absolute z-10 rounded-bl-xl rounded-tr-2xl bg-rose-500 px-2 py-0.5 text-[10px] font-extrabold text-white start-0 top-0">
                    <span className="num">{discountPercent(product)}</span>% -
                  </span>
                  <ProductArt kind={product.art} palette={product.palette} className="aspect-[4/3] w-full" />
                </div>
                <div className="space-y-1 p-2.5">
                  <p className="line-clamp-2 min-h-9 text-[12px] leading-[18px] font-bold text-ink-900">
                    {localize(product, 'name')}
                  </p>
                  <p className="text-[13px] font-extrabold text-app-700">
                    {product.price} <span className="text-[10px] font-bold">ج.م</span>
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between px-4">
          <h2 className="flex items-center gap-2 text-[15px] font-extrabold text-ink-900">
            <Zap className="size-4 text-app-500" aria-hidden="true" />
            {t('bestsellers.title')}
          </h2>
          <button
            type="button"
            onClick={() => nav.push({ name: 'list', params: { mode: 'bestsellers', titleKey: 'bestsellers.title' } })}
            className="flex items-center gap-1 text-xs font-bold text-app-600"
          >
            {t('nav.viewAll')}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 px-4 pt-3">
          {best.map((product) => (
            <ProductTile key={product.id} product={product} onOpen={(p) => nav.push({ name: 'product', params: { id: p.id } })} />
          ))}
        </div>
      </section>

      <section className="px-4">
        <button
          type="button"
          onClick={() => nav.push({ name: 'list', params: { category: 'student', titleKey: 'student.title' } })}
          className="flex w-full items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-l from-app-700 to-app-500 p-4 text-start text-white shadow-soft"
        >
          <GraduationCap className="size-9 shrink-0" aria-hidden="true" />
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-extrabold">{t('nav.student')}</span>
            <span className="block truncate text-[11px] text-app-100">{t('student.subtitle')}</span>
          </span>
        </button>
      </section>
    </div>
  )
}

function BannerCarousel({ banners }) {
  const { t } = useLang()
  const [index, setIndex] = useState(0)
  const count = banners.length

  useEffect(() => {
    if (count < 2) return undefined
    const timer = window.setInterval(() => setIndex((prev) => (prev + 1) % count), 5000)
    return () => window.clearInterval(timer)
  }, [count])

  if (!count) return null

  return (
    <section className="px-4 pt-4">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-app-800 to-app-500 p-5 text-white shadow-lift">
        <div className="absolute -end-6 -top-6 size-28 rounded-full bg-white/10" aria-hidden="true" />
        <div className="relative flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold text-app-100">{t('hero.slide1Cta')}</p>
            <h2 className="mt-1 line-clamp-2 text-lg leading-6 font-extrabold">
              {t(banners[index].titleKey)}
            </h2>
            <p className="mt-2 line-clamp-2 text-xs text-app-100">{t(banners[index].subKey)}</p>
          </div>
          <ProductArt
            kind={banners[index].art ?? 'device'}
            palette={banners[index].palette ?? 'sky'}
            className="size-24 shrink-0 rounded-2xl shadow-soft"
          />
        </div>
        <div className="mt-4 flex items-center gap-1.5">
          {banners.map((banner, i) => (
            <button
              key={banner.id ?? i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`${t('hero.goTo')} ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${i === index ? 'w-5 bg-white' : 'w-1.5 bg-white/50'}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
