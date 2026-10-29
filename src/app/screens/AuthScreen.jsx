import { useMemo, useState } from 'react'
import { Lock, LogIn, Mail, Phone, User, UserPlus } from 'lucide-react'
import { useLang } from '../../context/LanguageContext.jsx'
import { useStore } from '../../context/StoreContext.jsx'
import { useAppNav } from '../nav.jsx'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export default function AuthScreen() {
  const { t } = useLang()
  const { loginCustomer, registerCustomer, notify } = useStore()
  const nav = useAppNav()
  const [mode, setMode] = useState(nav.current.params?.mode === 'register' ? 'register' : 'login')
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const isRegister = mode === 'register'

  const errorText = useMemo(() => (error ? t(`auth.error.${error}`) : ''), [error, t])

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (error) setError('')
  }

  async function submit(event) {
    event.preventDefault()
    if (busy) return

    if (isRegister && form.name.trim().length < 2) return setError('name')
    if (isRegister && form.phone.replace(/\D/g, '').length < 8) return setError('phone')
    if (!EMAIL_RE.test(form.email.trim())) return setError('email')
    if (form.password.length < 6) return setError('password')

    setBusy(true)
    try {
      if (isRegister) {
        await registerCustomer({
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          password: form.password,
        })
      } else {
        await loginCustomer({ email: form.email.trim(), password: form.password })
      }
      notify(t('auth.welcome'))
      nav.back()
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
    <div className="px-4 py-5">
      <div className="mb-5 text-center">
        <span className="mx-auto mb-3 grid size-14 place-items-center rounded-2xl bg-app-600 text-white shadow-soft">
          {isRegister ? <UserPlus className="size-7" aria-hidden="true" /> : <LogIn className="size-7" aria-hidden="true" />}
        </span>
        <h1 className="text-lg font-extrabold text-ink-900">
          {isRegister ? t('auth.registerTitle') : t('auth.loginTitle')}
        </h1>
        <p className="mt-1 text-xs text-ink-500">
          {isRegister ? t('auth.registerSubtitle') : t('auth.loginSubtitle')}
        </p>
      </div>

      <form onSubmit={submit} className="space-y-3" noValidate>
        {isRegister && (
          <>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-ink-700">{t('auth.name')}</span>
              <div className="relative">
                <User className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
                <input
                  className={`${field} ps-9`}
                  value={form.name}
                  onChange={(event) => update('name', event.target.value)}
                  autoComplete="name"
                />
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
                  onChange={(event) => update('phone', event.target.value)}
                  autoComplete="tel"
                />
              </div>
            </label>
          </>
        )}

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
              onChange={(event) => update('email', event.target.value)}
              autoComplete="email"
            />
          </div>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-bold text-ink-700">{t('auth.password')}</span>
          <div className="relative">
            <Lock className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
            <input
              type="password"
              dir="ltr"
              className={`${field} pe-9`}
              value={form.password}
              onChange={(event) => update('password', event.target.value)}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
            />
          </div>
        </label>

        {errorText && (
          <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600">{errorText}</p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-app-600 py-3 text-sm font-bold text-white active:scale-[0.98] disabled:opacity-60"
        >
          {isRegister ? <UserPlus className="size-4" aria-hidden="true" /> : <LogIn className="size-4" aria-hidden="true" />}
          {busy ? t('auth.pleaseWait') : isRegister ? t('auth.registerAction') : t('auth.loginAction')}
        </button>
      </form>

      <button
        type="button"
        onClick={() => {
          setMode(isRegister ? 'login' : 'register')
          setError('')
        }}
        className="mt-4 flex w-full items-center justify-center gap-1 text-xs font-bold text-app-600"
      >
        {isRegister ? t('auth.haveAccount') : t('auth.noAccount')}
      </button>
    </div>
  )
}
