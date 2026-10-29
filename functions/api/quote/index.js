import { json, cors } from '../_lib/db.js'
import { getStore } from '../_lib/store.js'
import { loadWaConfig, sendQuoteNotifications } from '../_lib/whatsapp.js'

export const onRequestOptions = () => cors()

export const onRequestPost = async ({ request, env, waitUntil }) => {
  let payload
  try {
    payload = await request.json()
  } catch {
    return json({ error: 'INVALID_JSON' }, { status: 400 })
  }

  const name = String(payload?.name ?? '').trim()
  const phone = String(payload?.phone ?? '').trim()
  const company = payload?.company ? String(payload.company).trim() : null
  const notes = payload?.notes ? String(payload.notes).trim() : null
  const items = Array.isArray(payload?.items) ? payload.items : []

  if (name.length < 2) return json({ error: 'NAME_REQUIRED' }, { status: 400 })
  if (phone.replace(/\D/g, '').length < 8) return json({ error: 'PHONE_INVALID' }, { status: 400 })
  if (items.length === 0) return json({ error: 'ITEMS_REQUIRED' }, { status: 400 })

  let row
  try {
    const store = await getStore(env)
    row = await store.createQuote({ name, phone, company, items, notes, source: 'website' })
  } catch (err) {
    return json({ error: 'DB_ERROR', detail: String(err) }, { status: 500 })
  }

  // Notify the shop owner (and optionally auto-reply to the customer) over
  // WhatsApp. Best-effort: never block or fail the customer's submission.
  const notify = (async () => {
    try {
      const store = await getStore(env)
      const cfg = await loadWaConfig(store, env)
      if (!cfg.enabled) return { skipped: true }
      return await sendQuoteNotifications(cfg, row)
    } catch (err) {
      return { error: String(err?.message || err) }
    }
  })()

  if (typeof waitUntil === 'function') waitUntil(notify)
  else await notify

  return json({ id: row.id, created_at: row.created_at, persisted: true }, { status: 201 })
}
