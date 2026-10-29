import { useState } from 'react'
import {
  ArrowUp,
  Check,
  CreditCard,
  Headset,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
} from 'lucide-react'
import { useLang, useLocalizer } from '../context/LanguageContext.jsx'
import { useData, useCompany } from '../context/DataContext.jsx'
import { quickLinks } from '../data/categories.js'
import { apiUrl } from '../lib/api.js'
import { brandIcons } from './ui/BrandIcons.jsx'
import Logo from './ui/Logo.jsx'

/**
 * Legal identifiers come from src/data/company.js. Until the real number is
 * filled in the value is a placeholder like "N/A", and a placeholder must never
 * be published in the footer of a shop.
 */
function isReal(value) {
  const text = String(value ?? '').trim()
  if (!text) return false
  return !/^(n\/?a|tbd|todo|-+|unknown|غير متاح|يُذكر|placeholder)$/i.test(text)
}

function PaymentBadge({ id, label, labelEn }) {
  const { lang } = useLang()
  const text = lang === 'ar' ? label : labelEn ?? label
  const skin = {
    visa: 'bg-blue-800 text-white',
    mastercard: 'bg-ink-900 text-white',
    applepay: 'bg-ink-800 text-white',
    cod: 'bg-white text-ink-700 border border-ink-200',
  }[id]

  return (
    <span
      className={`ltr-nums inline-flex h-8 items-center rounded-lg px-3 text-[11px] font-extrabold tracking-wide ${skin}`}
      title={text}
    >
      {text}
    </span>
  )
}

function LinkColumn({ title, links, onNavigate }) {
  return (
    <div>
      <h3 className="mb-4 text-sm font-extrabold text-ink-900">{title}</h3>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.id ?? link.label}>
            {link.href ? (
              <a
                href={link.href}
                className="text-[13px] text-ink-600 transition-colors hover:text-brand-700"
              >
                {link.label}
              </a>
            ) : (
              <button
                type="button"
                onClick={() => onNavigate?.(link.id)}
                className="text-start text-[13px] text-ink-600 transition-colors hover:text-brand-700"
              >
                {link.label}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Footer({ onNavigate }) {
  const { t, lang } = useLang()
  const localize = useLocalizer()
  const { categories } = useData()
  const company = useCompany()
  const [email, setEmail] = useState('')
  // idle | invalid | sending | done | error
  const [state, setState] = useState('idle')

  async function submit(event) {
    event.preventDefault()
    const value = email.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      setState('invalid')
      return
    }
    setState('sending')
    try {
      const res = await fetch(apiUrl('/api/newsletter'), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: value }),
      })
      if (!res.ok) throw new Error(`HTTP_${res.status}`)
      setState('done')
      setEmail('')
    } catch {
      setState('error')
    }
  }

  const quick = [
    { id: 'flash', label: t('nav.flash'), href: '#flash' },
    { id: 'bestsellers', label: t('nav.newArrivals'), href: '#bestsellers' },
    { id: 'students', label: t('nav.student'), href: '#students' },
    { id: 'brands', label: t('nav.brands'), href: '#brands' },
    { id: 'about', label: t('nav.about'), href: '#/about' },
    { id: 'contact', label: t('nav.contact'), href: '#/contact' },
  ]

  // Real pages — src/lib/useHashRoute.js + src/pages/InfoPages.jsx.
  // Only social networks with a real URL are shown — no dead links.
  const socialLinks = (company.social ?? [])
    .map((id) => ({ id, href: (company.socialLinks ?? {})[id] }))
    .filter((entry) => Boolean(entry.href))

  const service = [
    { id: 'shipping', label: t('nav.shipping'), href: '#/shipping' },
    { id: 'returns', label: t('nav.policy'), href: '#/returns' },
    { id: 'payment', label: t('nav.payment'), href: '#/payment' },
    { id: 'faq', label: t('nav.faq'), href: '#/faq' },
    { id: 'privacy', label: t('nav.privacy'), href: '#/privacy' },
    { id: 'terms', label: t('nav.terms'), href: '#/terms' },
  ]

  return (
    <footer className="border-t border-ink-200 bg-ink-50 text-ink-800">
      <div className="border-b border-ink-200 bg-white">
        <div className="container-x py-10">
          <div className="grid items-center gap-6 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <h2 className="text-xl font-extrabold sm:text-2xl">{t('newsletter.title')}</h2>
              <p className="mt-1.5 text-sm text-ink-600">{t('newsletter.subtitle')}</p>
              <p className="mt-3 flex items-center gap-1.5 text-[11px] text-ink-500">
                <Check className="size-3.5 text-brand-600" aria-hidden="true" />
                {t('newsletter.privacy')}
              </p>
            </div>

            <div className="lg:col-span-7">
              {state === 'done' ? (
                <p className="flex items-center gap-2 rounded-2xl bg-brand-50 px-5 py-4 text-sm font-bold text-brand-700">
                  <Check className="size-5 shrink-0" aria-hidden="true" />
                  {t('newsletter.success')}
                </p>
              ) : (
                <form onSubmit={submit} noValidate className="w-full">
                  <div className="flex flex-col gap-2.5 sm:flex-row">
                    <div className="relative flex-1">
                      <Mail
                        className="pointer-events-none absolute start-4 top-1/2 size-4.5 -translate-y-1/2 text-ink-400"
                        aria-hidden="true"
                      />
                      <input
                        type="email"
                        dir="ltr"
                        value={email}
                        onChange={(event) => {
                          setEmail(event.target.value)
                          if (state === 'invalid' || state === 'error') setState('idle')
                        }}
                        placeholder={t('newsletter.placeholder')}
                        aria-label={t('newsletter.placeholder')}
                        aria-invalid={state === 'invalid'}
                        className="ltr-nums h-13 w-full rounded-2xl border border-ink-200 bg-white py-3.5 pe-4 ps-12 text-sm text-ink-700 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/20"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={state === 'sending'}
                      className="btn-accent h-13 shrink-0 px-7 disabled:opacity-60"
                    >
                      <Send className="size-4" aria-hidden="true" />
                      {state === 'sending' ? t('newsletter.sending') : t('newsletter.button')}
                    </button>
                  </div>
                  {state === 'invalid' && (
                    <p className="mt-2 text-xs font-bold text-rose-600">{t('newsletter.invalid')}</p>
                  )}
                  {state === 'error' && (
                    <p className="mt-2 text-xs font-bold text-rose-600">{t('newsletter.error')}</p>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container-x grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Logo size="sm" />
          <p className="mt-4 max-w-md text-[13px] leading-7 text-ink-500">{t('footer.about')}</p>

          {socialLinks.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {socialLinks.map(({ id, href }) => {
                const Icon = brandIcons[id]
                if (!Icon) return null
                return (
                  <a
                    key={id}
                    href={href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={id}
                    className="grid size-9 place-items-center rounded-xl border border-ink-200 bg-white text-ink-600 transition-colors hover:border-brand-600 hover:bg-brand-600 hover:text-white"
                  >
                    <Icon className="size-4" aria-hidden="true" />
                  </a>
                )
              })}
            </div>
          )}

          <a
            href={`https://wa.me/${company.whatsapp}`}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-6 flex items-center gap-3 rounded-2xl border border-[#1FA855]/40 bg-[#1FA855]/10 p-3.5 transition-colors hover:bg-[#1FA855]/20"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#1FA855] text-white">
              <MessageCircle className="size-5" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block text-[13px] font-extrabold">{t('footer.whatsappCta')}</span>
              <span className="ltr-nums block text-[11px] text-ink-500">{company.phone}</span>
            </span>
          </a>
        </div>

        <div className="lg:col-span-2">
          <LinkColumn title={t('footer.quickLinks')} links={quick} onNavigate={onNavigate} />
        </div>

        <div className="lg:col-span-2">
          <LinkColumn title={t('footer.customerService')} links={service} onNavigate={onNavigate} />
        </div>

        <div className="lg:col-span-2">
          <h3 className="mb-4 text-sm font-extrabold text-ink-900">{t('footer.categories')}</h3>
          <ul className="space-y-2.5">
            {categories.map((category) => (
              <li key={category.id}>
                <button
                  type="button"
                  onClick={() => onNavigate?.(category.id)}
                  className="text-start text-[13px] text-ink-600 transition-colors hover:text-brand-700"
                >
                  {localize(category, 'name')}
                </button>
              </li>
            ))}
            {quickLinks.slice(0, 2).map((link) => (
              <li key={link.id}>
                <a href={link.href} className="text-[13px] text-ink-600 transition-colors hover:text-brand-700">
                  {localize(link, 'label')}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div id="footer-contact" className="lg:col-span-2">
          <h3 className="mb-4 text-sm font-extrabold text-ink-900">{t('footer.contact')}</h3>
          <ul className="space-y-3.5 text-[13px] text-ink-600">
            <li className="flex gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden="true" />
              <span className="leading-6">{company.address[lang]}</span>
            </li>
            <li className="flex gap-2.5">
              <Phone className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden="true" />
              <a href={`tel:${company.phoneHref}`} className="ltr-nums transition-colors hover:text-brand-700">
                {company.phone}
              </a>
            </li>
            {company.email && (
              <li className="flex gap-2.5">
                <Mail className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden="true" />
                <a href={`mailto:${company.email}`} className="ltr-nums transition-colors hover:text-brand-700">
                  {company.email}
                </a>
              </li>
            )}
            <li className="flex gap-2.5">
              <Headset className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden="true" />
              <span className="leading-6">{company.workingHours[lang]}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-ink-200">
        <div className="container-x flex flex-col gap-5 py-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2.5">
            <CreditCard className="size-4 shrink-0 text-ink-400" aria-hidden="true" />
            <span className="me-1 text-[11px] font-bold text-ink-500">{t('footer.payments')}</span>
            {company.payments.map((payment) => (
              <PaymentBadge key={payment.id} {...payment} />
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-ink-500">
            {isReal(company.cr) && (
              <span className="ltr-nums">
                {t('footer.cr')}: {company.cr}
              </span>
            )}
            {isReal(company.vat) && (
              <span className="ltr-nums">
                {t('footer.vat')}: {company.vat}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-ink-200">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-5 text-center text-[11px] text-ink-500 sm:flex-row sm:text-start">
          <p>
            © <span className="num">2026</span> {t('brand.name')} — {t('footer.rights')}
          </p>
          <p className="flex items-center gap-3">
            <span>{t('footer.madeWith')}</span>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 transition-colors hover:bg-white hover:text-ink-900"
            >
              {t('common.backToTop')}
              <ArrowUp className="size-3.5" aria-hidden="true" />
            </button>
          </p>
        </div>
      </div>
    </footer>
  )
}
