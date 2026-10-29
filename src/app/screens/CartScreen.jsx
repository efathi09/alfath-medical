import { FileText, Minus, Plus, ShoppingBag, Trash2, Truck } from 'lucide-react'
import { useLang, useLocalizer } from '../../context/LanguageContext.jsx'
import { useStore } from '../../context/StoreContext.jsx'
import { useAppNav } from '../nav.jsx'
import ProductArt from '../../components/ProductArt.jsx'
import { formatPrice } from '../../components/ui/Logo.jsx'

export default function CartScreen() {
  const { t, lang } = useLang()
  const localize = useLocalizer()
  const { cart, cartCount, totals, setQty, removeFromCart, clearCart, openQuote, notify } = useStore()
  const nav = useAppNav()

  if (cart.length === 0) {
    return (
      <div className="grid place-items-center gap-4 p-8 pt-20 text-center">
        <span className="grid size-20 place-items-center rounded-full bg-white text-app-300 shadow-soft">
          <ShoppingBag className="size-9" aria-hidden="true" />
        </span>
        <div>
          <p className="text-base font-extrabold text-ink-900">{t('cart.empty')}</p>
          <p className="mt-1 text-sm text-ink-500">{t('cart.emptyDesc')}</p>
        </div>
        <button type="button" onClick={() => nav.go('home')} className="rounded-xl bg-app-600 px-6 py-2.5 text-sm font-bold text-white active:scale-95">
          {t('cart.continueShopping')}
        </button>
      </div>
    )
  }

  const hint = t('cart.freeShippingHint').replace('{amount}', formatPrice(totals.remainingForFreeShipping, lang))

  return (
    <div className="space-y-3 pb-6">
      <div className="flex items-center justify-between px-4 pt-4">
        <h2 className="text-[15px] font-extrabold text-ink-900">
          {t('cart.title')} <span className="text-ink-400">(<span className="num">{cartCount}</span>)</span>
        </h2>
        <button
          type="button"
          onClick={() => {
            clearCart()
            notify(t('toast.removed'), 'info')
          }}
          className="text-xs font-bold text-rose-500"
        >
          {t('cart.remove')} {t('cart.title')}
        </button>
      </div>

      <div
        className={`mx-4 flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold ${
          totals.remainingForFreeShipping > 0 ? 'bg-app-50 text-app-700' : 'bg-emerald-50 text-emerald-700'
        }`}
      >
        <Truck className="size-4 shrink-0" aria-hidden="true" />
        {totals.remainingForFreeShipping > 0 ? hint : t('cart.freeShippingReached')}
      </div>

      <ul className="space-y-2 px-4">
        {cart.map((line) => (
          <li key={line.id} className="flex gap-3 rounded-2xl bg-white p-3 shadow-soft">
            <ProductArt kind={line.art} palette={line.palette} className="size-20 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="line-clamp-2 text-[13px] leading-5 font-bold text-ink-900">{localize(line, 'name')}</p>
                <button
                  type="button"
                  onClick={() => {
                    removeFromCart(line.id)
                    notify(t('toast.removed'), 'info')
                  }}
                  aria-label={t('cart.remove')}
                  className="shrink-0 rounded-lg p-1 text-ink-400 active:scale-95"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </button>
              </div>
              <p className="ltr-nums mt-0.5 text-[11px] text-ink-400">
                {line.brand} · {formatPrice(line.price, lang)}
              </p>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center rounded-xl border border-ink-200">
                  <button
                    type="button"
                    onClick={() => setQty(line.id, line.qty - 1)}
                    aria-label="-"
                    className="grid size-8 place-items-center text-ink-600"
                  >
                    <Minus className="size-3.5" aria-hidden="true" />
                  </button>
                  <span className="num w-8 text-center text-sm font-extrabold text-ink-900">{line.qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty(line.id, line.qty + 1)}
                    aria-label="+"
                    className="grid size-8 place-items-center text-ink-600"
                  >
                    <Plus className="size-3.5" aria-hidden="true" />
                  </button>
                </div>
                <span className="text-sm font-extrabold text-app-700">{formatPrice(line.price * line.qty, lang)}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mx-4 space-y-2 rounded-2xl bg-white p-4 shadow-soft">
        <div className="flex items-center justify-between text-sm text-ink-600">
          <span>{t('cart.subtotal')}</span>
          <span className="font-bold text-ink-900">{formatPrice(totals.subtotal, lang)}</span>
        </div>
        {totals.savings > 0 && (
          <div className="flex items-center justify-between text-sm text-emerald-600">
            <span>{t('cart.discount')}</span>
            <span className="font-bold">-{formatPrice(totals.savings, lang)}</span>
          </div>
        )}
        <div className="flex items-center justify-between text-sm text-ink-600">
          <span>{t('cart.shipping')}</span>
          <span className="font-bold text-app-700">
            {totals.shipping === 0 ? t('cart.freeShipping') : formatPrice(totals.shipping, lang)}
          </span>
        </div>
        <div className="flex items-center justify-between border-t border-ink-200 pt-2 text-base">
          <span className="font-extrabold text-ink-900">{t('cart.total')}</span>
          <span className="font-extrabold text-app-700">{formatPrice(totals.total, lang)}</span>
        </div>
        <p className="text-[11px] text-ink-400">{t('cart.vatNote')}</p>
      </div>

      <div className="mx-4 space-y-2">
        <button
          type="button"
          onClick={() => nav.push({ name: 'checkout' })}
          className="w-full rounded-xl bg-app-600 py-3 text-sm font-bold text-white active:scale-[0.98]"
        >
          {t('cart.checkout')}
        </button>
        <button
          type="button"
          onClick={() => openQuote()}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-app-300 bg-app-50 py-3 text-sm font-bold text-app-700 active:scale-[0.98]"
        >
          <FileText className="size-4" aria-hidden="true" />
          {t('cart.quoteCheckout')}
        </button>
      </div>
    </div>
  )
}
