import { useMemo } from 'react'
import { Zap } from 'lucide-react'
import { useData } from '../../context/DataContext.jsx'
import { useLang } from '../../context/LanguageContext.jsx'
import { useAppNav } from '../nav.jsx'
import { discountPercent } from '../../data/products.js'
import ProductTile from '../ProductTile.jsx'

export default function OffersScreen() {
  const { t } = useLang()
  const { products } = useData()
  const nav = useAppNav()

  const deals = useMemo(
    () => products.filter((p) => p.oldPrice > p.price).sort((a, b) => discountPercent(b) - discountPercent(a)),
    [products],
  )

  return (
    <div className="space-y-4 pb-6">
      <section className="bg-gradient-to-l from-app-800 to-app-500 p-5 pt-safe text-white">
        <div className="flex items-center gap-2">
          <Zap className="size-5 fill-amber-300 text-amber-300" aria-hidden="true" />
          <h2 className="text-lg font-extrabold">{t('flash.title')}</h2>
        </div>
        <p className="mt-1 text-xs text-app-100">{t('flash.subtitle')}</p>
      </section>

      <div className="grid grid-cols-2 gap-3 px-4">
        {deals.map((product) => (
          <ProductTile key={product.id} product={product} onOpen={(p) => nav.push({ name: 'product', params: { id: p.id } })} />
        ))}
      </div>
    </div>
  )
}
