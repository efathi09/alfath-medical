import { json, cors } from '../_lib/db.js'
import { getStore } from '../_lib/store.js'
import { requireAdmin } from '../_lib/auth.js'

const STATUSES = ['pending', 'contacted', 'quoted', 'won', 'lost']

export const onRequestOptions = () => cors()

export const onRequestPatch = async ({ request, params, env }) => {
  const denied = await requireAdmin(request, env)
  if (denied) return denied

  let payload
  try {
    payload = await request.json()
  } catch {
    return json({ error: 'INVALID_JSON' }, { status: 400 })
  }

  const status = String(payload?.status ?? '')
  if (!STATUSES.includes(status)) {
    return json({ error: 'INVALID_STATUS', allowed: STATUSES }, { status: 400 })
  }

  try {
    const store = await getStore(env)
    const updated = await store.updateQuoteStatus(params.id, status)
    if (!updated) return json({ error: 'NOT_FOUND' }, { status: 404 })
    return json(updated)
  } catch (err) {
    return json({ error: 'DB_ERROR', detail: String(err) }, { status: 500 })
  }
}
