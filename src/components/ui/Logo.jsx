import { useState } from 'react'
import { useLang } from '../../context/LanguageContext.jsx'
import { company } from '../../data/company.js'

export function formatNumber(value, lang) {
  const locale = lang === 'ar' ? 'ar-SA-u-nu-latn' : 'en-US'
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value)
}

export function formatPrice(value, lang) {
  const amount = formatNumber(value, lang)
  return lang === 'ar' ? `${amount} ج.م` : `EGP ${amount}`
}

export function formatCount(value, lang) {
  return formatNumber(value, lang)
}

export default function Logo({ compact = false, inverted = false, size = 'md' }) {
  const { t } = useLang()
  const [imgFailed, setImgFailed] = useState(false)
  const { logoMark, showWordmark, showTagline } = company

  const markClass = showWordmark
    ? 'size-9 shrink-0 object-contain transition-transform duration-300 group-hover:scale-105 sm:size-11'
    : `h-16 w-auto max-w-[50vw] shrink-0 object-contain transition-transform duration-300 group-hover:scale-105 ${
        size === 'md' ? 'sm:h-20' : ''
      }`

  return (
    <a href="#top" className="group flex shrink-0 items-center gap-2.5" aria-label={t(company.nameKey)}>
      {imgFailed ? (
        <span className="relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-soft transition-transform duration-300 group-hover:scale-105">
          <svg viewBox="0 0 40 40" className="size-7" aria-hidden="true">
            <path d="M20 8v24M8 20h24" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
            <path
              d="M6 26h6l3-6 4 11 4-14 3 9h8"
              fill="none"
              stroke="#a7f3d0"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      ) : (
        <img
          src={logoMark}
          alt=""
          width="80"
          height="80"
          className={markClass}
          onError={() => setImgFailed(true)}
        />
      )}
      {!compact && showTagline && (
        <span className="flex flex-col leading-none">
          {showWordmark && (
            <span
              className={`text-lg font-extrabold tracking-tight ${inverted ? 'text-white' : 'text-ink-900'}`}
            >
              {t(company.nameKey)}
            </span>
          )}
          <span
            className={`${showWordmark ? 'mt-0.5 ' : ''}text-[11px] font-medium ${inverted ? 'text-brand-100' : 'text-brand-600'}`}
          >
            {t(company.taglineKey)}
          </span>
        </span>
      )}
    </a>
  )
}
