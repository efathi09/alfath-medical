import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  Database,
  Download,
  FileText,
  FolderTree,
  Mail,
  Package,
  PackageX,
  Wallet,
} from 'lucide-react'
import { adminApi, downloadSubscribers } from './adminApi.js'
import { useAdminT } from './adminText.js'
import { useLang } from '../context/LanguageContext.jsx'
import { PageLoader, StatusBadge } from './ui.jsx'
import { formatPrice } from '../components/ui/Logo.jsx'

/** "local" / "postgres" are technical values from the API — show them in Arabic. */
function sourceLabel(source, t) {
  if (!source) return '—'
  const key = `dash.source.${source}`
  const label = t(key)
  return label === key ? source : label
}

function StatCard({ icon, label, value, tone = 'brand', onClick, hint }) {
  const Icon = icon
  const tones = {
    brand: 'bg-brand-50 text-brand-600',
    deal: 'bg-deal-50 text-deal-600',
    sky: 'bg-sky-50 text-sky-600',
    rose: 'bg-rose-50 text-rose-600',
    ink: 'bg-ink-100 text-ink-600',
  }
  const Wrapper = onClick ? 'button' : 'div'
  return (
    <Wrapper
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`card flex items-center gap-4 p-4 text-start ${onClick ? 'transition-shadow hover:shadow-lift' : ''}`}
    >
      <span className={`grid size-12 shrink-0 place-items-center rounded-xl ${tones[tone]}`}>
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-bold text-ink-500">{label}</p>
        <p className="num text-xl font-extrabold text-ink-900">{value}</p>
        {hint && <p className="text-[11px] text-ink-400">{hint}</p>}
      </div>
    </Wrapper>
  )
}

export default function Dashboard({ onNavigate, canManage = true }) {
  const t = useAdminT()
  const { lang } = useLang()
  const [stats, setStats] = useState(null)
  const [subs, setSubs] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    adminApi
      .stats()
      .then((s) => alive && setStats(s))
      .catch(() => alive && setError(t('common.error')))
    // Non-critical: an API without the endpoint must not break the dashboard.
    if (canManage) {
      adminApi
        .listSubscribers()
        .then((rows) => alive && setSubs(Array.isArray(rows) ? rows : []))
        .catch(() => {})
    }
    return () => {
      alive = false
    }
  }, [canManage, t])

  if (error) return <p className="text-sm font-bold text-rose-600">{error}</p>
  if (!stats) return <PageLoader />

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Package}
          label={t('dash.products')}
          value={stats.products}
          hint={`${stats.activeProducts} ${t('common.active')}`}
          onClick={() => onNavigate('products')}
        />
        <StatCard
          icon={FolderTree}
          label={t('dash.categories')}
          value={stats.categories}
          tone="sky"
          onClick={() => onNavigate('categories')}
        />
        <StatCard
          icon={FileText}
          label={t('dash.quotes')}
          value={stats.quotes}
          hint={`${stats.pendingQuotes} ${t('dash.pending')}`}
          tone="deal"
          onClick={() => onNavigate('quotes')}
        />
        <StatCard
          icon={Wallet}
          label={t('dash.inventoryValue')}
          value={formatPrice(stats.inventoryValue, lang)}
          tone="ink"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={AlertTriangle} label={t('dash.lowStock')} value={stats.lowStock} tone="deal" />
        <StatCard icon={PackageX} label={t('dash.outOfStock')} value={stats.outOfStock} tone="rose" />
        <StatCard
          icon={Package}
          label={t('dash.activeProducts')}
          value={stats.activeProducts}
          tone="brand"
        />
        <StatCard
          icon={Database}
          label={t('dash.source')}
          value={<span className="text-base">{sourceLabel(stats.source, t)}</span>}
          tone="ink"
        />
      </div>

      {canManage && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={Mail}
            label={t('dash.subscribers')}
            value={subs.length}
            hint={t('dash.subscribersHint')}
            tone="sky"
          />
        </div>
      )}

      {canManage && <section className="card overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-ink-100 px-5 py-4">
          <h2 className="text-sm font-extrabold text-ink-900">{t('dash.recent')}</h2>
          <button
            type="button"
            onClick={() => onNavigate('quotes')}
            className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:underline"
          >
            {t('nav.quotes')}
          </button>
        </div>

        {stats.recentQuotes?.length ? (
          <ul className="divide-y divide-ink-100">
            {stats.recentQuotes.map((q) => (
              <li key={q.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-ink-800">{q.name}</p>
                  <p className="num text-xs text-ink-500">{q.phone}</p>
                </div>
                <StatusBadge status={q.status} label={t(`quo.status.${q.status}`)} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-5 py-8 text-center text-sm text-ink-400">{t('dash.noRecent')}</p>
        )}
      </section>}

      <section className="card overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-ink-100 px-5 py-4">
          <h2 className="text-sm font-extrabold text-ink-900">{t('subs.title')}</h2>
          {subs.length > 0 && (
            <button
              type="button"
              onClick={() => downloadSubscribers().catch(() => {})}
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:underline"
            >
              <Download className="size-3.5" aria-hidden="true" />
              {t('subs.download')}
            </button>
          )}
        </div>

        {subs.length ? (
          <ul className="divide-y divide-ink-100">
            {subs.slice(0, 8).map((row) => (
              <li
                key={row.id ?? row.email}
                className="flex flex-wrap items-center justify-between gap-2 px-5 py-3"
              >
                <span className="ltr-nums truncate text-sm font-bold text-ink-800">{row.email}</span>
                <span className="ltr-nums num text-xs text-ink-500">
                  {row.created_at
                    ? new Date(row.created_at).toLocaleDateString(
                        lang === 'ar' ? 'ar-EG' : 'en-GB',
                      )
                    : '—'}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-5 py-8 text-center text-sm text-ink-400">{t('subs.empty')}</p>
        )}
      </section>
    </div>
  )
}
