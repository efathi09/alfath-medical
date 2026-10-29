import { useEffect } from 'react'
import {
  Minus,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Trash2,
  Truck,
  X,
} from 'lucide-react'
import { useLang, useLocalizer } from '../context/LanguageContext.jsx'
import { useStore } from '../context/StoreContext.jsx'
import ProductArt from './ProductArt.jsx'
import { formatPrice } from './ui/Logo.jsx'

export default function CartDrawer() {
  const { t, lang } = useLang()
  const localize = useLocalizer()
  const {
    cart,
    cartCount,
    totals,
    cartOpen,
    setCartOpen,
    setQty,
    removeFromCart,
    clearCart,
    openQuote,
    openCheckout,
    notify,
  } = useStore()

  useEffect(() => {
    if (!cartOpen) return undefined
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    function onKey(event) {
      if (event.key === 'Escape') setCartOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      document.removeEventListener('keydown', onKey)
    }
  }, [cartOpen, setCartOpen])

  const hint = t('cart.freeShippingHint').replace('{amount}', formatPrice(totals.remainingForFreeShipping, lang))

  return (
    <>
      <div
        className={`fixed inset-0 z-80 bg-ink-950/50 backdrop-blur-sm transition-opacity duration-300 ${
          cartOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setCartOpen(false)}
        aria-hidden="true"
      />
      <aside
        className={`fixed inset-y-0 end-0 z-90 flex w-[92%] max-w-md flex-col bg-white shadow-lift transition-transform duration-300 ${
          cartOpen ? 'translate-x-0' : 'ltr:translate-x-full rtl:-translate-x-full'
        }`}
        aria-hidden={!cartOpen}
        aria-label={t('cart.title')}
      >
        <header className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <h2 className="flex items-center gap-2 text-lg font-extrabold">
            <ShoppingCart className="size-5 text-brand-600" aria-hidden="true" />
            {t('cart.title')}
            {cartCount > 0 && (
              <span className="chip bg-brand-50 text-brand-700">
                <span className="num">{cartCount}</span> {cartCount === 1 ? t('cart.item') : t('cart.items')}
              </span>
            )}
          </h2>
          <button
            type="button"
            onClick={() => setCartOpen(false)}
            className="btn-ghost size-9"
            aria-label={t('common.close')}
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>

        {cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <span className="grid size-20 place-items-center rounded-full bg-brand-50 text-brand-300">
              <ShoppingBag className="size-9" aria-hidden="true" />
            </span>
            <div>
              <p className="text-base font-extrabold text-ink-900">{t('cart.empty')}</p>
              <p className="mt-1 text-sm text-ink-500">{t('cart.emptyDesc')}</p>
            </div>
            <button type="button" onClick={() => setCartOpen(false)} className="btn-primary px-6 py-2.5">
              {t('cart.continueShopping')}
            </button>
          </div>
        ) : (
          <>
            <div
              className={`flex items-center gap-2 border-b px-5 py-3 text-xs font-bold ${
                totals.remainingForFreeShipping > 0
                  ? 'border-amber-100 bg-deal-50 text-deal-600'
                  : 'border-brand-100 bg-brand-50 text-brand-700'
              }`}
            >
              <Truck className="size-4 shrink-0" aria-hidden="true" />
              {totals.remainingForFreeShipping > 0 ? hint : t('cart.freeShippingReached')}
            </div>

            <ul className="flex-1 divide-y divide-ink-100 overflow-y-auto px-5">
              {cart.map((line) => (
                <li key={line.id} className="flex gap-3 py-4">
                  <ProductArt
                    kind={line.art}
                    palette={line.palette}
                    className="size-20 shrink-0 rounded-xl"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="line-clamp-2 text-[13px] leading-5 font-bold text-ink-900">
                        {localize(line, 'name')}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          removeFromCart(line.id)
                          notify(t('toast.removed'), 'info')
                        }}
                        aria-label={`${t('cart.remove')}: ${localize(line, 'name')}`}
                        className="shrink-0 rounded-lg p-1 text-ink-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                    <p className="ltr-nums mt-0.5 text-[11px] text-ink-400">
                      {line.brand} · {formatPrice(line.price, lang)}
                    </p>

                    <div className="mt-2.5 flex items-center justify-between gap-2">
                      <div className="flex items-center rounded-xl border border-ink-200">
                        <button
                          type="button"
                          onClick={() => setQty(line.id, line.qty - 1)}
                          aria-label="-"
                          className="grid size-8 place-items-center rounded-s-xl text-ink-600 transition-colors hover:bg-ink-100"
                        >
                          <Minus className="size-3.5" aria-hidden="true" />
                        </button>
                        <span className="num w-9 text-center text-sm font-extrabold text-ink-900">{line.qty}</span>
                        <button
                          type="button"
                          onClick={() => setQty(line.id, line.qty + 1)}
                          aria-label="+"
                          className="grid size-8 place-items-center rounded-e-xl text-ink-600 transition-colors hover:bg-ink-100"
                        >
                          <Plus className="size-3.5" aria-hidden="true" />
                        </button>
                      </div>
                      <span className="text-sm font-extrabold text-brand-700">
                        {formatPrice(line.price * line.qty, lang)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="space-y-3 border-t border-ink-100 bg-ink-50/60 p-5">
              <dl className="space-y-1.5 text-sm">
                <div className="flex items-center justify-between text-ink-600">
                  <dt>{t('cart.subtotal')}</dt>
                  <dd className="font-bold text-ink-900">{formatPrice(totals.subtotal, lang)}</dd>
                </div>
                {totals.savings > 0 && (
                  <div className="flex items-center justify-between text-deal-600">
                    <dt>{t('cart.discount')}</dt>
                    <dd className="font-bold">-{formatPrice(totals.savings, lang)}</dd>
                  </div>
                )}
                <div className="flex items-center justify-between text-ink-600">
                  <dt>{t('cart.shipping')}</dt>
                  <dd className="font-bold text-brand-700">
                    {totals.shipping === 0 ? t('cart.freeShipping') : formatPrice(totals.shipping, lang)}
                  </dd>
                </div>
                <div className="flex items-center justify-between border-t border-ink-200 pt-2 text-base">
                  <dt className="font-extrabold text-ink-900">{t('cart.total')}</dt>
                  <dd className="font-extrabold text-brand-700">{formatPrice(totals.total, lang)}</dd>
                </div>
              </dl>
              <p className="text-[11px] text-ink-400">{t('cart.vatNote')}</p>

              <button
                type="button"
                onClick={() => {
                  setCartOpen(false)
                  openCheckout()
                }}
                className="btn-primary w-full py-3"
              >
                {t('cart.checkout')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setCartOpen(false)
                  openQuote()
                }}
                className="btn-outline w-full py-3"
              >
                {t('cart.quoteCheckout')}
              </button>
              <button
                type="button"
                onClick={() => {
                  clearCart()
                  notify(t('cart.empty'), 'info')
                }}
                className="btn-ghost w-full py-2 text-xs"
              >
                {t('cart.remove')}
              </button>
            </footer>
          </>
        )}
      </aside>
    </>
  )
}
