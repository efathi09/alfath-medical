import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, RefreshCw, X } from 'lucide-react'
import { registerSW } from 'virtual:pwa-register'
import { useLang } from '../context/LanguageContext.jsx'

const OFFLINE_TOAST_MS = 4000

export default function PwaUpdater() {
  const { t } = useLang()
  const updateRef = useRef(null)
  const [needRefresh, setNeedRefresh] = useState(false)
  const [offlineReady, setOfflineReady] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return undefined

    const update = registerSW({
      immediate: true,
      onNeedRefresh: () => {
        setDismissed(false)
        setNeedRefresh(true)
      },
      onOfflineReady: () => setOfflineReady(true),
    })

    updateRef.current = update
    return () => update?.()
  }, [])

  useEffect(() => {
    if (!offlineReady) return undefined
    const id = window.setTimeout(() => setOfflineReady(false), OFFLINE_TOAST_MS)
    return () => window.clearTimeout(id)
  }, [offlineReady])

  const applyUpdate = () => {
    updateRef.current?.()
  }

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-90 flex flex-col items-center gap-2 p-4"
    >
      {offlineReady && (
        <div className="pointer-events-auto flex max-w-md items-center gap-2 rounded-2xl bg-ink-900 px-4 py-2.5 text-[13px] font-bold text-white shadow-soft">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-400" aria-hidden="true" />
          {t('pwa.ready')}
        </div>
      )}

      {needRefresh && !dismissed && (
        <div className="pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-2xl border border-ink-200 bg-white p-3 shadow-soft">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
            <RefreshCw className="size-4.5" aria-hidden="true" />
          </span>

          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-extrabold text-ink-900">
              {t('pwa.updateTitle')}
            </span>
          </span>

          <button
            type="button"
            onClick={applyUpdate}
            className="shrink-0 rounded-xl bg-brand-600 px-3.5 py-2 text-[12px] font-extrabold text-white transition-colors hover:bg-brand-700"
          >
            {t('pwa.updateAction')}
          </button>

          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label={t('pwa.later')}
            className="grid size-8 shrink-0 place-items-center rounded-lg text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  )
}
