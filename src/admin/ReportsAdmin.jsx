import { useEffect, useState } from 'react'
import { BarChart3 } from 'lucide-react'
import { adminApi } from './adminApi.js'
import { useAdminT } from './adminText.js'
import { useLang } from '../context/LanguageContext.jsx'
import { EmptyState, PageLoader, StatusBadge } from './ui.jsx'
import { formatPrice } from '../components/ui/Logo.jsx'

function Bar({ ratio }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-ink-100">
      <div className="h-full rounded-full bg-brand-500" style={{ width: `${Math.max(2, ratio)}%` }} />
    </div>
  )
}

export default function ReportsAdmin() {
  const t = useAdminT()
  const { lang } = useLang()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    adminApi
      .reports()
      .then((res) => {
        if (alive) setData(res)
      })
      .catch(() => {
        if (!alive) return
        setError(t('common.error'))
        setData(false)
      })
    return () => {
      alive = false
    }
  }, [t])

  if (data === null) return <PageLoader />
  if (data === false)
    return <EmptyState icon={BarChart3} title={error || t('rep.empty')} action={null} />

  const maxCat = Math.max(1, ...data.byCategory.map((c) => c.value))
  const maxBrand = Math.max(1, ...data.brands.map((b) => b.count))
  const nameOf = (n) => (lang === 'ar' ? n?.ar : n?.en) || n?.ar || n?.en || '—'

  return (
    <div className="flex flex-col gap-5">
      <div className="card p-5">
        <p className="text-xs font-bold text-ink-500">{t('rep.value')}</p>
        <p className="num mt-1 text-2xl font-extrabold text-ink-900">
          {formatPrice(data.currencyValue, lang)}
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-4 text-sm font-extrabold text-ink-900">{t('rep.byCategory')}</h3>
          {data.byCategory.length === 0 ? (
            <p className="text-sm text-ink-400">{t('rep.empty')}</p>
          ) : (
            <ul className="flex flex-col gap-3.5">
              {data.byCategory.map((c) => (
                <li key={c.id}>
                  <div className="mb-1 flex items-center justify-between text-xs font-bold">
                    <span className="text-ink-700">{nameOf(c.name)}</span>
                    <span className="num text-ink-500">
                      {c.count} · {formatPrice(c.value, lang)}
                    </span>
                  </div>
                  <Bar ratio={(c.value / maxCat) * 100} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-5">
          <h3 className="mb-4 text-sm font-extrabold text-ink-900">{t('rep.brands')}</h3>
          {data.brands.length === 0 ? (
            <p className="text-sm text-ink-400">{t('rep.empty')}</p>
          ) : (
            <ul className="flex flex-col gap-3.5">
              {data.brands.map((b) => (
                <li key={b.name}>
                  <div className="mb-1 flex items-center justify-between text-xs font-bold">
                    <span className="ltr-nums text-ink-700">{b.name}</span>
                    <span className="num text-ink-500">{b.count}</span>
                  </div>
                  <Bar ratio={(b.count / maxBrand) * 100} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="card p-5">
        <h3 className="mb-4 text-sm font-extrabold text-ink-900">{t('rep.status')}</h3>
        <div className="flex flex-wrap gap-3">
          {['pending', 'contacted', 'quoted', 'won', 'lost'].map((status) => (
            <div
              key={status}
              className="flex min-w-28 flex-col gap-1 rounded-xl border border-ink-100 bg-ink-50/60 p-3"
            >
              <StatusBadge status={status} label={t(`quo.status.${status}`)} />
              <span className="num text-xl font-extrabold text-ink-900">
                {data.statusCounts?.[status] ?? 0}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <h3 className="border-b border-ink-100 px-5 py-4 text-sm font-extrabold text-ink-900">
          {t('rep.lowStock')}
        </h3>
        {data.lowStock.length === 0 ? (
          <p className="px-5 py-6 text-sm text-ink-400">{t('rep.empty')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-140 text-sm">
              <thead className="bg-ink-50 text-xs font-bold text-ink-500">
                <tr>
                  <th className="px-4 py-3 text-start">{t('prod.nameAr')}</th>
                  <th className="px-4 py-3 text-start">{t('prod.brand')}</th>
                  <th className="px-4 py-3 text-start">{t('prod.category')}</th>
                  <th className="px-4 py-3 text-start">{t('prod.stock')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {data.lowStock.map((p) => (
                  <tr key={p.id} className="hover:bg-ink-50/60">
                    <td className="px-4 py-3 font-bold text-ink-800">{nameOf(p.name)}</td>
                    <td className="ltr-nums px-4 py-3 text-ink-600">{p.brand || '—'}</td>
                    <td className="px-4 py-3 text-ink-500">{p.category || '—'}</td>
                    <td className="num px-4 py-3">
                      <span className={p.stock > 0 ? 'text-deal-600' : 'text-rose-600'}>{p.stock}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
