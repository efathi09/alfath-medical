import { json, cors } from '../../_lib/db.js'
import { getStore } from '../../_lib/store.js'
import { requireAuth } from '../../_lib/auth.js'

export const onRequestOptions = () => cors()

export const onRequestGet = async ({ request, env }) => {
  const denied = await requireAuth(request, env)
  if (denied) return denied

  const url = new URL(request.url)
  const status = url.searchParams.get('status') || undefined
  const q = (url.searchParams.get('q') || '').trim().toLowerCase()

  try {
    const store = await getStore(env)
    let orders = await store.listOrders(status ? { status } : {})

    if (q) {
      orders = orders.filter((o) => {
        const haystack = [o.number, o.name, o.phone, o.email, o.city, o.address]
          .filter((v) => v != null)
          .join(' ')
          .toLowerCase()
        return haystack.includes(q)
      })
    }

    return json(orders, {
      headers: { 'cache-control': 'no-store', 'x-data-source': store.source },
    })
  } catch (err) {
    return json({ error: 'DB_ERROR', detail: String(err) }, { status: 500 })
  }
}
