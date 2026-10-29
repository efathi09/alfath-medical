import { useData } from '../../context/DataContext.jsx'
import { useLang, useLocalizer } from '../../context/LanguageContext.jsx'
import { useAppNav } from '../nav.jsx'
import ProductArt from '../../components/ProductArt.jsx'

export default function CategoriesScreen() {
  const { t } = useLang()
  const localize = useLocalizer()
  const { categories, products } = useData()
  const nav = useAppNav()

  return (
    <div className="space-y-3 p-4">
      <h2 className="text-[15px] font-extrabold text-ink-900">{t('categories.title')}</h2>
      {categories.map((category) => {
        const count = products.filter((p) => p.category === category.id).length
        return (
          <button
            key={category.id}
            type="button"
            onClick={() => nav.push({ name: 'category', params: { id: category.id } })}
            className="flex w-full items-center gap-3 rounded-2xl bg-white p-3 text-start shadow-soft active:scale-[0.99]"
          >
            <ProductArt kind={category.art} palette="sky" className="size-16 shrink-0 rounded-xl" />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-extrabold text-ink-900">{localize(category, 'name')}</span>
              <span className="mt-0.5 block line-clamp-2 text-[11px] text-ink-500">{localize(category, 'desc')}</span>
              <span className="mt-1 block text-[11px] font-bold text-app-600">
                <span className="num">{count}</span> {t('categories.items')}
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
