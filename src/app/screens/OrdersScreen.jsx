import { useEffect, useState } from 'react'
import { Package } from 'lucide-react'
import { useLang } from '../../context/LanguageContext.jsx'
import { useStore } from '../../context/StoreContext.jsx'
import { useAppNav } from '../nav.jsx'
import { formatPrice } from '../../components/ui/Logo.jsx'

const STATUS_TONE = {
  pending: 'bg-amber-50 text-amber-700',
  confirmed: 'bg-app-50 text-app-700',
  shipped: 'bg-sky-50 text-sky-700',
  delivered: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-rose-50 text-rose-600',
}

export default function OrdersScreen() {
  const { t, lang } = useLang()
  const { orders, loadOrders } = useStore()
  const nav = useAppNav()
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let alive = true
    loadOrders()
      .then(() => {
        if (alive) setFailed(false)
      })
      .catch(() => alive && setFailed(true))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [loadOrders])

  if (loading) {
    return <p className="p-8 text-center text-sm text-ink-400">{t('common.loading')}</p>
  }

  if (failed) {
    return <p className="p-8 text-center text-sm text-ink-400">{t('orders.offline')}</p>
  }

  if (orders.length === 0) {
    return (
      <div className="grid place-items-center gap-3 p-8 pt-20 text-center">
        <span className="grid size-16 place-items-center rounded-full bg-white text-app-300 shadow-soft">
          <Package className="size-8" aria-hidden="true" />
        </span>
        <p className="text-sm font-bold text-ink-600">{t('orders.empty')}</p>
        <button
          type="button"
          onClick={() => nav.go('home')}
          className="rounded-xl bg-app-600 px-6 py-2.5 text-sm font-bold text-white active:scale-95"
        >
          {t('cart.continueShopping')}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-2 p-4">
      {orders.map((order) => (
        <button
          key={order.id}
          type="button"
          onClick={() => nav.push({ name: 'order', params: { id: order.id } })}
          className="flex w-full items-center gap-3 rounded-2xl bg-white p-4 text-start shadow-soft"
        >
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-app-50 text-app-600">
            <Package className="size-5" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2">
              <span className="num text-sm font-extrabold text-ink-900">#{order.number}</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_TONE[order.status] ?? 'bg-ink-100 text-ink-600'}`}>
                {t(`orders.status.${order.status}`)}
              </span>
            </span>
            <span className="mt-0.5 block text-[11px] text-ink-400">
              {new Date(order.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB')} ·{' '}
              <span className="num">{order.items.length}</span> {t('cart.items')}
            </span>
          </span>
          <span className="shrink-0 text-sm font-extrabold text-app-700">{formatPrice(order.total, lang)}</span>
        </button>
      ))}
    </div>
  )
}
