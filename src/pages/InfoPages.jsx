import { INFO_PAGES } from './infoContent.js'
import { useLang } from '../context/LanguageContext.jsx'
import { useCompany } from '../context/DataContext.jsx'

function renderValue(value, lang) {
  if (value && typeof value === 'object') return value[lang] ?? value.ar ?? ''
  return String(value ?? '')
}

function Section({ section, lang }) {
  const heading = renderValue(section.h, lang)
  return (
    <section className="rounded-2xl bg-white p-5 shadow-soft sm:p-6">
      {heading && <h2 className="mb-3 text-base font-extrabold text-ink-900">{heading}</h2>}
      {section.p?.map((para, i) => (
        <p key={i} className="mb-3 text-sm leading-7 text-ink-600 last:mb-0">
          {renderValue(para, lang)}
        </p>
      ))}
      {section.list && (
        <ul className="space-y-2.5">
          {section.list.map((item, i) => (
            <li key={i} className="flex gap-2.5 text-sm leading-6 text-ink-600">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden="true" />
              <span>{renderValue(item, lang)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

/** Full page for `#/privacy`, `#/terms`, … */
export function InfoPage({ slug }) {
  const { t, lang } = useLang()
  const page = INFO_PAGES[slug]
  if (!page) return null
  const Icon = page.icon

  return (
    <div className="container-x max-w-4xl py-8 sm:py-12">
      <a
        href="#/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-bold text-brand-700 transition-colors hover:text-brand-800"
      >
        {lang === 'ar' ? '→ العودة للمتجر' : '→ Back to the store'}
      </a>

      <header className="mb-6 flex items-start gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-600">
          <Icon className="size-6" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold text-ink-900 sm:text-3xl">
            {renderValue(page.title, lang)}
          </h1>
          <p className="mt-1.5 text-sm leading-6 text-ink-500">{renderValue(page.lead, lang)}</p>
        </div>
      </header>

      <div className="space-y-4">
        {page.sections.map((section, i) => (
          <Section key={i} section={section} lang={lang} />
        ))}
      </div>

      <p className="mt-6 text-xs text-ink-400">
        {lang === 'ar' ? 'آخر تحديث: ' : 'Last updated: '}
        {new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG' : 'en-GB', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }).format(new Date())}
      </p>

      <p className="sr-only">{t('brand.name')}</p>
    </div>
  )
}

/** Rendered for any `#/…` that is not a known page. */
export function NotFoundPage() {
  const { lang } = useLang()
  const company = useCompany()

  return (
    <div className="container-x grid max-w-2xl place-items-center gap-4 py-16 text-center sm:py-24">
      <p className="num text-6xl font-extrabold text-brand-600">404</p>
      <h1 className="text-xl font-extrabold text-ink-900 sm:text-2xl">
        {lang === 'ar' ? 'الصفحة مش موجودة' : 'Page not found'}
      </h1>
      <p className="max-w-md text-sm leading-6 text-ink-500">
        {lang === 'ar'
          ? 'الرابط ده مش صحيح أو الصفحة اتشالت. تقدر ترجع للمتجر وتكمل تسوّق.'
          : 'This link is wrong or the page was removed. Head back to the store and keep shopping.'}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <a href="#/" className="rounded-xl bg-brand-600 px-5 py-3 text-sm font-bold text-white active:scale-[0.98]">
          {lang === 'ar' ? 'العودة للمتجر' : 'Back to the store'}
        </a>
        <a
          href={`https://wa.me/${company.whatsapp}`}
          target="_blank"
          rel="noreferrer noopener"
          className="rounded-xl border border-ink-200 bg-white px-5 py-3 text-sm font-bold text-ink-700 active:scale-[0.98]"
        >
          {lang === 'ar' ? 'تواصل معنا' : 'Contact us'}
        </a>
      </div>
      <div className="mt-2 flex flex-wrap justify-center gap-1.5">
        {Object.keys(INFO_PAGES).map((slug) => (
          <a
            key={slug}
            href={`#/${slug}`}
            className="rounded-full border border-ink-200 bg-white px-3 py-1.5 text-[11px] font-bold text-ink-500 transition-colors hover:border-brand-500 hover:text-brand-700"
          >
            {renderValue(INFO_PAGES[slug].title, lang)}
          </a>
        ))}
      </div>
    </div>
  )
}
