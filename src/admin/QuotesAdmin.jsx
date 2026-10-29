import { useEffect, useState } from 'react'
import { ChevronDown, FileText, Phone } from 'lucide-react'
import { adminApi } from './adminApi.js'
import { QUOTE_STATUSES, useAdminT } from './adminText.js'
import { EmptyState, PageLoader, StatusBadge } from './ui.jsx'

function formatDate(value) {
  try {
    return new Date(value).toLocaleString('ar-EG', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return value
  }
}

function QuoteRow({ quote, t, onStatus, canManage }) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  async function change(event) {
    const status = event.target.value
    setBusy(true)
    try {
      await onStatus(quote.id, status)
    } finally {
      setBusy(false)
    }
  }

  const items = Array.isArray(quote.items) ? quote.items : []

  return (
    <li className="flex flex-col gap-3 px-4 py-4 sm:px-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-extrabold text-ink-900">{quote.name}</p>
            <StatusBadge status={quote.status} label={t(`quo.status.${quote.status}`)} />
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-500">
            <a href={`tel:${quote.phone}`} className="num inline-flex items-center gap-1 hover:text-brand-700">
              <Phone className="size-3.5 flip-rtl" aria-hidden="true" />
              {quote.phone}
            </a>
            {quote.company && <span>{quote.company}</span>}
            <span className="text-ink-400">{formatDate(quote.created_at)}</span>
          </div>
          {quote.notes && <p className="mt-2 text-xs text-ink-600">{quote.notes}</p>}
        </div>

        <div className="flex items-center gap-2">
          {canManage && (
            <select
              value={quote.status}
              onChange={change}
              disabled={busy}
              aria-label={t('common.status')}
              className="cursor-pointer rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-700 focus:border-brand-400 focus:outline-none disabled:opacity-60"
            >
              {QUOTE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {t(`quo.status.${s}`)}
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
            {open ? t('quo.hide') : t('quo.show')}
            <ChevronDown className={`size-3.5 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
          </button>
        </div>
      </div>

      {open && (
        <ul className="rounded-xl border border-ink-100 bg-ink-50 p-3">
          {items.length === 0 ? (
            <li className="px-1 py-1 text-xs text-ink-400">{t('common.none')}</li>
          ) : (
            items.map((item, i) => (
              <li
                key={item.id ?? i}
                className="flex items-center justify-between gap-3 border-b border-ink-100 px-1 py-1.5 text-xs last:border-0"
              >
                <span className="text-ink-700">
                  {item.name?.ar ?? item.nameAr ?? item.id ?? '—'}
                  {item.id && <span className="num text-ink-400"> · {item.id}</span>}
                </span>
                <span className="num font-bold text-ink-600">
                  {t('quo.qty')}: {item.qty ?? 1}
                </span>
              </li>
            ))
          )}
        </ul>
      )}
    </li>
  )
}

export default function QuotesAdmin({ canManage = true }) {
  const t = useAdminT()
  const [quotes, setQuotes] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    adminApi
      .listQuotes()
      .then((data) => {
        if (alive) setQuotes(data)
      })
      .catch(() => {
        if (!alive) return
        setError(t('common.error'))
        setQuotes([])
      })
    return () => {
      alive = false
    }
  }, [t])

  async function updateStatus(id, status) {
    const previous = quotes
    setQuotes((prev) => prev.map((q) => (q.id === id ? { ...q, status } : q)))
    try {
      await adminApi.updateQuoteStatus(id, status)
    } catch {
      setError(t('common.error'))
      setQuotes(previous)
    }
  }

  if (error) return <p className="text-sm font-bold text-rose-600">{error}</p>
  if (quotes === null) return <PageLoader />
  if (quotes.length === 0) return <EmptyState icon={FileText} title={t('quo.empty')} />

  return (
    <ul className="card divide-y divide-ink-100 overflow-hidden">
      {quotes.map((q) => (
        <QuoteRow key={q.id} quote={q} t={t} onStatus={updateStatus} canManage={canManage} />
      ))}
    </ul>
  )
}
