import {
  BadgePercent,
  Copy,
  GraduationCap,
  Quote,
  Sparkles,
  Truck,
  Wallet,
  Check,
  Headset,
} from 'lucide-react'
import { useState } from 'react'
import { useLang } from '../context/LanguageContext.jsx'
import ProductArt from './ProductArt.jsx'

const pointIcons = {
  free: Truck,
  verify: Check,
  installments: Wallet,
  support: Headset,
}

export default function StudentBanner({ onQuote }) {
  const { t } = useLang()
  const [copied, setCopied] = useState(false)

  const points = ['free', 'verify', 'installments', 'support']

  function copyCode() {
    const code = t('student.codeValue')
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(code).catch(() => {})
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section id="students" className="container-x py-12 sm:py-16">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-800 to-ink-950 shadow-lift">
        <div
          className="pointer-events-none absolute -top-16 -start-10 size-64 rounded-full bg-white/10 blur-2xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-24 end-0 size-80 rounded-full bg-deal-500/20 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative grid items-center gap-8 p-6 sm:p-9 lg:grid-cols-12 lg:p-12">
          <div className="lg:col-span-7">
            <span className="chip mb-4 bg-white/15 text-white backdrop-blur">
              <GraduationCap className="size-4" aria-hidden="true" />
              {t('student.badge')}
            </span>

            <h2 className="text-2xl leading-tight font-extrabold text-white sm:text-3xl lg:text-[38px]">
              {t('student.title')}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
              {t('student.subtitle')}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-2xl border-2 border-dashed border-white/40 bg-white/10 px-4 py-2.5 backdrop-blur">
                <span className="text-xs font-bold text-white/70">{t('student.code')}</span>
                <span className="ltr-nums text-base font-extrabold tracking-wider text-white">
                  {t('student.codeValue')}
                </span>
                <button
                  type="button"
                  onClick={copyCode}
                  aria-label={t('student.codeValue')}
                  className="grid size-8 place-items-center rounded-lg bg-white/15 text-white transition-colors hover:bg-white/30"
                >
                  {copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
                </button>
              </div>
              <a href="#bestsellers" className="btn bg-white px-5 py-3 text-brand-700 hover:bg-brand-50">
                <Sparkles className="size-4" aria-hidden="true" />
                {t('student.cta')}
              </a>
              <button
                type="button"
                onClick={() => onQuote?.()}
                className="btn border border-white/25 bg-white/10 px-5 py-3 text-white hover:bg-white/20"
              >
                <Quote className="size-4" aria-hidden="true" />
                {t('student.secondaryCta')}
              </button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative mx-auto aspect-4/3 w-full max-w-md overflow-hidden rounded-2xl border border-white/15">
              <ProductArt kind="stethoscope" palette="violet" className="size-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950/85 to-transparent p-4 pt-10">
                <div className="grid grid-cols-2 gap-2">
                  {points.map((key) => {
                    const Icon = pointIcons[key]
                    return (
                      <div key={key} className="flex items-start gap-2">
                        <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-white/15 text-white">
                          <Icon className="size-3.5" aria-hidden="true" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[11px] font-extrabold text-white">{t(`student.points.${key}`)}</span>
                          <span className="block text-[10px] leading-4 text-white/70">
                            {t(`student.points.${key}Desc`)}
                          </span>
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
