import { useMemo, useState } from 'react'
import { FileText, Flame, ShoppingCart, Zap } from 'lucide-react'
import { useLang, useLocalizer } from '../context/LanguageContext.jsx'
import { useStore } from '../context/StoreContext.jsx'
import { useData } from '../context/DataContext.jsx'
import { getProduct } from '../data/products.js'
import { flashDeadline, flashDeals } from '../data/promos.js'
import ProductArt from './ProductArt.jsx'
import CountdownTimer from './CountdownTimer.jsx'
import { formatPrice } from './ui/Logo.jsx'

export default function FlashSales({ onQuote }) {
  const { t, lang } = useLang()
  const localize = useLocalizer()
  const { addToCart, notify } = useStore()
  const { products, promos } = useData()
  const [expired, setExpired] = useState(false)

  const deadline = useMemo(() => flashDeadline(), [])
  const labels = {
    days: t('flash.days'),
    hours: t('flash.hours'),
    minutes: t('flash.minutes'),
    seconds: t('flash.seconds'),
    ended: t('flash.ended'),
    endsIn: t('flash.endsIn'),
  }

  const deals = useMemo(() => {
    const list = Array.isArray(promos) && promos.length ? promos : flashDeals
    return list
      .map((deal) => {
        const product = getProduct(deal.id, products)
        if (!product) return null
        return {
          ...deal,
          product,
          dealPrice: deal.dealPrice,
          productDiscount: Math.round(
            ((product.oldPrice - deal.dealPrice) / product.oldPrice) * 100,
          ),
          left: Math.max(0, deal.stockTotal - deal.sold),
          soldRatio: Math.min(100, Math.round((deal.sold / deal.stockTotal) * 100)),
        }
      })
      .filter(Boolean)
  }, [products, promos])

  function scrollRow(dir) {
    const track = document.getElementById('flash-track')
    if (!track) return
    track.scrollBy({ left: dir * (track.clientWidth * 0.8), behavior: 'smooth' })
  }

  return (
    <section id="flash" className="relative overflow-hidden bg-ink-950 py-12 text-white sm:py-16">
      <div
        className="pointer-events-none absolute -top-24 -start-24 size-80 rounded-full bg-deal-500/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-32 -end-20 size-96 rounded-full bg-brand-500/20 blur-3xl"
        aria-hidden="true"
      />

      <div className="container-x relative">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-deal-400 to-deal-600 shadow-lift">
              <Flame className="size-7 text-white" aria-hidden="true" />
            </span>
            <div>
              <h2 className="flex items-center gap-2 text-2xl font-extrabold text-white sm:text-3xl">
                {t('flash.title')}
                <Zap className="size-5 text-deal-400" aria-hidden="true" />
              </h2>
              <p className="mt-1 text-sm text-white/60">{t('flash.subtitle')}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <CountdownTimer
              deadline={deadline}
              labels={labels}
              onExpire={() => setExpired(true)}
              className="hidden lg:flex"
            />
            <div className="hidden gap-2 sm:flex">
              <button
                type="button"
                onClick={() => scrollRow(-1)}
                aria-label={t('hero.prev')}
                className="min-h-10 rounded-full border border-white/15 bg-white/5 px-3 text-xs font-bold text-white transition-colors hover:bg-white/15"
              >
                {t('hero.prev')}
              </button>
              <button
                type="button"
                onClick={() => scrollRow(1)}
                aria-label={t('hero.next')}
                className="min-h-10 rounded-full border border-white/15 bg-white/5 px-3 text-xs font-bold text-white transition-colors hover:bg-white/15"
              >
                {t('hero.next')}
              </button>
            </div>
          </div>
        </div>

        <div className="mb-6 lg:hidden">
          <CountdownTimer deadline={deadline} labels={labels} onExpire={() => setExpired(true)} />
        </div>

        {expired && (
          <p className="mb-6 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
            {t('flash.endedMsg')}
          </p>
        )}

        <div
          id="flash-track"
          className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0"
        >
          {deals.map((deal) => {
            const { product } = deal
            return (
              <article
                key={deal.id}
                className="group relative w-[248px] shrink-0 snap-start overflow-hidden rounded-2xl bg-white text-ink-800 shadow-lift transition-transform duration-300 hover:-translate-y-1 sm:w-[272px]"
              >
                <div className="relative aspect-4/3 overflow-hidden bg-ink-50">
                  <ProductArt
                    kind={product.art}
                    palette={product.palette}
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="num absolute top-3 end-3 rounded-xl bg-deal-500 px-2.5 py-1 text-sm font-extrabold text-white shadow-soft">
                    -{deal.productDiscount}%
                  </span>
                  {deal.left <= 60 && (
                    <span className="absolute top-3 start-3 rounded-xl bg-ink-950/85 px-2.5 py-1 text-[11px] font-bold text-white">
                      {t('flash.itemsLeft')}: <span className="num">{deal.left}</span>
                    </span>
                  )}
                </div>

                <div className="space-y-3 p-4">
                  <p className="ltr-nums text-[11px] font-bold tracking-wider text-brand-600 uppercase">
                    {product.brand}
                  </p>
                  <h3 className="line-clamp-2 min-h-11 text-[15px] leading-6 font-bold text-ink-900">
                    {localize(product, 'name')}
                  </h3>

                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-extrabold text-deal-600">
                      {formatPrice(deal.dealPrice, lang)}
                    </span>
                    <span className="pb-1 text-sm text-ink-400 line-through">
                      {formatPrice(product.oldPrice, lang)}
                    </span>
                  </div>

                  <div>
                    <div className="mb-1.5 flex items-center justify-between text-[11px] font-bold">
                      <span className="text-ink-500">
                        {t('flash.sold')} <span className="num">{deal.sold}</span>
                      </span>
                      <span className="text-brand-600">
                        {t('flash.remaining')} <span className="num">{deal.left}</span>
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-ink-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-deal-400 to-deal-600 transition-[width] duration-700"
                        style={{ width: `${deal.soldRatio}%` }}
                        role="progressbar"
                        aria-valuenow={deal.soldRatio}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={t('flash.progress')}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        addToCart(product, 1)
                        notify(t('toast.addedToCart'))
                      }}
                      className="btn-primary flex-1 px-3 py-2.5"
                    >
                      <ShoppingCart className="size-4" aria-hidden="true" />
                      <span className="sr-only sm:not-sr-only">{t('product.addToCart')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onQuote?.(product)}
                      className="btn-quote w-auto px-3 py-2.5"
                      aria-label={t('product.requestQuote')}
                      title={t('product.requestQuote')}
                    >
                      <FileText className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
          <p className="text-xs text-white/50">
            <span className="num">{deals.length}</span> {t('product.resultsCount')}
          </p>
          <a
            href="#bestsellers"
            className="btn border border-white/20 bg-white/10 px-5 py-2.5 text-white hover:bg-white/20"
          >
            {t('flash.viewAll')}
          </a>
        </div>
      </div>
    </section>
  )
}
