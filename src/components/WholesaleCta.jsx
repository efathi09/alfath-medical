import { Building2, Download, FileText, Percent } from 'lucide-react'
import { useLang } from '../context/LanguageContext.jsx'
import { useCompany } from '../context/DataContext.jsx'

export default function WholesaleCta({ onQuote }) {
  const { t, lang } = useLang()
  const company = useCompany()

  return (
    <section id="wholesale" className="container-x py-12 sm:py-14">
      <div className="relative overflow-hidden rounded-3xl border border-ink-100 bg-white p-6 shadow-soft sm:p-10">
        <div
          className="pointer-events-none absolute -top-20 -end-16 size-72 rounded-full bg-brand-100/60 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-brand-600 text-white shadow-soft">
              <Building2 className="size-7" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-xl font-extrabold sm:text-2xl">{t('cta.title')}</h2>
              <p className="mt-1.5 max-w-2xl text-sm leading-6 text-ink-500">{t('cta.subtitle')}</p>
              <p className="mt-3 flex flex-wrap items-center gap-3 text-xs font-bold text-ink-500">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-deal-50 px-2.5 py-1.5 text-deal-600">
                  <Percent className="size-3.5" aria-hidden="true" />
                  {lang === 'ar' ? 'حتى ٤٠٪' : 'Up to 40%'}
                </span>
                <span className="ltr-nums">{company.phone}</span>
                {company.email && <span className="ltr-nums">{company.email}</span>}
              </p>
            </div>
          </div>

          <div className="flex w-full shrink-0 flex-col gap-2.5 sm:w-auto sm:flex-row">
            <button type="button" onClick={() => onQuote?.()} className="btn-accent px-6 py-3">
              <FileText className="size-4" aria-hidden="true" />
              {t('cta.button')}
            </button>
            <a href="#bestsellers" className="btn-outline px-6 py-3">
              <Download className="size-4" aria-hidden="true" />
              {t('cta.secondary')}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
