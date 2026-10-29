import { Heart, Plus, Star } from 'lucide-react'
import { useLang, useLocalizer } from '../context/LanguageContext.jsx'
import { useStore } from '../context/StoreContext.jsx'
import ProductArt from '../components/ProductArt.jsx'
import { formatPrice } from '../components/ui/Logo.jsx'

export default function ProductTile({ product, onOpen }) {
  const { t, lang } = useLang()
  const localize = useLocalizer()
  const { addToCart, notify, isFavorite, toggleFavorite } = useStore()

  const name = localize(product, 'name')
  const liked = isFavorite(product.id)
  const discount = product.oldPrice > product.price ? Math.round((1 - product.price / product.oldPrice) * 100) : 0

  function handleAdd(event) {
    event.stopPropagation()
    addToCart(product)
    notify(t('toast.addedToCart'))
  }

  return (
    <article className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft">
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation()
          toggleFavorite(product.id)
          notify(liked ? t('toast.removed') : t('toast.addedToFavorites'), 'info')
        }}
        aria-pressed={liked}
        aria-label={t('header.wishlist')}
        className={`app-icon-button absolute z-10 end-2 top-2 ${
          liked ? 'text-rose-500' : 'text-ink-400'
        }`}
      >
        <Heart className={`size-4 ${liked ? 'fill-rose-500' : ''}`} aria-hidden="true" />
      </button>

      <button type="button" onClick={() => onOpen(product)} className="block w-full text-start">
        <div className="relative">
          {discount > 0 && (
            <span className="absolute z-10 rounded-bl-xl rounded-tr-2xl bg-rose-500 px-2 py-1 text-[10px] font-extrabold text-white start-0 top-0">
              <span className="num">{discount}</span>% -
            </span>
          )}
          <ProductArt kind={product.art} palette={product.palette} className="aspect-square w-full" />
        </div>

        <div className="flex min-h-30 flex-col gap-1.5 p-3 pb-0">
          <p className="truncate ltr-nums text-[10px] font-bold tracking-wide text-app-600 uppercase">{product.brand}</p>
          <h3 className="line-clamp-2 min-h-10 text-[13px] leading-5 font-bold text-ink-900">{name}</h3>
          <div className="mt-auto flex items-center gap-1 text-[11px] text-ink-500">
            <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
            <span className="num font-bold text-ink-700">{Number(product.rating || 0).toFixed(1)}</span>
            <span className="text-ink-300">·</span>
            <span>{product.stock > 0 ? t('product.inStock') : t('product.outOfStock')}</span>
          </div>
        </div>
      </button>

      <div className="mt-auto flex min-h-16 items-center justify-between gap-2 p-3 pt-2">
        <div className="leading-tight">
          <p className="text-[15px] font-extrabold text-app-700">{formatPrice(product.price, lang)}</p>
          {product.oldPrice > product.price && (
            <p className="text-[11px] text-ink-400 line-through">{formatPrice(product.oldPrice, lang)}</p>
          )}
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={product.stock === 0}
          aria-label={t('product.addToCart')}
          className="grid size-11 shrink-0 place-items-center rounded-full bg-app-600 text-white shadow-soft transition-transform active:scale-95 disabled:opacity-50"
        >
          <Plus className="size-5" aria-hidden="true" />
        </button>
      </div>
    </article>
  )
}
