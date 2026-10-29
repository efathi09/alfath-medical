import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, MapPin, Package, Phone, RefreshCw, Search } from 'lucide-react'
import { adminApi } from './adminApi.js'
import { ORDER_STATUSES, useAdminT } from './adminText.js'
import { useLang } from '../context/LanguageContext.jsx'
import { EmptyState, PageLoader, StatusBadge } from './ui.jsx'
import { formatPrice } from '../components/ui/Logo.jsx'

function formatDate(value, lang) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return value
  }
}

function itemLabel(item) {
  return item?.name?.ar || item?.name?.en || item?.nameAr || item?.id || '—'
}

function OrderRow({ order, t, lang, onStatus, busy, canManage }) {
  const [open, setOpen] = useState(false)
  const items = Array.isArray(order.items) ? order.items : []

  return (
    <li className="flex flex-col gap-3 px-4 py-4 sm:px-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-extrabold text-ink-900">
              {t('ord.number')} <span className="num">#{order.number}</span>
            </p>
            <StatusBadge status={order.status} label={t(`ord.status.${order.status}`)} />
            {(order.source === 'web' || order.source === 'app') && (
              <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-extrabold text-ink-500">
                {t(`ord.source.${order.source}`)}
              </span>
            )}
            {order.status === 'cancelled' && (
              <span className="text-[11px] font-bold text-ink-400 line-through">
                {formatPrice(order.total, lang)}
              </span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-500">
            <span className="font-bold text-ink-700">{order.name}</span>
            <a href={`tel:${order.phone}`} className="num inline-flex items-center gap-1 hover:text-brand-700">
              <Phone className="size-3.5 flip-rtl" aria-hidden="true" />
              {order.phone}
            </a>
            <span className="text-ink-400">{formatDate(order.createdAt, lang)}</span>
            <span className="text-ink-400">
              {order.items?.length ?? 0} {t('ord.item')}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
          <p className="num text-sm font-extrabold text-ink-900 sm:order-1 sm:text-base">{formatPrice(order.total, lang)}</p>
          {canManage && (
            <select
              value={order.status}
              onChange={(e) => onStatus(order.id, e.target.value)}
              disabled={busy}
              aria-label={t('common.status')}
              className="cursor-pointer rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-700 focus:border-brand-400 focus:outline-none disabled:opacity-60"
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {t(`ord.status.${s}`)}
                </option>
              ))}
            </select>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="inline-flex items-center gap-1 rounded-xl border border-ink-200 px-3 py-2 text-xs font-bold text-ink-600 hover:border-brand-300 hover:text-brand-700"
          >
            {open ? t('ord.hide') : t('ord.show')}
            <ChevronDown className={`size-3.5 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
          </button>
        </div>
      </div>

      {open && (
        <div className="grid gap-3 rounded-xl border border-ink-100 bg-ink-50 p-3 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <ul className="rounded-xl bg-white p-2">
              {items.length === 0 ? (
                <li className="px-2 py-2 text-xs text-ink-400">{t('common.none')}</li>
              ) : (
                items.map((item, i) => (
                  <li
                    key={item.id ?? i}
                    className="flex items-center justify-between gap-3 border-b border-ink-100 px-2 py-2 text-xs last:border-0"
                  >
                    <span className="min-w-0 flex-1 text-ink-700">
                      <span className="block truncate font-bold">{itemLabel(item)}</span>
                      {item.brand && <span className="num text-ink-400"> · {item.brand}</span>}
                    </span>
                    <span className="num shrink-0 text-ink-500">
                      {item.qty} × {formatPrice(item.price, lang)}
                    </span>
                    <span className="num shrink-0 font-extrabold text-ink-800">
                      {formatPrice(Number(item.price ?? 0) * Number(item.qty ?? 0), lang)}
                    </span>
                  </li>
                ))
              )}
            </ul>

            <dl className="mt-2 space-y-1 rounded-xl bg-white p-3 text-xs">
              <div className="flex justify-between text-ink-500">
                <dt>{t('ord.subtotal')}</dt>
                <dd className="num">{formatPrice(order.subtotal, lang)}</dd>
              </div>
              <div className="flex justify-between text-ink-500">
                <dt>{t('ord.shipping')}</dt>
                <dd className="num">
                  {Number(order.shipping) > 0 ? formatPrice(order.shipping, lang) : t('ord.shippingFree')}
                </dd>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-ink-500">
                  <dt>{t('ord.discount')}</dt>
                  <dd className="num">- {formatPrice(order.discount, lang)}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-ink-100 pt-1.5 font-extrabold text-ink-900">
                <dt>{t('ord.total')}</dt>
                <dd className="num">{formatPrice(order.total, lang)}</dd>
              </div>
            </dl>
          </div>

          <div className="space-y-2 text-xs">
            <div className="rounded-xl bg-white p-3">
              <p className="mb-1.5 font-extrabold text-ink-900">{t('ord.customer')}</p>
              <p className="font-bold text-ink-700">{order.name}</p>
              <a href={`tel:${order.phone}`} className="num mt-0.5 inline-block text-ink-500 hover:text-brand-700">
                {order.phone}
              </a>
              {order.email && (
                <a href={`mailto:${order.email}`} className="mt-0.5 block text-ink-500 hover:text-brand-700" dir="ltr">
                  {order.email}
                </a>
              )}
              <p className="mt-2 flex items-start gap-1 text-ink-600">
                <MapPin className="mt-0.5 size-3.5 shrink-0 text-ink-400" aria-hidden="true" />
                <span>
                  {order.address ? `${order.address}${order.city ? ` — ${order.city}` : ''}` : t('ord.noAddress')}
                </span>
              </p>
              <p className="mt-1.5 text-ink-500">
                {t('ord.payment')}: {t(`ord.payment.${order.paymentMethod === 'card' ? 'card' : 'cod'}`)}
              </p>
            </div>

            {order.notes && (
              <div className="rounded-xl bg-white p-3">
                <p className="mb-1 font-extrabold text-ink-900">{t('ord.notes')}</p>
                <p className="text-ink-600">{order.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </li>
  )
}

export default function OrdersAdmin({ canManage = true }) {
  const t = useAdminT()
  const { lang } = useLang()
  const [orders, setOrders] = useState(null)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [query, setQuery] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let alive = true
    adminApi
      .listOrders()
      .then((data) => {
        if (!alive) return
        setOrders(Array.isArray(data) ? data : [])
        setError('')
      })
      .catch(() => {
        if (!alive) return
        setError(t('common.error'))
        setOrders((prev) => prev ?? [])
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [t, reloadKey])

  const counts = useMemo(() => {
    const base = { all: orders?.length ?? 0 }
    for (const s of ORDER_STATUSES) base[s] = 0
    for (const o of orders ?? []) base[o.status] = (base[o.status] ?? 0) + 1
    return base
  }, [orders])

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase()
    return (orders ?? []).filter((o) => {
      if (status && o.status !== status) return false
      if (!term) return true
      return [o.number, o.name, o.phone, o.email, o.city, o.address]
        .filter((v) => v != null)
        .join(' ')
        .toLowerCase()
        .includes(term)
    })
  }, [orders, status, query])

  async function updateStatus(id, next) {
    const previous = orders
    setBusyId(id)
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: next } : o)))
    try {
      await adminApi.updateOrderStatus(id, next)
    } catch {
      setError(t('common.error'))
      setOrders(previous)
    } finally {
      setBusyId(null)
    }
  }

  if (error && orders === null) return <p className="text-sm font-bold text-rose-600">{error}</p>
  if (orders === null) return <PageLoader />
  if (error) return <p className="text-sm font-bold text-rose-600">{error}</p>

  const chips = [{ id: '', label: t('ord.all'), count: counts.all }, ...ORDER_STATUSES.map((s) => ({ id: s, label: t(`ord.status.${s}`), count: counts[s] ?? 0 }))]

  return (
    <div className="flex flex-col gap-4">
      <div className="card flex flex-wrap items-center gap-3 p-3">
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('ord.searchPlaceholder')}
            className="w-full rounded-xl border border-ink-200 bg-white py-2 ps-9 pe-3 text-sm text-ink-800 transition-colors focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-100"
          />
        </div>
        <button
          type="button"
          onClick={() => {
            setLoading(true)
            setReloadKey((k) => k + 1)
          }}
          className="inline-flex items-center gap-2 rounded-xl border border-ink-200 px-3 py-2 text-xs font-bold text-ink-600 hover:border-brand-300 hover:text-brand-700"
        >
          <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
          {t('common.refresh')}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => {
          const active = status === chip.id
          return (
            <button
              key={chip.id || 'all'}
              type="button"
              onClick={() => setStatus(chip.id)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${
                active ? 'border-brand-600 bg-brand-600 text-white' : 'border-ink-200 bg-white text-ink-600 hover:border-brand-300 hover:text-brand-700'
              }`}
            >
              {chip.label}
              <span className={`num rounded-full px-1.5 text-[10px] ${active ? 'bg-white/20' : 'bg-ink-100 text-ink-500'}`}>
                {chip.count}
              </span>
            </button>
          )
        })}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={Package}
          title={orders.length === 0 ? t('ord.empty') : t('ord.emptyFiltered')}
          action={null}
        />
      ) : (
        <ul className="card divide-y divide-ink-100 overflow-hidden">
          {visible.map((order) => (
            <OrderRow
              key={order.id}
              order={order}
              t={t}
              lang={lang}
              busy={busyId === order.id}
              canManage={canManage}
              onStatus={updateStatus}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
