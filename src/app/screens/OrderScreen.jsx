import { useMemo } from 'react'
import { MapPin, Package, Phone } from 'lucide-react'
import { useLang, useLocalizer } from '../../context/LanguageContext.jsx'
import { useStore } from '../../context/StoreContext.jsx'
import { useAppNav } from '../nav.jsx'
import ProductArt from '../../components/ProductArt.jsx'
import { formatPrice } from '../../components/ui/Logo.jsx'

const STATUS_TONE = {
  pending: 'bg-amber-50 text-amber-700',
  confirmed: 'bg-app-50 text-app-700',
  shipped: 'bg-sky-50 text-sky-700',
  delivered: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-rose-50 text-rose-600',
}

const TRACK = ['pending', 'confirmed', 'shipped', 'delivered']

export default function OrderScreen() {
  const { t, lang } = useLang()
  const localize = useLocalizer()
  const { orders } = useStore()
  const nav = useAppNav()
  const orderId = nav.current.params?.id
  const order = useMemo(() => orders.find((o) => o.id === orderId), [orders, orderId])

  if (!order) {
    return (
      <div className="grid place-items-center gap-3 p-8 pt-20 text-center">
        <Package className="size-10 text-app-300" aria-hidden="true" />
        <p className="text-sm font-bold text-ink-500">{t('orders.notFound')}</p>
      </div>
    )
  }

  const stepIndex = TRACK.indexOf(order.status)

  return (
    <div className="space-y-3 p-4 pb-8">
      <div className="rounded-2xl bg-white p-4 shadow-soft">
        <div className="flex items-center justify-between">
          <span className="num text-base font-extrabold text-ink-900">#{order.number}</span>
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${STATUS_TONE[order.status] ?? 'bg-ink-100 text-ink-600'}`}>
            {t(`orders.status.${order.status}`)}
          </span>
        </div>
        <p className="mt-1 text-[11px] text-ink-400">
          {new Date(order.createdAt).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-GB')}
        </p>

        {order.status !== 'cancelled' && (
          <div className="mt-4 flex items-center">
            {TRACK.map((step, index) => (
              <div key={step} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center gap-1">
                  <span
                    className={`grid size-6 place-items-center rounded-full text-[10px] font-bold ${
                      index <= stepIndex ? 'bg-app-600 text-white' : 'bg-ink-100 text-ink-400'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className="text-[9px] text-ink-500">{t(`orders.status.${step}`)}</span>
                </div>
                {index < TRACK.length - 1 && (
                  <span className={`mx-1 h-0.5 flex-1 ${index < stepIndex ? 'bg-app-500' : 'bg-ink-200'}`} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-soft">
        <h2 className="mb-2 text-sm font-extrabold text-ink-900">{t('cart.title')}</h2>
        <ul className="space-y-2">
          {order.items.map((line) => (
            <li key={line.id} className="flex items-center gap-3">
              <ProductArt kind={line.art} palette={line.palette} className="size-11 shrink-0 rounded-lg" />
              <span className="min-w-0 flex-1">
                <span className="line-clamp-1 block text-[13px] font-bold text-ink-800">
                  {localize({ name: line.name }, 'name')}
                </span>
                <span className="num text-[11px] text-ink-400">
                  x{line.qty} · {formatPrice(line.price, lang)}
                </span>
              </span>
              <span className="text-[13px] font-extrabold text-app-700">
                {formatPrice(line.price * line.qty, lang)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-3 space-y-1.5 border-t border-ink-100 pt-3 text-sm">
          <div className="flex justify-between text-ink-600">
            <span>{t('cart.subtotal')}</span>
            <span className="font-bold text-ink-900">{formatPrice(order.subtotal, lang)}</span>
          </div>
          <div className="flex justify-between text-ink-600">
            <span>{t('cart.shipping')}</span>
            <span className="font-bold text-app-700">
              {order.shipping === 0 ? t('cart.freeShipping') : formatPrice(order.shipping, lang)}
            </span>
          </div>
          <div className="flex justify-between border-t border-ink-100 pt-1.5 text-base">
            <span className="font-extrabold text-ink-900">{t('cart.total')}</span>
            <span className="font-extrabold text-app-700">{formatPrice(order.total, lang)}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2 rounded-2xl bg-white p-4 shadow-soft">
        <h2 className="text-sm font-extrabold text-ink-900">{t('checkout.shippingInfo')}</h2>
        <p className="flex items-center gap-2 text-sm text-ink-700">
          <Phone className="size-4 text-app-500" aria-hidden="true" />
          <span className="ltr-nums">{order.phone}</span>
        </p>
        <p className="flex items-start gap-2 text-sm text-ink-700">
          <MapPin className="mt-0.5 size-4 shrink-0 text-app-500" aria-hidden="true" />
          <span>
            {order.address}
            {order.city ? `, ${order.city}` : ''}
          </span>
        </p>
        {order.notes && <p className="text-xs text-ink-500">{order.notes}</p>}
      </div>

      <button
        type="button"
        onClick={() => nav.back()}
        className="w-full rounded-xl bg-ink-100 py-3 text-sm font-bold text-ink-600 active:scale-[0.98]"
      >
        {t('common.back')}
      </button>
    </div>
  )
}
