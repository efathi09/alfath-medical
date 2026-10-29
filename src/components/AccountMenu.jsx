import { useEffect, useRef, useState } from 'react'
import {
  ChevronDown,
  CircleUser,
  Heart,
  LogIn,
  LogOut,
  MapPin,
  Package,
  Truck,
  UserPlus,
} from 'lucide-react'
import { useLang } from '../context/LanguageContext.jsx'

export default function AccountMenu({ signedIn = false }) {
  const { t } = useLang()
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    function onPointerDown(event) {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) setOpen(false)
    }
    function onKey(event) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const items = signedIn
    ? [
        { icon: Package, label: t('header.myOrders') },
        { icon: Heart, label: t('header.wishlist') },
        { icon: MapPin, label: t('header.addresses') },
        { icon: LogOut, label: t('header.logout'), tone: 'danger' },
      ]
    : [
        { icon: UserPlus, label: t('header.register') },
        { icon: Truck, label: t('nav.trackOrder') },
      ]

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="btn-ghost h-10 gap-1.5 px-2 sm:px-3"
      >
        <CircleUser className="size-5 text-brand-600" aria-hidden="true" />
        <span className="hidden text-xs font-bold lg:inline">{t('header.account')}</span>
        <ChevronDown
          className={`hidden size-3.5 transition-transform duration-200 sm:block ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute end-0 top-[calc(100%+10px)] z-50 w-64 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-lift"
        >
          <div className="flex items-center gap-3 bg-gradient-to-br from-brand-600 to-brand-800 px-4 py-4 text-white">
            <span className="grid size-10 place-items-center rounded-full bg-white/20">
              <CircleUser className="size-5" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-extrabold">
                {signedIn ? t('header.account') : t('header.login')}
              </span>
              <span className="block text-[11px] text-white/70">
                {signedIn ? t('nav.customerService') : t('nav.help')}
              </span>
            </span>
          </div>

          <div className="p-2">
            {items.map((item) => (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                onClick={() => setOpen(false)}
                className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-start text-[13px] font-bold transition-colors ${
                  item.tone === 'danger'
                    ? 'text-rose-600 hover:bg-rose-50'
                    : 'text-ink-700 hover:bg-brand-50 hover:text-brand-700'
                }`}
              >
                <item.icon className="size-4 shrink-0" aria-hidden="true" />
                {item.label}
              </button>
            ))}
          </div>

          {!signedIn && (
            <div className="border-t border-ink-100 p-2">
              <button
                type="button"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="btn-primary w-full py-2.5"
              >
                <LogIn className="size-4" aria-hidden="true" />
                {t('header.login')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
