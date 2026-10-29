import { useState } from 'react'
import { Lock, ShieldCheck, User } from 'lucide-react'
import { adminApi, setToken } from './adminApi.js'
import { useAdminT } from './adminText.js'
import { Field, Spinner, TextInput } from './ui.jsx'

export default function Login({ onSuccess }) {
  const t = useAdminT()
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    if (!password.trim() || busy) return
    setBusy(true)
    setError('')
    try {
      const res = await adminApi.login(username.trim() || 'admin', password)
      setToken(res.token)
      onSuccess(res.role)
    } catch (err) {
      setError(err?.status === 401 ? t('login.wrong') : t('common.error'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-ink-100 px-4">
      <form onSubmit={submit} className="card w-full max-w-sm p-7">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
            <ShieldCheck className="size-7" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-lg font-extrabold text-ink-900">{t('login.title')}</h1>
            <p className="mt-1 text-xs text-ink-500">{t('login.subtitle')}</p>
          </div>
        </div>

        <Field label={t('login.username')} required>
          <div className="relative">
            <User className="pointer-events-none absolute top-1/2 size-4 -translate-y-1/2 text-ink-400 start-3" />
            <TextInput
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              className="pe-9"
              dir="ltr"
            />
          </div>
        </Field>

        <Field label={t('login.password')} required>
          <div className="relative">
            <Lock className="pointer-events-none absolute top-1/2 size-4 -translate-y-1/2 text-ink-400 start-3" />
            <TextInput
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              dir="ltr"
              autoFocus
              autoComplete="current-password"
              className="pe-9"
              placeholder="••••••••"
            />
          </div>
        </Field>

        {error && <p className="mt-3 text-xs font-bold text-rose-600">{error}</p>}

        <button type="submit" disabled={busy} className="btn-primary mt-5 w-full px-4 py-3">
          {busy ? <Spinner className="size-4 text-white" /> : t('login.submit')}
        </button>

        <p className="mt-4 text-center text-[11px] text-ink-400">{t('login.hint')}</p>
      </form>
    </div>
  )
}
