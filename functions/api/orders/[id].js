import { json, cors } from '../_lib/db.js'
import { getStore } from '../_lib/store.js'
import { getCustomer } from '../_lib/auth.js'

export const onRequestOptions = () => cors()

export const onRequestGet = async ({ request, env, params }) => {
  const session = await getCustomer(request, env)
  if (!session) return json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const store = await getStore(env)
  const order = await store.getOrder(params.id)
  if (!order) return json({ error: 'NOT_FOUND' }, { status: 404 })
  if (order.customerId && String(order.customerId) !== String(session.sub)) {
    return json({ error: 'NOT_FOUND' }, { status: 404 })
  }

  return json(order, { headers: { 'cache-control': 'no-store', 'x-data-source': store.source } })
}
