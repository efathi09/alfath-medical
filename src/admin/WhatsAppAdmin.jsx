import { useEffect, useState } from 'react'
import { Check, Copy, MessageCircle, Send } from 'lucide-react'
import { adminApi } from './adminApi.js'
import { useAdminT } from './adminText.js'
import { API_BASE } from '../lib/api.js'
import { Field, PageLoader, Select, Spinner, TextInput, Textarea, Toggle } from './ui.jsx'

const EMPTY = {
  enabled: false,
  dryRun: false,
  phoneId: '',
  token: '',
  apiVersion: 'v21.0',
  countryCode: '20',
  owner: '',
  notifyOwner: true,
  replyCustomer: true,
  replyTextAr: '',
  ownerTemplate: '',
  ownerTemplateLang: 'ar',
  replyTemplate: '',
  replyTemplateLang: 'ar',
  verifyToken: '',
}

function fromStatus(status) {
  if (!status) return { ...EMPTY }
  return {
    ...EMPTY,
    enabled: Boolean(status.enabled),
    dryRun: Boolean(status.dryRun),
    phoneId: status.phoneId ?? '',
    token: '',
    apiVersion: status.apiVersion ?? 'v21.0',
    countryCode: status.countryCode ?? '20',
    owner: status.owner ?? '',
    notifyOwner: status.notifyOwner ?? true,
    replyCustomer: status.replyCustomer ?? true,
    replyTextAr: status.replyText?.ar ?? '',
    ownerTemplate: status.ownerTemplate ?? '',
    ownerTemplateLang: status.ownerTemplateLang ?? 'ar',
    replyTemplate: status.replyTemplate ?? '',
    replyTemplateLang: status.replyTemplateLang ?? 'ar',
    verifyToken: '',
  }
}

export default function WhatsAppAdmin() {
  const t = useAdminT()
  const [status, setStatus] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [messages, setMessages] = useState([])
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)
  const [testTo, setTestTo] = useState('')
  const [testText, setTestText] = useState('')
  const [testResult, setTestResult] = useState('')
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)

  useEffect(() => {
    let alive = true
    Promise.all([adminApi.getWhatsApp(), adminApi.listWhatsAppMessages()])
      .then(([cfg, msgs]) => {
        if (!alive) return
        setStatus(cfg)
        setForm(fromStatus(cfg))
        setMessages(msgs?.messages ?? [])
      })
      .catch(() => {
        if (!alive) return
        setError(t('common.error'))
      })
    return () => {
      alive = false
    }
  }, [reload, t])

  const set = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  async function save(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setSaved(false)
    const payload = {
      enabled: form.enabled,
      dryRun: form.dryRun,
      phoneId: form.phoneId.trim(),
      apiVersion: form.apiVersion.trim(),
      countryCode: form.countryCode.trim(),
      owner: form.owner.replace(/\D/g, ''),
      notifyOwner: form.notifyOwner,
      replyCustomer: form.replyCustomer,
      replyText: { ar: form.replyTextAr, en: '' },
      ownerTemplate: form.ownerTemplate.trim(),
      ownerTemplateLang: form.ownerTemplateLang.trim(),
      replyTemplate: form.replyTemplate.trim(),
      replyTemplateLang: form.replyTemplateLang.trim(),
      verifyToken: form.verifyToken.trim(),
    }
    if (form.token.trim()) payload.token = form.token.trim()
    try {
      const next = await adminApi.updateWhatsApp(payload)
      setStatus(next)
      setForm(fromStatus(next))
      setSaved(true)
      setReload((n) => n + 1)
    } catch {
      setError(t('common.error'))
    } finally {
      setBusy(false)
    }
  }

  async function sendTest() {
    if (!testTo.trim()) return
    setBusy(true)
    setTestResult('')
    setError('')
    try {
      const res = await adminApi.testWhatsApp(testTo.trim(), testText.trim() || undefined)
      setTestResult(res?.result?.dryRun ? t('wa.testDry') : t('wa.testSent'))
    } catch (err) {
      setError(err?.data?.error === 'WHATSAPP_NOT_CONFIGURED' ? t('wa.notConfigured') : t('common.error'))
    } finally {
      setBusy(false)
    }
  }

  const webhookUrl =
    typeof window === 'undefined' ? '' : `${API_BASE || window.location.origin}/api/whatsapp/webhook`

  function copyWebhook() {
    if (!webhookUrl) return
    navigator.clipboard?.writeText(webhookUrl).then(
      () => {
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1800)
      },
      () => {},
    )
  }

  if (status === null) return <PageLoader />

  const statusChip = status.configured
    ? 'border-brand-200 bg-brand-50 text-brand-700'
    : 'border-ink-200 bg-ink-100 text-ink-500'

  return (
    <div className="flex flex-col gap-5">
      <div className="card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#1FA855] text-white">
              <MessageCircle className="size-6" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-base font-extrabold text-ink-900">{t('wa.title')}</h2>
              <p className="mt-0.5 max-w-xl text-xs text-ink-500">{t('wa.subtitle')}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`chip border ${statusChip}`}>
              {status.configured ? t('wa.configured') : t('wa.notConfigured')}
            </span>
            {status.dryRun && <span className="chip border border-sky-200 bg-sky-50 text-sky-700">{t('wa.dryRun')}</span>}
            {status.enabled && <span className="chip border border-deal-200 bg-deal-50 text-deal-600">{t('common.active')}</span>}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl bg-ink-50 px-3 py-2.5 text-xs">
          <span className="font-bold text-ink-600">{t('wa.webhookUrl')}:</span>
          <code className="ltr-nums break-all text-ink-700" dir="ltr">{webhookUrl}</code>
          <button
            type="button"
            onClick={copyWebhook}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 font-bold text-brand-700 hover:bg-white"
          >
            {copied ? <Check className="size-3.5" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
            {copied ? t('wa.copied') : t('wa.copy')}
          </button>
        </div>
      </div>

      {error && <p className="text-sm font-bold text-rose-600">{error}</p>}

      <form onSubmit={save} className="card flex flex-col gap-5 p-5">
        <div className="flex flex-wrap gap-6">
          <Toggle checked={form.enabled} onChange={(v) => set('enabled', v)} label={t('wa.enabled')} />
          <Toggle checked={form.dryRun} onChange={(v) => set('dryRun', v)} label={t('wa.dryRun')} />
        </div>
        <p className="-mt-3 text-[11px] text-ink-400">{t('wa.dryRunHint')}</p>

        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="mb-1 text-xs font-extrabold text-ink-500">{t('wa.credentials')}</legend>
          <Field label={t('wa.phoneId')}>
            <TextInput value={form.phoneId} onChange={(e) => set('phoneId', e.target.value)} dir="ltr" />
          </Field>
          <Field label={t('wa.token')} hint={status.hasToken ? t('wa.tokenSet') : undefined}>
            <TextInput
              type="password"
              value={form.token}
              onChange={(e) => set('token', e.target.value)}
              placeholder={status.hasToken ? '••••••••' : ''}
              autoComplete="off"
              dir="ltr"
            />
          </Field>
          <Field label={t('wa.apiVersion')}>
            <TextInput value={form.apiVersion} onChange={(e) => set('apiVersion', e.target.value)} dir="ltr" />
          </Field>
          <Field label={t('wa.countryCode')}>
            <TextInput value={form.countryCode} onChange={(e) => set('countryCode', e.target.value)} dir="ltr" />
          </Field>
          <Field label={t('wa.verifyToken')} hint={status.verifyTokenSet ? t('wa.verifyTokenSet') : undefined}>
            <TextInput
              value={form.verifyToken}
              onChange={(e) => set('verifyToken', e.target.value)}
              dir="ltr"
              autoComplete="off"
            />
          </Field>
        </fieldset>

        <fieldset className="grid gap-4 border-t border-ink-100 pt-4 sm:grid-cols-2">
          <legend className="mb-1 text-xs font-extrabold text-ink-500">{t('wa.notifications')}</legend>
          <div className="flex items-center gap-6 sm:col-span-2">
            <Toggle checked={form.notifyOwner} onChange={(v) => set('notifyOwner', v)} label={t('wa.notifyOwner')} />
            <Toggle checked={form.replyCustomer} onChange={(v) => set('replyCustomer', v)} label={t('wa.replyCustomer')} />
          </div>
          <Field label={t('wa.owner')}>
            <TextInput value={form.owner} onChange={(e) => set('owner', e.target.value)} dir="ltr" placeholder="201157447575" />
          </Field>
          <Field label={t('wa.replyTextAr')}>
            <Textarea rows={2} value={form.replyTextAr} onChange={(e) => set('replyTextAr', e.target.value)} />
          </Field>
        </fieldset>

        <fieldset className="grid gap-4 border-t border-ink-100 pt-4 sm:grid-cols-2">
          <legend className="mb-1 text-xs font-extrabold text-ink-500">{t('wa.templates')}</legend>
          <p className="-mt-2 text-[11px] text-ink-400 sm:col-span-2">{t('wa.templatesHint')}</p>
          <Field label={t('wa.ownerTemplate')}>
            <TextInput value={form.ownerTemplate} onChange={(e) => set('ownerTemplate', e.target.value)} dir="ltr" />
          </Field>
          <Field label={t('wa.templateLang')}>
            <Select value={form.ownerTemplateLang} onChange={(e) => set('ownerTemplateLang', e.target.value)} dir="ltr">
              <option value="ar">ar</option>
              <option value="en_US">en_US</option>
            </Select>
          </Field>
          <Field label={t('wa.replyTemplate')}>
            <TextInput value={form.replyTemplate} onChange={(e) => set('replyTemplate', e.target.value)} dir="ltr" />
          </Field>
          <Field label={t('wa.templateLang')}>
            <Select value={form.replyTemplateLang} onChange={(e) => set('replyTemplateLang', e.target.value)} dir="ltr">
              <option value="ar">ar</option>
              <option value="en_US">en_US</option>
            </Select>
          </Field>
        </fieldset>

        <div className="flex items-center gap-3 border-t border-ink-100 pt-4">
          <button type="submit" disabled={busy} className="btn-primary px-5 py-2.5">
            {busy && <Spinner className="size-4 text-white" />}
            {t('wa.save')}
          </button>
          {saved && <span className="text-xs font-bold text-brand-700">{t('wa.saved')}</span>}
        </div>
      </form>

      <div className="card p-5">
        <h3 className="text-sm font-extrabold text-ink-900">{t('wa.test')}</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_2fr_auto] sm:items-end">
          <Field label={t('wa.testTo')}>
            <TextInput value={testTo} onChange={(e) => setTestTo(e.target.value)} dir="ltr" placeholder="201157447575" />
          </Field>
          <Field label={t('wa.testText')}>
            <TextInput value={testText} onChange={(e) => setTestText(e.target.value)} />
          </Field>
          <button type="button" onClick={sendTest} disabled={busy || !testTo.trim()} className="btn-outline h-10 px-4">
            <Send className="size-4" aria-hidden="true" />
            {t('wa.test')}
          </button>
        </div>
        {testResult && <p className="mt-2 text-xs font-bold text-brand-700">{testResult}</p>}
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-ink-100 px-5 py-3.5">
          <h3 className="text-sm font-extrabold text-ink-900">{t('wa.messages')}</h3>
          <span className="chip bg-ink-100 text-ink-600">
            <span className="num">{messages.length}</span>
          </span>
        </div>
        {messages.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm font-bold text-ink-400">{t('wa.noMessages')}</p>
        ) : (
          <ul className="divide-y divide-ink-100">
            {messages.map((msg) => (
              <li key={msg.id} className="flex items-start gap-3 px-5 py-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#1FA855]/10 text-[#1FA855]">
                  <MessageCircle className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-[13px] font-bold text-ink-800">
                    {msg.name || msg.wa_from}
                    <span className="ltr-nums text-[11px] font-medium text-ink-400">{msg.wa_from}</span>
                  </p>
                  <p className="mt-0.5 text-sm text-ink-600">{msg.text}</p>
                </div>
                <time className="ltr-nums shrink-0 text-[11px] text-ink-400">
                  {msg.created_at ? new Date(msg.created_at).toLocaleString() : ''}
                </time>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
