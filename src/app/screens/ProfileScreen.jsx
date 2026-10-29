import { useMemo, useState } from 'react'
import { Check, Mail, MapPin, Phone, User } from 'lucide-react'
import { useLang } from '../../context/LanguageContext.jsx'
import { useStore } from '../../context/StoreContext.jsx'
import { useAppNav } from '../nav.jsx'

export default function ProfileScreen() {
  const { t } = useLang()
  const { customer, updateProfile, notify } = useStore()
  const nav = useAppNav()
  const [form, setForm] = useState({
    name: customer?.name ?? '',
    phone: customer?.phone ?? '',
    email: customer?.email ?? '',
    address: customer?.address ?? '',
    city: customer?.city ?? '',
    password: '',
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)

  const errorText = useMemo(() => (error ? t(`auth.error.${error}`) : ''), [error, t])

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (error) setError('')
  }

  async function submit(event) {
    event.preventDefault()
    if (busy) return
    if (form.name.trim().length < 2) return setError('name')
    if (form.phone.replace(/\D/g, '').length < 8) return setError('phone')
    if (form.password && form.password.length < 6) return setError('password')

    setBusy(true)
    try {
      await updateProfile({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        ...(form.password ? { password: form.password } : {}),
      })
      notify(t('profile.saved'))
      setSaved(true)
      setForm((prev) => ({ ...prev, password: '' }))
      window.setTimeout(() => setSaved(false), 1800)
    } catch (err) {
      const code = err?.code || err?.message || 'generic'
      setError(code === 'OFFLINE' ? 'offline' : code)
    } finally {
      setBusy(false)
    }
  }

  const field =
    'w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-800 outline-none transition-colors placeholder:text-ink-400 focus:border-app-400 focus:ring-4 focus:ring-app-100'

  return (
    <form onSubmit={submit} className="space-y-3 p-4 pb-8" noValidate>
      <section className="space-y-3 rounded-2xl bg-white p-4 shadow-soft">
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold text-ink-700">{t('auth.name')}</span>
          <div className="relative">
            <User className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
            <input className={`${field} ps-9`} value={form.name} onChange={(e) => update('name', e.target.value)} />
          </div>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold text-ink-700">{t('auth.phone')}</span>
          <div className="relative">
            <Phone className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
            <input
              type="tel"
              inputMode="tel"
              dir="ltr"
              className={`${field} ltr-nums pe-9`}
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
            />
          </div>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold text-ink-700">{t('auth.email')}</span>
          <div className="relative">
            <Mail className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
            <input
              type="email"
              inputMode="email"
              dir="ltr"
              className={`${field} ltr-nums pe-9`}
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
            />
          </div>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold text-ink-700">{t('checkout.address')}</span>
          <div className="relative">
            <MapPin className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
            <input className={`${field} ps-9`} value={form.address} onChange={(e) => update('address', e.target.value)} />
          </div>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold text-ink-700">{t('checkout.city')}</span>
          <input className={field} value={form.city} onChange={(e) => update('city', e.target.value)} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold text-ink-700">{t('auth.newPassword')}</span>
          <input
            type="password"
            dir="ltr"
            className={field}
            placeholder={t('auth.passwordOptional')}
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            autoComplete="new-password"
          />
        </label>
      </section>

      {errorText && (
        <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600">{errorText}</p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => nav.back()}
          className="flex min-h-12 flex-1 items-center justify-center rounded-xl bg-ink-100 px-3 text-sm font-bold text-ink-600 active:scale-[0.98]"
        >
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          disabled={busy}
          className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-app-600 px-3 text-sm font-bold text-white active:scale-[0.98] disabled:opacity-60"
        >
          {saved ? <Check className="size-4" aria-hidden="true" /> : null}
          {busy ? t('auth.pleaseWait') : saved ? t('profile.saved') : t('common.save')}
        </button>
      </div>
    </form>
  )
}
