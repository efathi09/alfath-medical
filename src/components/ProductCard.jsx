import { useState } from 'react'
import {
  BadgePercent,
  Check,
  FileText,
  Flame,
  Heart,
  Package,
  ShoppingCart,
  Sparkles,
  Truck,
} from 'lucide-react'
import { useLang, useLocalizer } from '../context/LanguageContext.jsx'
import { useStore } from '../context/StoreContext.jsx'
import { discountPercent } from '../data/products.js'
import ProductArt from './ProductArt.jsx'
import { PriceTag, Rating } from './ui/Rating.jsx'

function BadgeChip({ kind, t }) {
  if (kind === 'bestSeller') {
    return (
      <span className="chip bg-ink-900 text-white">
        <Flame className="size-3.5 text-deal-400" aria-hidden="true" />
        {t('product.bestSeller')}
      </span>
    )
  }
  if (kind === 'new') {
    return (
      <span className="chip bg-brand-600 text-white">
        <Sparkles className="size-3.5" aria-hidden="true" />
        {t('product.new')}
      </span>
    )
  }
  return (
    <span className="chip bg-deal-500 text-white">
      <BadgePercent className="size-3.5" aria-hidden="true" />
      {t('product.offer')}
    </span>
  )
}

export default function ProductCard({ product, onQuote, className = '' }) {
  const { t } = useLang()
  const localize = useLocalizer()
  const { addToCart, notify } = useStore()
  const [justAdded, setJustAdded] = useState(false)
  const [liked, setLiked] = useState(false)

  const discount = discountPercent(product)
  const name = localize(product, 'name')
  const lowStock = product.stock <= 12

  function handleAdd() {
    addToCart(product)
    notify(t('toast.addedToCart'))
    setJustAdded(true)
    window.setTimeout(() => setJustAdded(false), 1600)
  }

  function handleQuote() {
    onQuote?.(product)
  }

  return (
    <article
      className={`group card relative flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift ${className}`}
    >
      <div className="relative aspect-4/3 overflow-hidden bg-ink-50">
        <ProductArt
          kind={product.art}
          palette={product.palette}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <div className="flex flex-col items-start gap-1.5">
            {discount > 0 && (
              <span className="chip bg-deal-500 py-1 text-white shadow-soft">
                <span className="num">{discount}%</span>
                <span className="sr-only">{t('product.offer')}</span>
              </span>
            )}
            {product.badges.slice(0, 1).map((kind) => (
              <BadgeChip key={kind} kind={kind} t={t} />
            ))}
          </div>

          <button
            type="button"
            onClick={() => setLiked((prev) => !prev)}
            aria-pressed={liked}
            aria-label={t('header.wishlist')}
            className={`grid size-8 place-items-center rounded-full border border-white/70 bg-white/85 backdrop-blur transition-colors ${
              liked ? 'text-rose-500' : 'text-ink-400 hover:text-rose-500'
            }`}
          >
            <Heart className={`size-4 ${liked ? 'fill-rose-500' : ''}`} aria-hidden="true" />
          </button>
        </div>

        <span className="absolute bottom-3 start-3 chip bg-white/90 text-ink-600 backdrop-blur">
          <Package className="size-3.5" aria-hidden="true" />
          {localize(product.unit)} · {t('product.minOrder')} <span className="num">{product.minOrder}</span>
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="ltr-nums text-[11px] font-bold tracking-wider text-brand-600 uppercase">
            {product.brand}
          </span>
          <span className="ltr-nums text-[11px] text-ink-400">{product.sku}</span>
        </div>

        <h3 className="line-clamp-2 min-h-11 text-[15px] leading-6 font-bold text-ink-900">{name}</h3>

        <Rating value={product.rating} reviews={product.reviews} />

        <div className="mt-auto space-y-1">
          <PriceTag price={product.price} oldPrice={product.oldPrice} />
          <p className="text-[11px] text-ink-400">
            {t('product.perUnit')} · {localize(product.unit)}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2 text-[11px]">
          <span
            className={`inline-flex items-center gap-1 font-bold ${
              product.stock > 0 ? 'text-brand-600' : 'text-rose-600'
            }`}
          >
            <span
              className={`size-1.5 rounded-full ${
                product.stock > 0 ? (lowStock ? 'bg-deal-500' : 'bg-brand-500') : 'bg-rose-500'
              }`}
              aria-hidden="true"
            />
            {product.stock > 0 ? (lowStock ? t('product.lowStock') : t('product.inStock')) : t('product.outOfStock')}
          </span>
          {product.price < 500 && (
            <span className="inline-flex items-center gap-1 text-ink-400">
              <Truck className="size-3.5" aria-hidden="true" />
              {t('product.shipping')}
            </span>
          )}
        </div>

        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={handleAdd}
            disabled={product.stock === 0}
            className={`btn w-full py-2.5 ${
              justAdded ? 'bg-brand-500 text-white' : 'btn-primary'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="size-4" aria-hidden="true" />
                {t('product.added')}
              </>
            ) : (
              <>
                <ShoppingCart className="size-4" aria-hidden="true" />
                {t('product.addToCart')}
              </>
            )}
          </button>

          <button type="button" onClick={handleQuote} className="btn-quote py-2.5">
            <FileText className="size-4" aria-hidden="true" />
            {t('product.requestQuote')}
          </button>
        </div>
      </div>
    </article>
  )
}
