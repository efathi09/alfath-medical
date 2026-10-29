import { json, cors } from '../_lib/db.js'
import { getStore } from '../_lib/store.js'
import { requireAdmin } from '../_lib/auth.js'

export const onRequestOptions = () => cors()

export const onRequestGet = async ({ params, env }) => {
  try {
    const store = await getStore(env)
    const category = await store.getCategory(params.id)
    if (!category) return json({ error: 'NOT_FOUND' }, { status: 404 })
    return json(category)
  } catch (err) {
    return json({ error: 'DB_ERROR', detail: String(err) }, { status: 500 })
  }
}

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
    const updated = await store.updateCategory(params.id, payload)
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
    const ok = await store.deleteCategory(params.id)
    if (!ok) return json({ error: 'NOT_FOUND' }, { status: 404 })
    return json({ ok: true })
  } catch (err) {
    const msg = String(err)
    if (msg.includes('CATEGORY_IN_USE')) {
      return json({ error: 'CATEGORY_IN_USE' }, { status: 409 })
    }
    return json({ error: 'DB_ERROR', detail: msg }, { status: 500 })
  }
}
