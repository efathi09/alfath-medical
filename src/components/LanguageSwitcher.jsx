import { Check, Languages } from 'lucide-react'
import { useLang } from '../context/LanguageContext.jsx'

export default function LanguageSwitcher({ variant = 'segmented' }) {
  const { t, lang, setLang } = useLang()
  const options = [
    { id: 'ar', label: 'العربية', short: 'ع' },
    { id: 'en', label: 'English', short: 'EN' },
  ]

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
        aria-label={t('header.language')}
        className="btn-ghost h-10 px-2.5 text-xs font-extrabold"
      >
        <Languages className="size-4" aria-hidden="true" />
        {lang === 'ar' ? 'EN' : 'ع'}
      </button>
    )
  }

  return (
    <div
      role="group"
      aria-label={t('header.language')}
      className="flex items-center gap-0.5 rounded-xl border border-ink-200 bg-ink-50 p-0.5"
    >
      {options.map((option) => {
        const active = lang === option.id
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => setLang(option.id)}
            aria-pressed={active}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-extrabold transition-all ${
              active ? 'bg-white text-brand-700 shadow-sm' : 'text-ink-500 hover:text-ink-800'
            }`}
          >
            {active && <Check className="size-3" aria-hidden="true" />}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
