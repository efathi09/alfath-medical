import { useState } from 'react'
import { ChevronRight, Phone, Search, ShoppingBag } from 'lucide-react'
import { useLang } from '../context/LanguageContext.jsx'
import { useStore } from '../context/StoreContext.jsx'
import { company } from '../data/company.js'

export default function AppBar({ showBack = false, onBack, onSearch, onCart }) {
  const { t } = useLang()
  const { cartCount } = useStore()
  const [logoFailed, setLogoFailed] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/95 pt-safe text-ink-900 shadow-sm backdrop-blur">
      <div className="flex min-h-16 items-center gap-2 px-4 py-2">
        {showBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label={t('common.close')}
            className="app-icon-button"
          >
            <ChevronRight className="size-5" aria-hidden="true" />
          </button>
        )}

        {/* Brand logo on every page, drawn straight on the white bar (no pill). */}
        {logoFailed ? (
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-app-600 text-base font-extrabold text-white">
            ف
          </span>
        ) : (
          <img
            src={company.logoMark}
            alt={t(company.nameKey)}
            className="h-11 w-auto shrink-0 object-contain"
            onError={() => setLogoFailed(true)}
          />
        )}

        {/* Spacer keeps the search + cart pinned to the end (RTL: left side). */}
        <div className="min-w-0 flex-1" />

        <button
          type="button"
          onClick={onSearch}
          aria-label={t('header.searchButton')}
          className="app-icon-button"
        >
          <Search className="size-5" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={onCart}
          aria-label={t('header.cart')}
          className="app-icon-button relative"
        >
          <ShoppingBag className="size-5" aria-hidden="true" />
          {cartCount > 0 && (
            <span className="num absolute -end-1 -top-1 grid min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[10px] leading-5 font-extrabold text-white">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}

export function CallBar() {
  return (
    <a
      href={company.phoneHref}
      className="flex items-center justify-center gap-2 bg-app-50 py-2 text-xs font-bold text-app-700"
    >
      <Phone className="size-3.5" aria-hidden="true" />
      خدمة العملاء: <span className="ltr-nums">{company.phone}</span>
    </a>
  )
}
