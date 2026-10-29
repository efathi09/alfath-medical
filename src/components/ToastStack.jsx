import { CheckCircle2, Info, X } from 'lucide-react'
import { useLang } from '../context/LanguageContext.jsx'
import { useStore } from '../context/StoreContext.jsx'

export default function ToastStack() {
  const { t } = useLang()
  const { toasts, dismissToast } = useStore()

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-4 z-100 flex flex-col items-center gap-2 px-4"
      role="region"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const tone = {
          success: { skin: 'bg-ink-900 text-white', Icon: CheckCircle2, iconClass: 'text-brand-400' },
          info: { skin: 'bg-white text-ink-800 border border-ink-200', Icon: Info, iconClass: 'text-brand-600' },
          error: { skin: 'bg-rose-600 text-white', Icon: Info, iconClass: 'text-white' },
        }[toast.tone] ?? { skin: 'bg-ink-900 text-white', Icon: CheckCircle2, iconClass: 'text-brand-400' }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold shadow-lift ${tone.skin}`}
          >
            <tone.Icon className={`size-5 shrink-0 ${tone.iconClass}`} aria-hidden="true" />
            <span className="flex-1">{toast.message}</span>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label={t('common.close')}
              className="shrink-0 rounded-lg p-1 opacity-70 transition-opacity hover:opacity-100"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
