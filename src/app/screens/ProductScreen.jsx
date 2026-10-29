import { Check, FileText, Heart, Minus, Package, Plus, ShieldCheck, ShoppingCart, Truck } from 'lucide-react'
import { useState } from 'react'
import { useData } from '../../context/DataContext.jsx'
import { useLang, useLocalizer } from '../../context/LanguageContext.jsx'
import { useStore } from '../../context/StoreContext.jsx'
import { useAppNav } from '../nav.jsx'
import ProductArt from '../../components/ProductArt.jsx'
import { PriceTag, Rating } from '../../components/ui/Rating.jsx'

export default function ProductScreen() {
  const { t } = useLang()
  const localize = useLocalizer()
  const { products } = useData()
  const { addToCart, notify, openQuote, setCartOpen, isFavorite, toggleFavorite } = useStore()
  const nav = useAppNav()
  const product = products.find((p) => p.id === nav.current.params?.id)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  if (!product) return null

  const liked = isFavorite(product.id)

  function handleAdd() {
    addToCart(product, qty)
    notify(t('toast.addedToCart'))
    setAdded(true)
    setCartOpen(true)
    window.setTimeout(() => setAdded(false), 1600)
  }

  return (
    <div className="pb-6">
      <div className="relative bg-white">
        <ProductArt kind={product.art} palette={product.palette} className="aspect-[4/3] w-full" />
        <button
          type="button"
          onClick={() => {
            toggleFavorite(product.id)
            notify(liked ? t('toast.removed') : t('toast.addedToFavorites'), 'info')
          }}
          aria-pressed={liked}
          aria-label={t('header.wishlist')}
          className={`absolute end-4 top-4 grid size-10 place-items-center rounded-full bg-white/90 shadow-soft backdrop-blur ${
            liked ? 'text-rose-500' : 'text-ink-500'
          }`}
        >
          <Heart className={`size-5 ${liked ? 'fill-rose-500' : ''}`} aria-hidden="true" />
        </button>
      </div>

      <div className="space-y-4 p-4">
        <div className="rounded-2xl bg-white p-4 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="ltr-nums text-[11px] font-bold tracking-wide text-app-500 uppercase">{product.brand}</span>
            <span className="ltr-nums text-[11px] text-ink-400">{product.sku}</span>
          </div>
          <h1 className="mt-1 text-base leading-6 font-extrabold text-ink-900">{localize(product, 'name')}</h1>
          <div className="mt-2">
            <Rating value={product.rating} reviews={product.reviews} />
          </div>

          <div className="mt-3 flex items-end justify-between">
            <PriceTag price={product.price} oldPrice={product.oldPrice} size="lg" />
            <span
              className={`chip ${
                product.stock === 0
                  ? 'bg-rose-50 text-rose-600'
                  : product.stock <= 12
                    ? 'bg-amber-50 text-deal-600'
                    : 'bg-app-50 text-app-700'
              }`}
            >
              {product.stock === 0 ? t('product.outOfStock') : product.stock <= 12 ? t('product.lowStock') : t('product.inStock')}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-ink-500">
            <span className="chip bg-ink-100 text-ink-600">
              <Package className="size-3.5" aria-hidden="true" />
              {localize(product.unit)}
            </span>
            <span className="chip bg-ink-100 text-ink-600">
              {t('product.minOrder')} <span className="num">{product.minOrder}</span>
            </span>
            <span className="chip bg-ink-100 text-ink-600">
              <Truck className="size-3.5" aria-hidden="true" />
              {t('product.shipping')}
            </span>
            <span className="chip bg-ink-100 text-ink-600">
              <ShieldCheck className="size-3.5" aria-hidden="true" />
              {t('features.warranty')}
            </span>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-soft">
          <p className="text-xs leading-6 text-ink-600">{t('product.bulkNote')}</p>
        </div>

        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setQty((v) => Math.max(1, v - 1))}
            className="grid size-10 place-items-center rounded-full bg-white text-ink-700 shadow-soft active:scale-95"
            aria-label="-"
          >
            <Minus className="size-4" aria-hidden="true" />
          </button>
          <span className="num w-10 text-center text-lg font-extrabold text-ink-900">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((v) => Math.min(99, v + 1))}
            className="grid size-10 place-items-center rounded-full bg-white text-ink-700 shadow-soft active:scale-95"
            aria-label="+"
          >
            <Plus className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-ink-100 bg-white/95 p-3 pb-safe backdrop-blur">
        <button
          type="button"
          onClick={() => openQuote(product, qty)}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-dashed border-app-300 bg-app-50 py-3 text-sm font-bold text-app-700 active:scale-[0.98]"
        >
          <FileText className="size-4" aria-hidden="true" />
          {t('product.requestQuote')}
        </button>
        <button
          type="button"
          onClick={handleAdd}
          disabled={product.stock === 0}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white active:scale-[0.98] disabled:opacity-50 ${
            added ? 'bg-emerald-500' : 'bg-app-600'
          }`}
        >
          {added ? <Check className="size-4" aria-hidden="true" /> : <ShoppingCart className="size-4" aria-hidden="true" />}
          {added ? t('product.added') : t('product.addToCart')}
        </button>
      </div>
    </div>
  )
}
