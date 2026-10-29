import { Heart } from 'lucide-react'
import { useData } from '../../context/DataContext.jsx'
import { useLang } from '../../context/LanguageContext.jsx'
import { useStore } from '../../context/StoreContext.jsx'
import { useAppNav } from '../nav.jsx'
import ProductTile from '../ProductTile.jsx'

export default function FavoritesScreen() {
  const { t } = useLang()
  const { products } = useData()
  const { favorites } = useStore()
  const nav = useAppNav()

  const list = products.filter((p) => favorites.includes(p.id))

  if (list.length === 0) {
    return (
      <div className="grid place-items-center gap-3 p-8 pt-20 text-center">
        <span className="grid size-16 place-items-center rounded-full bg-white text-rose-300 shadow-soft">
          <Heart className="size-8" aria-hidden="true" />
        </span>
        <p className="text-sm font-bold text-ink-600">{t('favorites.empty')}</p>
        <button
          type="button"
          onClick={() => nav.go('home')}
          className="rounded-xl bg-app-600 px-6 py-2.5 text-sm font-bold text-white active:scale-95"
        >
          {t('cart.continueShopping')}
        </button>
      </div>
    )
  }

  return (
    <div className="p-4">
      <h2 className="mb-3 text-[15px] font-extrabold text-ink-900">
        {t('header.wishlist')} <span className="text-ink-400">(<span className="num">{list.length}</span>)</span>
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {list.map((product) => (
          <ProductTile
            key={product.id}
            product={product}
            onOpen={(p) => nav.push({ name: 'product', params: { id: p.id } })}
          />
        ))}
      </div>
    </div>
  )
}
