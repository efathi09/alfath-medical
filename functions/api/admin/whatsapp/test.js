import { json, cors } from '../../_lib/db.js'
import { getStore } from '../../_lib/store.js'
import { requireAdmin } from '../../_lib/auth.js'
import { loadWaConfig, sendText, isConfigured } from '../../_lib/whatsapp.js'

export const onRequestOptions = () => cors()

export const onRequestPost = async ({ request, env }) => {
  const denied = await requireAdmin(request, env)
  if (denied) return denied

  let payload
  try {
    payload = await request.json()
  } catch {
    return json({ error: 'INVALID_JSON' }, { status: 400 })
  }

  const to = String(payload?.to ?? '').trim()
  const text = String(payload?.text ?? 'رسالة اختبار من الفتح للتجارة الطبية ✅').trim()
  if (!to) return json({ error: 'TO_REQUIRED' }, { status: 400 })

  try {
    const store = await getStore(env)
    const cfg = await loadWaConfig(store, env)
    if (!cfg.dryRun && !isConfigured(cfg)) {
      return json({ error: 'WHATSAPP_NOT_CONFIGURED' }, { status: 400 })
    }
    const result = await sendText(cfg, to, text)
    return json({ ok: true, result })
  } catch (err) {
    return json({ error: 'SEND_FAILED', detail: String(err?.message || err) }, { status: 502 })
  }
}
