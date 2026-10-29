import { json, cors } from '../_lib/db.js'
import { getStore } from '../_lib/store.js'
import { requireAdmin } from '../_lib/auth.js'

export const onRequestOptions = () => cors()

export const onRequestPut = async ({ request, params, env }) => {
  const denied = await requireAdmin(request, env)
  if (denied) return denied

  let payload
  try {
    payload = await request.json()
  } catch {
    return json({ error: 'INVALID_JSON' }, { status: 400 })
  }

  try {
    const store = await getStore(env)
    const updated = await store.updateBrand(params.id, payload)
    if (!updated) return json({ error: 'NOT_FOUND' }, { status: 404 })
    return json(updated)
  } catch (err) {
    return json({ error: 'DB_ERROR', detail: String(err) }, { status: 500 })
  }
}

export const onRequestDelete = async ({ request, params, env }) => {
  const denied = await requireAdmin(request, env)
  if (denied) return denied

  try {
    const store = await getStore(env)
    const ok = await store.deleteBrand(params.id)
    if (!ok) return json({ error: 'NOT_FOUND' }, { status: 404 })
    return json({ ok: true })
  } catch (err) {
    return json({ error: 'DB_ERROR', detail: String(err) }, { status: 500 })
  }
}
