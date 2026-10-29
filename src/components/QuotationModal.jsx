import { useEffect, useMemo, useState } from 'react'
import {
  Building2,
  CheckCircle2,
  FileText,
  MessageCircle,
  Minus,
  Phone,
  Plus,
  Send,
  Trash2,
  X,
} from 'lucide-react'
import { useLang, useLocalizer } from '../context/LanguageContext.jsx'
import { useStore } from '../context/StoreContext.jsx'
import { useData, useCompany } from '../context/DataContext.jsx'
import { getProduct } from '../data/products.js'
import { apiUrl } from '../lib/api.js'
import ProductArt from './ProductArt.jsx'

const emptyForm = { name: '', phone: '', email: '', company: '', notes: '' }

export default function QuotationModal() {
  const { t } = useLang()
  const localize = useLocalizer()
  const { products } = useData()
  const company = useCompany()
  const { quoteTarget, closeQuote, quoteList, addToQuote, removeFromQuote, notify } = useStore()
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [waHref, setWaHref] = useState('')

  const open = Boolean(quoteTarget)

  const lines = useMemo(() => {
    if (!open) return []
    if (quoteTarget.multi) return quoteList
    const product = quoteTarget.product
    return product ? [{ id: product.id, qty: quoteTarget.qty ?? product.minOrder * 10, product }] : []
  }, [open, quoteTarget, quoteList])

  useEffect(() => {
    if (!open) return undefined
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    function onKey(event) {
      if (event.key === 'Escape') closeQuote()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      document.removeEventListener('keydown', onKey)
    }
  }, [open, closeQuote])

  useEffect(() => {
    if (!open) {
      window.setTimeout(() => {
        setForm(emptyForm)
        setErrors({})
        setSent(false)
        setSubmitting(false)
        setWaHref('')
      }, 250)
    }
  }, [open])

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = {}
    if (!form.name.trim()) nextErrors.name = t('quote.required')
    if (!form.phone.trim()) nextErrors.phone = t('quote.required')
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) {
      nextErrors.email = t('newsletter.invalid')
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    const items = lines.map((line) => {
      const product = line.product ?? getProduct(line.id, products)
      return {
        id: line.id,
        name: product?.name?.ar ?? (typeof line.name === 'string' ? line.name : ''),
        nameEn: product?.name?.en ?? (typeof line.nameEn === 'string' ? line.nameEn : ''),
        qty: line.qty,
      }
    })

    const summary = lines
      .map((line) => {
        const product = line.product ?? getProduct(line.id, products)
        const label = product ? localize(product, 'name') : line.id
        return `- ${label} x${line.qty}`
      })
      .join('\n')
    const header = [form.name, form.phone, form.company].filter(Boolean).join(' - ')
    const waText = `${t('quote.title')}\n${header}\n${summary}${form.notes ? `\n${form.notes}` : ''}`
    setWaHref(`https://wa.me/${company.whatsapp}?text=${encodeURIComponent(waText)}`)

    setSubmitting(true)
    try {
      await fetch(apiUrl('/api/quote'), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          company: form.company.trim(),
          notes: form.notes.trim(),
          items,
        }),
      })
    } catch {
      // Offline / API unavailable: keep the confirmation and let the customer
      // fall back to WhatsApp from the success screen.
    }
    setSubmitting(false)
    setSent(true)
    notify(t('toast.quoteSent'))
  }

  function adjustQty(id, delta) {
    const line = lines.find((item) => item.id === id)
    if (!line) return
    const next = Math.max(1, line.qty + delta)
    const product = line.product ?? getProduct(line.id, products)
    if (product) addToQuote(product, next)
  }

  function handleRemove(id) {
    if (!quoteTarget?.multi) {
      closeQuote()
      return
    }
    removeFromQuote(id)
  }

  const fieldClass =
    'w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-800 transition-colors placeholder:text-ink-400 focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-100'

  return (
    <>
      <div
        className={`fixed inset-0 z-95 bg-ink-950/60 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={closeQuote}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="quote-title"
        aria-hidden={!open}
        className={`fixed inset-x-0 bottom-0 z-100 mx-auto flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-lift transition-all duration-300 sm:inset-0 sm:max-h-[88vh] sm:rounded-3xl ${
          open
            ? 'visible translate-y-0 opacity-100'
            : 'invisible translate-y-full opacity-0 sm:translate-y-8 sm:scale-95'
        }`}
      >
        <header className="flex items-start justify-between gap-4 bg-gradient-to-br from-deal-500 to-deal-600 px-5 py-4 text-white sm:px-6">
          <div className="min-w-0">
            <h2 id="quote-title" className="flex items-center gap-2 text-lg font-extrabold">
              <FileText className="size-5 shrink-0" aria-hidden="true" />
              {t('quote.title')}
            </h2>
            <p className="mt-1 text-xs text-white/85 sm:text-sm">{t('quote.subtitle')}</p>
          </div>
          <button
            type="button"
            onClick={closeQuote}
            className="grid size-9 shrink-0 place-items-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/30"
            aria-label={t('quote.close')}
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[13px] font-extrabold text-ink-900">
                {quoteTarget?.multi ? t('quote.multiple') : t('quote.product')}
              </p>
              <p className="text-xs text-ink-500">
                {quoteTarget?.multi ? t('quote.multipleDesc') : t('product.bulkNote')}
              </p>
            </div>
            <span className="chip shrink-0 bg-brand-50 text-brand-700">
              <span className="num">{lines.length}</span> {t('product.resultsCount')}
            </span>
          </div>

          {lines.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-ink-200 bg-ink-50 px-5 py-8 text-center">
              <p className="text-sm font-bold text-ink-700">{t('cart.emptyDesc')}</p>
            </div>
          ) : (
            <ul className="mb-5 space-y-2">
              {lines.map((line) => {
                const product = line.product ?? getProduct(line.id, products)
                if (!product) return null
                return (
                  <li
                    key={line.id}
                    className="flex items-center gap-3 rounded-2xl border border-ink-100 bg-ink-50/70 p-2.5"
                  >
                    <ProductArt
                      kind={product.art}
                      palette={product.palette}
                      className="size-14 shrink-0 rounded-xl"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-[13px] font-bold text-ink-900">
                        {localize(product, 'name')}
                      </p>
                      <p className="ltr-nums text-[11px] text-ink-400">
                        {product.sku} · {t('product.minOrder')} {product.minOrder}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center rounded-lg border border-ink-200 bg-white">
                        <button
                          type="button"
                          onClick={() => adjustQty(line.id, -10)}
                          aria-label="-"
                          className="grid size-7 place-items-center rounded-s-lg text-ink-600 hover:bg-ink-100"
                        >
                          <Minus className="size-3" aria-hidden="true" />
                        </button>
                        <span className="num w-12 text-center text-xs font-extrabold text-ink-900">
                          {line.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => adjustQty(line.id, 10)}
                          aria-label="+"
                          className="grid size-7 place-items-center rounded-e-lg text-ink-600 hover:bg-ink-100"
                        >
                          <Plus className="size-3" aria-hidden="true" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemove(line.id)}
                        aria-label={`${t('cart.remove')}: ${localize(product, 'name')}`}
                        className="grid size-8 place-items-center rounded-lg text-ink-400 hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}

          {sent ? (
            <div className="rounded-2xl bg-brand-50 px-5 py-8 text-center">
              <CheckCircle2 className="mx-auto size-12 text-brand-600" aria-hidden="true" />
              <p className="mt-3 text-base font-extrabold text-brand-800">{t('quote.success')}</p>
              <p className="mt-1 text-sm text-brand-700/80">{t('quote.subtitle')}</p>
              {waHref && (
                <a
                  href={waHref}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="btn mt-4 w-full bg-[#1FA855] py-2.5 text-white hover:bg-[#17924a]"
                >
                  <MessageCircle className="size-4" aria-hidden="true" />
                  {t('quote.whatsappFallback')}
                </a>
              )}
              <button type="button" onClick={closeQuote} className="btn-primary mt-3 px-6 py-2.5">
                {t('common.close')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold text-ink-700">{t('quote.name')}</span>
                  <input
                    className={fieldClass}
                    value={form.name}
                    onChange={(event) => update('name', event.target.value)}
                    aria-invalid={Boolean(errors.name)}
                  />
                  {errors.name && <span className="mt-1 block text-xs text-rose-600">{errors.name}</span>}
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold text-ink-700">{t('quote.phone')}</span>
                  <input
                    type="tel"
                    inputMode="tel"
                    dir="ltr"
                    className={`${fieldClass} ltr-nums`}
                    value={form.phone}
                    onChange={(event) => update('phone', event.target.value)}
                    aria-invalid={Boolean(errors.phone)}
                  />
                  {errors.phone && <span className="mt-1 block text-xs text-rose-600">{errors.phone}</span>}
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold text-ink-700">{t('quote.email')}</span>
                  <input
                    type="email"
                    dir="ltr"
                    className={`${fieldClass} ltr-nums`}
                    value={form.email}
                    onChange={(event) => update('email', event.target.value)}
                    aria-invalid={Boolean(errors.email)}
                  />
                  {errors.email && <span className="mt-1 block text-xs text-rose-600">{errors.email}</span>}
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold text-ink-700">{t('quote.company')}</span>
                  <div className="relative">
                    <Building2
                      className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-ink-400"
                      aria-hidden="true"
                    />
                    <input
                      className={`${fieldClass} ps-9`}
                      value={form.company}
                      onChange={(event) => update('company', event.target.value)}
                    />
                  </div>
                </label>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-ink-700">{t('quote.notes')}</span>
                <textarea
                  rows={3}
                  className={`${fieldClass} resize-none`}
                  placeholder={t('quote.notesPlaceholder')}
                  value={form.notes}
                  onChange={(event) => update('notes', event.target.value)}
                />
              </label>

              <p className="flex items-center gap-2 rounded-xl bg-ink-50 px-3 py-2.5 text-xs font-bold text-ink-600">
                <Phone className="size-4 shrink-0 text-brand-600" aria-hidden="true" />
                {t('quote.bulkHint')} <span className="ltr-nums">{company.phone}</span>
              </p>

              <button type="submit" className="btn-accent w-full py-3" disabled={submitting}>
                <Send className="size-4" aria-hidden="true" />
                {submitting ? t('quote.sending') : t('quote.submit')}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  )
}
