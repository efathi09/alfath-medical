import { json, cors } from '../../_lib/db.js'
import { getStore } from '../../_lib/store.js'
import { requireAdmin } from '../../_lib/auth.js'

export const onRequestOptions = () => cors()

export const onRequestGet = async ({ request, env }) => {
  const denied = await requireAdmin(request, env)
  if (denied) return denied

  try {
    const store = await getStore(env)
    const messages = await store.listMessages({ limit: 100 })
    return json({ messages })
  } catch (err) {
    return json({ error: 'DB_ERROR', detail: String(err) }, { status: 500 })
  }
}
