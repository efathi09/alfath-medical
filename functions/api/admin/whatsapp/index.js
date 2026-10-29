import { json, cors } from '../../_lib/db.js'
import { getStore } from '../../_lib/store.js'
import { requireAdmin } from '../../_lib/auth.js'
import { loadWaConfig, publicWaStatus } from '../../_lib/whatsapp.js'

export const onRequestOptions = () => cors()

export const onRequestGet = async ({ request, env }) => {
  const denied = await requireAdmin(request, env)
  if (denied) return denied

  try {
    const store = await getStore(env)
    const cfg = await loadWaConfig(store, env)
    return json(publicWaStatus(cfg), { headers: { 'cache-control': 'no-store' } })
  } catch (err) {
    return json({ error: 'DB_ERROR', detail: String(err) }, { status: 500 })
  }
}

const BOOLEAN_FIELDS = ['enabled', 'notifyOwner', 'replyCustomer', 'dryRun']
const STRING_FIELDS = [
  'phoneId',
  'apiVersion',
  'countryCode',
  'ownerTemplate',
  'ownerTemplateLang',
  'replyTemplate',
  'replyTemplateLang',
  'verifyToken',
]

export const onRequestPut = async ({ request, env }) => {
  const denied = await requireAdmin(request, env)
  if (denied) return denied

  let payload
  try {
    payload = await request.json()
  } catch {
    return json({ error: 'INVALID_JSON' }, { status: 400 })
  }

  const patch = {}
  for (const key of BOOLEAN_FIELDS) {
    if (key in payload) patch[key] = Boolean(payload[key])
  }
  for (const key of STRING_FIELDS) {
    if (key in payload) patch[key] = String(payload[key] ?? '').trim()
  }
  if ('owner' in payload) {
    patch.owner = String(payload.owner ?? '').replace(/\D/g, '')
  }
  // Token is a secret: only touch it when the field is explicitly present.
  if ('token' in payload) patch.token = String(payload.token ?? '').trim()
  if (payload.replyText && typeof payload.replyText === 'object') {
    patch.replyText = {
      ar: String(payload.replyText.ar ?? ''),
      en: String(payload.replyText.en ?? ''),
    }
  }

  try {
    const store = await getStore(env)
    await store.updateWhatsAppConfig(patch)
    const cfg = await loadWaConfig(store, env)
    return json(publicWaStatus(cfg))
  } catch (err) {
    return json({ error: 'DB_ERROR', detail: String(err) }, { status: 500 })
  }
}
