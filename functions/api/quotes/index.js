import { json, cors } from '../_lib/db.js'
import { getStore } from '../_lib/store.js'
import { requireAuth } from '../_lib/auth.js'

export const onRequestOptions = () => cors()

export const onRequestGet = async ({ request, env }) => {
  const denied = await requireAuth(request, env)
  if (denied) return denied

  try {
    const store = await getStore(env)
    const quotes = await store.listQuotes()
    return json(quotes, {
      headers: { 'cache-control': 'no-store', 'x-data-source': store.source },
    })
  } catch (err) {
    return json({ error: 'DB_ERROR', detail: String(err) }, { status: 500 })
  }
}
