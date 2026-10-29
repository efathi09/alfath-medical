import { useEffect } from 'react'
import { ShoppingBag, X } from 'lucide-react'
import { useLang } from '../context/LanguageContext.jsx'
import { useStore } from '../context/StoreContext.jsx'
import CheckoutForm from './CheckoutForm.jsx'

/**
 * Storefront checkout. The site has no router, so checkout opens as an overlay
 * instead of a route — it renders exactly the same form the mobile app uses.
 */
export default function CheckoutModal() {
  const { t } = useLang()
  const { checkoutOpen, closeCheckout, cartCount } = useStore()
  const open = Boolean(checkoutOpen)

  useEffect(() => {
    if (!open) return undefined
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    function onKey(event) {
      if (event.key === 'Escape') closeCheckout()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      document.removeEventListener('keydown', onKey)
    }
  }, [open, closeCheckout])

  function handleDone() {
    closeCheckout()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-95 bg-ink-950/60 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={closeCheckout}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
        aria-hidden={!open}
        className={`fixed inset-x-0 bottom-0 z-100 mx-auto flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-ink-50 shadow-lift transition-all duration-300 sm:inset-0 sm:max-h-[88vh] sm:rounded-3xl ${
          open
            ? 'visible translate-y-0 opacity-100'
            : 'invisible translate-y-full opacity-0 sm:translate-y-8 sm:scale-95'
        }`}
      >
        <header className="flex items-start justify-between gap-4 bg-gradient-to-br from-app-600 to-app-800 px-5 py-4 text-white sm:px-6">
          <div className="min-w-0 flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/15">
              <ShoppingBag className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 id="checkout-title" className="text-lg font-extrabold">
                {t('checkout.title')}
              </h2>
              <p className="mt-0.5 truncate text-xs text-white/85 sm:text-sm">{t('checkout.subtitle')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeCheckout}
            className="grid size-9 shrink-0 place-items-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/30"
            aria-label={t('checkout.close')}
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
          <CheckoutForm variant="modal" onDone={handleDone} />
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-ink-100 bg-white px-5 py-3 text-xs text-ink-500 sm:px-6">
          <span>
            {t('cart.items')}: <span className="num font-extrabold text-ink-800">{cartCount}</span>
          </span>
          <button
            type="button"
            onClick={closeCheckout}
            className="font-bold text-app-700 transition-colors hover:text-app-800"
          >
            {t('cart.continueShopping')}
          </button>
        </footer>
      </div>
    </>
  )
}
