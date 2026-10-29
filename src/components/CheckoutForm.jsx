import { useMemo, useState } from 'react'
import { Banknote, CheckCircle2, CreditCard, MapPin, Phone, ShoppingBag, User } from 'lucide-react'
import { useLang, useLocalizer } from '../context/LanguageContext.jsx'
import { useStore } from '../context/StoreContext.jsx'
import { useCompany } from '../context/DataContext.jsx'
import ProductArt from './ProductArt.jsx'
import { formatPrice } from './ui/Logo.jsx'

/**
 * The checkout form, shared by the mobile screen (variant="page") and by the
 * storefront's checkout modal (variant="modal"). It is deliberately free of any
 * navigation dependency: the parent decides what happens after an order is placed.
 *
 * @param {(action: 'home' | 'account') => void} onDone
 * @param {'page' | 'modal'} [variant]
 */
export default function CheckoutForm({ onDone, variant = 'page' }) {
  const isModal = variant === 'modal'
  const { t, lang } = useLang()
  const localize = useLocalizer()
  const company = useCompany()
  const { cart, totals, customer, placeOrder, clearCart, notify } = useStore()
  const [payment, setPayment] = useState('cod')
  const [form, setForm] = useState({
    name: customer?.name ?? '',
    phone: customer?.phone ?? '',
    email: customer?.email ?? '',
    address: customer?.address ?? '',
    city: customer?.city ?? '',
    notes: '',
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [placed, setPlaced] = useState(null)

  const errorText = useMemo(() => {
    if (!error) return ''
    // createT() returns undefined for an unknown key — never let that hide the
    // failure from the customer, always fall back to the generic message.
    return t(`checkout.error.${error}`) || t('checkout.error.generic')
  }, [error, t])

  if (cart.length === 0 && !placed) {
    return (
      <div className="grid place-items-center gap-3 p-8 text-center">
        <ShoppingBag className="size-10 text-ink-300" aria-hidden="true" />
        <p className="text-sm font-bold text-ink-500">{t('cart.emptyDesc')}</p>
        <button
          type="button"
          onClick={() => onDone('home')}
          className="rounded-xl bg-app-600 px-5 py-2.5 text-sm font-bold text-white active:scale-[0.98]"
        >
          {t('cart.continueShopping')}
        </button>
      </div>
    )
  }

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (error) setError('')
  }

  async function submit(event) {
    event.preventDefault()
    if (busy) return
    if (form.name.trim().length < 2) return setError('name')
    if (form.phone.replace(/\D/g, '').length < 8) return setError('phone')
    if (!form.address.trim()) return setError('address')

    setBusy(true)
    try {
      const order = await placeOrder({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        notes: form.notes.trim(),
        paymentMethod: payment,
        // Lets the admin tell storefront orders apart from app orders.
        source: isModal ? 'web' : 'app',
        items: cart.map((line) => ({ id: line.id, qty: line.qty })),
      })
      clearCart()
      notify(t('checkout.successToast'))
      setPlaced(order)
    } catch (err) {
      const code = err?.code || err?.message || 'generic'
      setError(code === 'OFFLINE' ? 'offline' : code)
    } finally {
      setBusy(false)
    }
  }

  if (placed) {
    return (
      <div className="grid place-items-center gap-4 p-6 text-center">
        <CheckCircle2 className="size-16 text-emerald-500" aria-hidden="true" />
        <div>
          <p className="text-lg font-extrabold text-ink-900">{t('checkout.successTitle')}</p>
          <p className="mt-1 text-sm text-ink-500">{t('checkout.successDesc')}</p>
        </div>
        <div className="w-full rounded-2xl bg-white p-4 text-start shadow-soft">
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink-500">{t('orders.number')}</span>
            <span className="num font-extrabold text-ink-900">#{placed.number}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-ink-500">{t('cart.total')}</span>
            <span className="font-extrabold text-app-700">{formatPrice(placed.total, lang)}</span>
          </div>
          <div className="mt-2 text-xs text-ink-400">
            {t('checkout.contactNote')} <span className="ltr-nums">{company.phone}</span>
          </div>
        </div>
        <div className="flex w-full gap-2">
          <button
            type="button"
            onClick={() => onDone('home')}
            className="flex-1 rounded-xl bg-ink-100 py-3 text-sm font-bold text-ink-600 active:scale-[0.98]"
          >
            {t('cart.continueShopping')}
          </button>
          {!isModal && (
            <button
              type="button"
              onClick={() => onDone('account')}
              className="flex-1 rounded-xl bg-app-600 py-3 text-sm font-bold text-white active:scale-[0.98]"
            >
              {t('account.myOrders')}
            </button>
          )}
        </div>
      </div>
    )
  }

  const field =
    'w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-800 outline-none transition-colors placeholder:text-ink-400 focus:border-app-400 focus:ring-4 focus:ring-app-100'

  return (
    <div className={isModal ? 'space-y-4' : 'space-y-4 p-4 pb-28'}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <section className="space-y-3 rounded-2xl bg-white p-4 shadow-soft">
          <h2 className="text-sm font-extrabold text-ink-900">{t('checkout.shippingInfo')}</h2>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-ink-700">{t('auth.name')}</span>
            <div className="relative">
              <User className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
              <input className={`${field} ps-9`} value={form.name} onChange={(e) => update('name', e.target.value)} />
            </div>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-ink-700">{t('auth.phone')}</span>
            <div className="relative">
              <Phone className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
              <input
                type="tel"
                inputMode="tel"
                dir="ltr"
                className={`${field} ltr-nums pe-9`}
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
              />
            </div>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-ink-700">{t('checkout.address')}</span>
            <div className="relative">
              <MapPin className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
              <input className={`${field} ps-9`} value={form.address} onChange={(e) => update('address', e.target.value)} />
            </div>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-ink-700">{t('checkout.city')}</span>
              <input className={field} value={form.city} onChange={(e) => update('city', e.target.value)} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-ink-700">{t('auth.email')}</span>
              <input
                type="email"
                inputMode="email"
                dir="ltr"
                className={`${field} ltr-nums`}
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
              />
            </label>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-ink-700">{t('quote.notes')}</span>
            <textarea
              rows={2}
              className={`${field} resize-none`}
              placeholder={t('quote.notesPlaceholder')}
              value={form.notes}
              onChange={(e) => update('notes', e.target.value)}
            />
          </label>
        </section>

        <section className="space-y-2 rounded-2xl bg-white p-4 shadow-soft">
          <h2 className="text-sm font-extrabold text-ink-900">{t('checkout.paymentMethod')}</h2>
          <button
            type="button"
            onClick={() => setPayment('cod')}
            className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 text-start ${
              payment === 'cod' ? 'border-app-500 bg-app-50' : 'border-ink-200'
            }`}
          >
            <Banknote className="size-5 shrink-0 text-app-600" aria-hidden="true" />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold text-ink-900">{t('checkout.cod')}</span>
              <span className="block text-[11px] text-ink-500">{t('checkout.codDesc')}</span>
            </span>
          </button>
          <button
            type="button"
            disabled
            className="flex w-full items-center gap-3 rounded-xl border-2 border-ink-200 p-3 text-start opacity-60"
          >
            <CreditCard className="size-5 shrink-0 text-ink-400" aria-hidden="true" />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold text-ink-900">{t('checkout.card')}</span>
              <span className="block text-[11px] text-ink-500">{t('checkout.cardSoon')}</span>
            </span>
          </button>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-soft">
          <h2 className="mb-2 text-sm font-extrabold text-ink-900">{t('cart.title')}</h2>
          <ul className="space-y-2">
            {cart.map((line) => (
              <li key={line.id} className="flex items-center gap-3">
                <ProductArt kind={line.art} palette={line.palette} className="size-11 shrink-0 rounded-lg" />
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-1 block text-[13px] font-bold text-ink-800">{localize(line, 'name')}</span>
                  <span className="num text-[11px] text-ink-400">x{line.qty}</span>
                </span>
                <span className="text-[13px] font-extrabold text-app-700">{formatPrice(line.price * line.qty, lang)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 space-y-1.5 border-t border-ink-100 pt-3 text-sm">
            <div className="flex justify-between text-ink-600">
              <span>{t('cart.subtotal')}</span>
              <span className="font-bold text-ink-900">{formatPrice(totals.subtotal, lang)}</span>
            </div>
            <div className="flex justify-between text-ink-600">
              <span>{t('cart.shipping')}</span>
              <span className="font-bold text-app-700">
                {totals.shipping === 0 ? t('cart.freeShipping') : formatPrice(totals.shipping, lang)}
              </span>
            </div>
            <div className="flex justify-between border-t border-ink-100 pt-1.5 text-base">
              <span className="font-extrabold text-ink-900">{t('cart.total')}</span>
              <span className="font-extrabold text-app-700">{formatPrice(totals.total, lang)}</span>
            </div>
          </div>
        </section>

        {errorText && (
          <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600">{errorText}</p>
        )}

        {isModal && (
          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-app-600 py-3.5 text-sm font-bold text-white active:scale-[0.98] disabled:opacity-60"
          >
            {busy ? t('checkout.placing') : t('checkout.placeOrder')}
          </button>
        )}
      </form>

      {!isModal && (
        <div className="fixed inset-x-0 bottom-0 z-30 mx-auto flex w-full max-w-md items-center gap-3 border-t border-ink-100 bg-white/95 p-3 pb-safe backdrop-blur">
          <div className="leading-tight">
            <p className="text-[11px] text-ink-400">{t('cart.total')}</p>
            <p className="text-base font-extrabold text-app-700">{formatPrice(totals.total, lang)}</p>
          </div>
          <button
            type="button"
            onClick={submit}
            disabled={busy}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-app-600 py-3 text-sm font-bold text-white active:scale-[0.98] disabled:opacity-60"
          >
            {busy ? t('checkout.placing') : t('checkout.placeOrder')}
          </button>
        </div>
      )}
    </div>
  )
}
