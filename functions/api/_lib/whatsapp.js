// WhatsApp Cloud API helper (Meta Graph API).
//
// Configuration is stored per-deployment in the `whatsapp_config` row and can
// be supplemented (or overridden) by environment variables. Secrets such as
// the access token may live in env so they never touch the database.
//
// Send flow degrades gracefully: when the integration is disabled or the
// credentials are missing, nothing is sent and no error is thrown, so quote
// submission keeps working on a fresh deployment.
//
// Set WHATSAPP_DRY_RUN=1 (or enable dry-run in the admin UI) to exercise the
// full pipeline locally without calling the Graph API.

export const WA_DEFAULT_VERSION = 'v21.0'
export const WA_GRAPH_BASE = 'https://graph.facebook.com'

export function digits(value) {
  return String(value ?? '').replace(/\D/g, '')
}

// Normalize a user-entered phone number into international digits.
// Defaults to Egypt (country code 20) when a leading zero is present.
export function normalizePhone(value, countryCode = '20') {
  let d = digits(value)
  if (!d) return ''
  if (d.startsWith('00')) d = d.slice(2)
  const cc = digits(countryCode) || '20'
  if (d.startsWith('0')) return cc + d.slice(1)
  if (d.length <= 10 && !d.startsWith(cc)) return cc + d
  return d
}

export async function loadWaConfig(store, env = {}) {
  let stored = {}
  try {
    if (store?.getWhatsAppConfig) stored = (await store.getWhatsAppConfig()) || {}
  } catch {
    stored = {}
  }
  const apiVersion = env.WHATSAPP_API_VERSION || stored.apiVersion || WA_DEFAULT_VERSION
  const countryCode = env.WHATSAPP_COUNTRY_CODE || stored.countryCode || '20'
  return {
    enabled: Boolean(stored.enabled),
    token: env.WHATSAPP_TOKEN || stored.token || '',
    phoneId: env.WHATSAPP_PHONE_ID || stored.phoneId || '',
    apiVersion,
    countryCode,
    owner: normalizePhone(env.WHATSAPP_OWNER || stored.owner || '', countryCode),
    notifyOwner: stored.notifyOwner ?? true,
    replyCustomer: stored.replyCustomer ?? true,
    ownerTemplate: stored.ownerTemplate || '',
    ownerTemplateLang: stored.ownerTemplateLang || 'ar',
    replyTemplate: stored.replyTemplate || '',
    replyTemplateLang: stored.replyTemplateLang || 'ar',
    replyText: stored.replyText || { ar: '', en: '' },
    verifyToken: env.WHATSAPP_VERIFY_TOKEN || stored.verifyToken || '',
    appSecret: env.WHATSAPP_APP_SECRET || stored.appSecret || '',
    dryRun: env.WHATSAPP_DRY_RUN === '1' || stored.dryRun === true,
  }
}

export function isConfigured(cfg) {
  return Boolean(cfg && cfg.token && cfg.phoneId)
}

// Whether a send should even be attempted (real credentials or an explicit dry-run).
export function canSend(cfg) {
  return Boolean(cfg && (cfg.dryRun || isConfigured(cfg)))
}

async function postGraph(cfg, payload, fetchImpl = fetch) {
  const url = `${WA_GRAPH_BASE}/${cfg.apiVersion}/${cfg.phoneId}/messages`
  const res = await fetchImpl(url, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${cfg.token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(body?.error?.message || `WHATSAPP_HTTP_${res.status}`)
  }
  return body
}

// Low-level send. Returns { dryRun, id } on success.
export async function sendPayload(cfg, payload, fetchImpl = fetch) {
  if (!canSend(cfg)) throw new Error('WHATSAPP_NOT_CONFIGURED')
  if (cfg.dryRun) {
    const preview =
      payload.type === 'text'
        ? payload.text?.body
        : `${payload.template?.name} (${payload.template?.language?.code})`
    return { dryRun: true, to: payload.to, type: payload.type, preview }
  }
  const body = await postGraph(cfg, payload, fetchImpl)
  return { dryRun: false, id: body?.messages?.[0]?.id ?? null, to: payload.to }
}

export async function sendText(cfg, to, text, fetchImpl) {
  return sendPayload(
    cfg,
    {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: normalizePhone(to, cfg.countryCode),
      type: 'text',
      text: { preview_url: false, body: String(text ?? '') },
    },
    fetchImpl,
  )
}

export async function sendTemplate(cfg, to, name, lang, params = [], fetchImpl) {
  const components = Array.isArray(params) && params.length
    ? [{ type: 'body', parameters: params.map((p) => ({ type: 'text', text: String(p ?? '') })) }]
    : undefined
  return sendPayload(
    cfg,
    {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: normalizePhone(to, cfg.countryCode),
      type: 'template',
      template: {
        name,
        language: { code: lang || 'en' },
        ...(components ? { components } : {}),
      },
    },
    fetchImpl,
  )
}

export function quoteItemsSummary(items = [], lang = 'ar') {
  return items
    .map((item) => {
      const label =
        (lang === 'ar' ? item.name || item.nameAr : item.nameEn || item.name) || item.id
      const qty = item.qty ?? item.quantity ?? 1
      return `- ${label} x${qty}`
    })
    .join('\n')
}

export function ownerAlertText(quote, items = []) {
  const lines = [
    `طلب عرض سعر جديد #${quote.id}`,
    `الاسم: ${quote.name}`,
    `الهاتف: ${quote.phone}`,
  ]
  if (quote.company) lines.push(`الجهة: ${quote.company}`)
  const summary = quoteItemsSummary(items, 'ar')
  if (summary) lines.push('الأصناف:', summary)
  if (quote.notes) lines.push(`ملاحظات: ${quote.notes}`)
  return lines.join('\n')
}

// Send the "new quote" alerts (owner + optional customer auto-reply).
// Best-effort: returns a results array, never throws.
export async function sendQuoteNotifications(cfg, quote, { fetchImpl } = {}) {
  const out = { owner: null, customer: null, skipped: false }
  if (!canSend(cfg)) {
    out.skipped = true
    return out
  }
  const items = quote.items ?? []

  if (cfg.notifyOwner && cfg.owner) {
    try {
      if (cfg.ownerTemplate) {
        out.owner = await sendTemplate(
          cfg,
          cfg.owner,
          cfg.ownerTemplate,
          cfg.ownerTemplateLang,
          [quote.id, quote.name, quote.phone, quoteItemsSummary(items, 'ar') || '-'],
          fetchImpl,
        )
      } else {
        out.owner = await sendText(cfg, cfg.owner, ownerAlertText(quote, items), fetchImpl)
      }
    } catch (err) {
      out.owner = { error: err.message }
    }
  }

  if (cfg.replyCustomer && quote.phone) {
    try {
      const body =
        (cfg.replyText && cfg.replyText.ar) ||
        'شكراً لتواصلك مع الفتح للتجارة الطبية. استلمنا طلبك وسيتواصل معك فريقنا قريباً.'
      if (cfg.replyTemplate) {
        out.customer = await sendTemplate(
          cfg,
          quote.phone,
          cfg.replyTemplate,
          cfg.replyTemplateLang,
          [quote.name],
          fetchImpl,
        )
      } else {
        out.customer = await sendText(cfg, quote.phone, body, fetchImpl)
      }
    } catch (err) {
      out.customer = { error: err.message }
    }
  }

  return out
}

// Public, non-secret status used by the admin UI.
export function publicWaStatus(cfg) {
  return {
    enabled: cfg.enabled,
    configured: isConfigured(cfg),
    canSend: canSend(cfg),
    dryRun: cfg.dryRun,
    hasToken: Boolean(cfg.token),
    phoneId: cfg.phoneId,
    apiVersion: cfg.apiVersion,
    countryCode: cfg.countryCode,
    owner: cfg.owner,
    notifyOwner: cfg.notifyOwner,
    replyCustomer: cfg.replyCustomer,
    ownerTemplate: cfg.ownerTemplate,
    ownerTemplateLang: cfg.ownerTemplateLang,
    replyTemplate: cfg.replyTemplate,
    replyTemplateLang: cfg.replyTemplateLang,
    replyText: cfg.replyText,
    verifyTokenSet: Boolean(cfg.verifyToken),
  }
}

// Verify the X-Hub-Signature-256 header when an app secret is configured.
export async function verifyWebhookSignature(cfg, rawBody, headerValue) {
  if (!cfg.appSecret) return true
  if (!headerValue || !headerValue.startsWith('sha256=')) return false
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(cfg.appSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const mac = await crypto.subtle.sign('HMAC', key, enc.encode(rawBody))
  const expected =
    'sha256=' +
    [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, '0')).join('')
  const a = expected
  const b = headerValue
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

// Pull inbound text messages out of a webhook POST payload.
export function extractInboundMessages(payload) {
  const out = []
  const entries = payload?.entry ?? []
  for (const entry of entries) {
    for (const change of entry?.changes ?? []) {
      const value = change?.value ?? {}
      const contacts = value.contacts ?? []
      for (const msg of value.messages ?? []) {
        const contact = contacts.find((c) => c.wa_id === msg.from)
        const text =
          msg.text?.body ??
          msg.button?.text ??
          msg.interactive?.button_reply?.title ??
          msg.interactive?.list_reply?.title ??
          ''
        out.push({
          from: msg.from,
          name: contact?.profile?.name ?? null,
          text,
          type: msg.type ?? 'text',
          waMessageId: msg.id ?? null,
        })
      }
    }
  }
  return out
}
