import { json, cors } from '../../_lib/db.js'
import { getStore } from '../../_lib/store.js'
import { requireAdmin, requireAuth } from '../../_lib/auth.js'

const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

export const onRequestOptions = () => cors()

export const onRequestGet = async ({ request, env, params }) => {
  const denied = await requireAuth(request, env)
  if (denied) return denied

  try {
    const store = await getStore(env)
    const order = await store.getOrder(params.id)
    if (!order) return json({ error: 'NOT_FOUND' }, { status: 404 })
    return json(order, { headers: { 'cache-control': 'no-store' } })
  } catch (err) {
    return json({ error: 'DB_ERROR', detail: String(err) }, { status: 500 })
  }
}

export const onRequestPatch = async ({ request, env, params }) => {
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
    const updated = await store.updateOrderStatus(params.id, status)
    if (!updated) return json({ error: 'NOT_FOUND' }, { status: 404 })
    return json(updated)
  } catch (err) {
    return json({ error: 'DB_ERROR', detail: String(err) }, { status: 500 })
  }
}
