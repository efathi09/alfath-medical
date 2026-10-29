import { useEffect, useState } from 'react'
import { Plus, Save, Settings, Trash2 } from 'lucide-react'
import { adminApi } from './adminApi.js'
import { useAdminT } from './adminText.js'
import { Field, PageLoader, TextInput, Toggle } from './ui.jsx'

const PAYMENT_LABELS = {
  cod: { id: 'cod', label: 'الدفع عند الاستلام', labelEn: 'Cash on delivery' },
  visa: { id: 'visa', label: 'VISA', labelEn: 'VISA' },
  mastercard: { id: 'mastercard', label: 'Mastercard', labelEn: 'Mastercard' },
  applepay: { id: 'applepay', label: 'Apple Pay', labelEn: 'Apple Pay' },
  giftcard: { id: 'giftcard', label: 'بطاقة هدايا', labelEn: 'Gift card' },
}

const TRUST_ICONS = {
  shipping: 'Truck',
  warranty: 'ShieldCheck',
  support: 'Headset',
  secure: 'LockKeyhole',
  bulk: 'Percent',
}

const splitList = (value) =>
  String(value ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

function toForm(settings) {
  return {
    phone: settings.phone ?? '',
    phoneHref: settings.phoneHref ?? '',
    whatsapp: settings.whatsapp ?? '',
    email: settings.email ?? '',
    addressAr: settings.address?.ar ?? '',
    addressEn: settings.address?.en ?? '',
    hoursAr: settings.workingHours?.ar ?? '',
    hoursEn: settings.workingHours?.en ?? '',
    vat: settings.vat ?? '',
    cr: settings.cr ?? '',
    social: (settings.social ?? []).join(', '),
    payments: (settings.payments ?? []).map((p) => p.id).join(', '),
    trustBadges: (settings.trustBadges ?? []).map((b) => b.key ?? b).join(', '),
    banners: (Array.isArray(settings.banners) ? settings.banners : []).map((b) => ({
      id: b.id ?? `bn-${Math.random().toString(36).slice(2, 8)}`,
      href: b.href ?? '#bestsellers',
      palette: b.palette ?? 'teal',
      art: b.art ?? 'monitor',
      kicker: { ar: b.kicker?.ar ?? '', en: b.kicker?.en ?? '' },
      title: { ar: b.title?.ar ?? '', en: b.title?.en ?? '' },
      sub: { ar: b.sub?.ar ?? '', en: b.sub?.en ?? '' },
      cta: { ar: b.cta?.ar ?? '', en: b.cta?.en ?? '' },
      titleKey: b.titleKey ?? '',
      subKey: b.subKey ?? '',
      ctaKey: b.ctaKey ?? '',
      isActive: b.isActive ?? true,
      sortOrder: b.sortOrder ?? 0,
    })),
  }
}

function newBanner(index) {
  return {
    id: `bn-${Date.now()}`,
    href: '#bestsellers',
    palette: 'teal',
    art: 'monitor',
    kicker: { ar: '', en: '' },
    title: { ar: '', en: '' },
    sub: { ar: '', en: '' },
    cta: { ar: '', en: '' },
    titleKey: '',
    subKey: '',
    ctaKey: '',
    isActive: true,
    sortOrder: index,
  }
}

export default function SettingsAdmin() {
  const t = useAdminT()
  const [form, setForm] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    let alive = true
    adminApi
      .getSettings()
      .then((settings) => {
        if (alive) setForm(toForm(settings))
      })
      .catch(() => {
        if (!alive) return
        setError(t('common.error'))
        setForm(false)
      })
    return () => {
      alive = false
    }
  }, [t])

  function set(key) {
    return (event) => {
      const value = event?.target ? event.target.value : event
      setForm((prev) => ({ ...prev, [key]: value }))
      setSaved(false)
    }
  }

  function patchBanner(index, updater) {
    setForm((prev) => ({
      ...prev,
      banners: prev.banners.map((b, i) => (i === index ? updater(b) : b)),
    }))
    setSaved(false)
  }

  function addBanner() {
    setForm((prev) => ({ ...prev, banners: [...prev.banners, newBanner(prev.banners.length)] }))
  }

  function removeBanner(index) {
    setForm((prev) => ({ ...prev, banners: prev.banners.filter((_, i) => i !== index) }))
  }

  async function save(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setSaved(false)
    const payload = {
      phone: form.phone,
      phoneHref: form.phoneHref,
      whatsapp: form.whatsapp,
      email: form.email,
      address: { ar: form.addressAr, en: form.addressEn },
      workingHours: { ar: form.hoursAr, en: form.hoursEn },
      vat: form.vat,
      cr: form.cr,
      social: splitList(form.social),
      payments: splitList(form.payments).map(
        (id) => PAYMENT_LABELS[id] ?? { id, label: id, labelEn: id },
      ),
      trustBadges: splitList(form.trustBadges).map((key) => ({
        key,
        icon: TRUST_ICONS[key] ?? 'ShieldCheck',
      })),
      banners: form.banners.map((b, i) => ({ ...b, sortOrder: i })),
    }
    try {
      await adminApi.updateSettings(payload)
      setSaved(true)
    } catch {
      setError(t('common.error'))
    } finally {
      setBusy(false)
    }
  }

  if (form === null) return <PageLoader />
  if (form === false) return <p className="text-sm font-bold text-rose-600">{error}</p>

  return (
    <form onSubmit={save} className="flex flex-col gap-5 pb-20">
      {error && <p className="text-sm font-bold text-rose-600">{error}</p>}
      {saved && <p className="text-sm font-bold text-brand-700">{t('set.saved')}</p>}

      <section className="card p-5">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-extrabold text-ink-900">
          <Settings className="size-4 text-brand-600" aria-hidden="true" />
          {t('set.contact')}
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t('set.phone')}>
            <TextInput value={form.phone} onChange={set('phone')} dir="ltr" />
          </Field>
          <Field label={t('set.phoneHref')}>
            <TextInput value={form.phoneHref} onChange={set('phoneHref')} dir="ltr" />
          </Field>
          <Field label={t('set.whatsapp')}>
            <TextInput value={form.whatsapp} onChange={set('whatsapp')} dir="ltr" />
          </Field>
          <Field label={t('set.email')}>
            <TextInput type="email" value={form.email} onChange={set('email')} dir="ltr" />
          </Field>
          <Field label={t('set.addressAr')}>
            <TextInput value={form.addressAr} onChange={set('addressAr')} />
          </Field>
          <Field label={t('set.addressEn')}>
            <TextInput value={form.addressEn} onChange={set('addressEn')} dir="ltr" />
          </Field>
          <Field label={t('set.hoursAr')}>
            <TextInput value={form.hoursAr} onChange={set('hoursAr')} />
          </Field>
          <Field label={t('set.hoursEn')}>
            <TextInput value={form.hoursEn} onChange={set('hoursEn')} dir="ltr" />
          </Field>
        </div>
      </section>

      <section className="card p-5">
        <h3 className="mb-4 text-sm font-extrabold text-ink-900">{t('set.legal')}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t('set.vat')}>
            <TextInput value={form.vat} onChange={set('vat')} dir="ltr" />
          </Field>
          <Field label={t('set.cr')}>
            <TextInput value={form.cr} onChange={set('cr')} dir="ltr" />
          </Field>
        </div>
      </section>

      <section className="card p-5">
        <div className="grid gap-4">
          <Field label={t('set.social')} hint={t('set.socialHint')}>
            <TextInput value={form.social} onChange={set('social')} dir="ltr" />
          </Field>
          <Field label={t('set.payments')} hint={t('set.paymentsHint')}>
            <TextInput value={form.payments} onChange={set('payments')} dir="ltr" />
          </Field>
          <Field label={t('set.trust')} hint={t('set.trustHint')}>
            <TextInput value={form.trustBadges} onChange={set('trustBadges')} dir="ltr" />
          </Field>
        </div>
      </section>

      <section className="card p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-sm font-extrabold text-ink-900">{t('set.banners')}</h3>
          <button type="button" onClick={addBanner} className="btn-outline px-3 py-2">
            <Plus className="size-4" aria-hidden="true" />
            {t('set.addBanner')}
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {form.banners.map((banner, index) => (
            <div key={banner.id} className="rounded-2xl border border-ink-100 bg-ink-50/40 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="num text-xs font-bold text-ink-400">#{index + 1}</span>
                <div className="flex items-center gap-3">
                  <Toggle
                    checked={banner.isActive}
                    onChange={(v) => patchBanner(index, (b) => ({ ...b, isActive: v }))}
                    label={t('common.active')}
                  />
                  <button
                    type="button"
                    onClick={() => removeBanner(index)}
                    aria-label={t('common.delete')}
                    className="grid size-9 place-items-center rounded-lg text-ink-500 hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label={t('set.bannerKickerAr')}>
                  <TextInput
                    value={banner.kicker.ar}
                    onChange={(e) =>
                      patchBanner(index, (b) => ({ ...b, kicker: { ...b.kicker, ar: e.target.value } }))
                    }
                  />
                </Field>
                <Field label={t('set.bannerKickerEn')}>
                  <TextInput
                    value={banner.kicker.en}
                    onChange={(e) =>
                      patchBanner(index, (b) => ({ ...b, kicker: { ...b.kicker, en: e.target.value } }))
                    }
                    dir="ltr"
                  />
                </Field>
                <Field label={t('set.bannerTitleAr')}>
                  <TextInput
                    value={banner.title.ar}
                    onChange={(e) =>
                      patchBanner(index, (b) => ({ ...b, title: { ...b.title, ar: e.target.value } }))
                    }
                  />
                </Field>
                <Field label={t('set.bannerTitleEn')}>
                  <TextInput
                    value={banner.title.en}
                    onChange={(e) =>
                      patchBanner(index, (b) => ({ ...b, title: { ...b.title, en: e.target.value } }))
                    }
                    dir="ltr"
                  />
                </Field>
                <Field label={t('set.bannerSubAr')}>
                  <TextInput
                    value={banner.sub.ar}
                    onChange={(e) =>
                      patchBanner(index, (b) => ({ ...b, sub: { ...b.sub, ar: e.target.value } }))
                    }
                  />
                </Field>
                <Field label={t('set.bannerSubEn')}>
                  <TextInput
                    value={banner.sub.en}
                    onChange={(e) =>
                      patchBanner(index, (b) => ({ ...b, sub: { ...b.sub, en: e.target.value } }))
                    }
                    dir="ltr"
                  />
                </Field>
                <Field label={t('set.bannerCtaAr')}>
                  <TextInput
                    value={banner.cta.ar}
                    onChange={(e) =>
                      patchBanner(index, (b) => ({ ...b, cta: { ...b.cta, ar: e.target.value } }))
                    }
                  />
                </Field>
                <Field label={t('set.bannerCtaEn')}>
                  <TextInput
                    value={banner.cta.en}
                    onChange={(e) =>
                      patchBanner(index, (b) => ({ ...b, cta: { ...b.cta, en: e.target.value } }))
                    }
                    dir="ltr"
                  />
                </Field>
                <Field label={t('set.bannerHref')}>
                  <TextInput
                    value={banner.href}
                    onChange={(e) => patchBanner(index, (b) => ({ ...b, href: e.target.value }))}
                    dir="ltr"
                  />
                </Field>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="sticky bottom-0 -mx-4 flex justify-end border-t border-ink-200 bg-white/95 px-4 py-3 backdrop-blur lg:-mx-6 lg:px-6">
        <button type="submit" disabled={busy} className="btn-primary px-6 py-2.5">
          <Save className="size-4" aria-hidden="true" />
          {t('common.save')}
        </button>
      </div>
    </form>
  )
}
