import { Home, LayoutGrid, Percent, ShoppingBag, User } from 'lucide-react'
import { useLang } from '../context/LanguageContext.jsx'
import { useStore } from '../context/StoreContext.jsx'

const TABS = [
  { id: 'home', icon: Home, label: 'nav.home' },
  { id: 'categories', icon: LayoutGrid, label: 'nav.categories' },
  { id: 'offers', icon: Percent, label: 'nav.offers' },
  { id: 'cart', icon: ShoppingBag, label: 'header.cart' },
  { id: 'account', icon: User, label: 'header.account' },
]

export default function TabBar({ active, onChange }) {
  const { t } = useLang()
  const { cartCount } = useStore()

  return (
    <nav className="sticky bottom-0 z-40 border-t border-ink-100 bg-white/95 pb-safe backdrop-blur">
      <ul className="grid grid-cols-5">
        {TABS.map(({ id, icon, label }) => {
          const Icon = icon
          const isActive = active === id
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onChange(id)}
                className={`relative flex min-h-16 w-full flex-col items-center justify-center gap-1 py-2 text-[10px] font-bold transition-colors ${
                  isActive ? 'text-app-600' : 'text-ink-400'
                }`}
              >
                <span className="relative">
                  <Icon className="size-6" aria-hidden="true" />
                  {id === 'cart' && cartCount > 0 && (
                    <span className="num absolute -end-2 -top-1.5 grid min-w-[18px] place-items-center rounded-full bg-rose-500 px-1 text-[9px] leading-4 font-extrabold text-white">
                      {cartCount}
                    </span>
                  )}
                </span>
                <span>{t(label)}</span>
                {isActive && <span className="absolute -top-px h-0.5 w-8 rounded-full bg-app-600" />}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
