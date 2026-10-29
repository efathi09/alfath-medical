import { json, cors } from '../_lib/db.js'
import { getStore } from '../_lib/store.js'
import { getCustomer } from '../_lib/auth.js'

export const onRequestOptions = () => cors()

const FREE_SHIPPING_THRESHOLD = 500
const SHIPPING_FEE = 35

export const onRequestGet = async ({ request, env }) => {
  const session = await getCustomer(request, env)
  if (!session) return json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const store = await getStore(env)
  const orders = await store.listOrders({ customerId: session.sub })
  return json(orders, { headers: { 'cache-control': 'no-store', 'x-data-source': store.source } })
}

export const onRequestPost = async ({ request, env }) => {
  // Guest checkout: a session is optional. When present the order is linked to
  // the customer's account; when absent the order still lands in the admin
  // panel with the details the visitor typed in the form.
  const session = await getCustomer(request, env)

  let payload
  try {
    payload = await request.json()
  } catch {
    return json({ error: 'INVALID_JSON' }, { status: 400 })
  }

  const name = String(payload?.name ?? session?.name ?? '').trim()
  const phone = String(payload?.phone ?? session?.phone ?? '').trim()
  const email = payload?.email ? String(payload.email).trim() : (session?.email ?? null)
  const address = payload?.address ? String(payload.address).trim() : null
  const city = payload?.city ? String(payload.city).trim() : null
  const notes = payload?.notes ? String(payload.notes).trim() : null
  const items = Array.isArray(payload?.items) ? payload.items : []

  if (name.length < 2) return json({ error: 'NAME_REQUIRED' }, { status: 400 })
  if (phone.replace(/\D/g, '').length < 8) return json({ error: 'PHONE_INVALID' }, { status: 400 })
  if (!address) return json({ error: 'ADDRESS_REQUIRED' }, { status: 400 })
  if (items.length === 0) return json({ error: 'ITEMS_REQUIRED' }, { status: 400 })

  // Prices are always taken from the store so a tampered client cannot
  // submit a discounted total.
  const store = await getStore(env)
  const lines = []
  let subtotal = 0
  for (const item of items) {
    const qty = Math.max(1, Math.min(999, Number(item.qty ?? 1) || 1))
    const live = await store.getProduct(item.id)
    if (!live) continue
    const price = Number(live.price ?? 0)
    const oldPrice = Number(live.oldPrice ?? 0) || null
    lines.push({
      id: item.id,
      name: live.name ?? { ar: item.name ?? '', en: item.nameEn ?? '' },
      brand: live.brand ?? item.brand ?? null,
      qty,
      price,
      oldPrice,
    })
    subtotal += price * qty
  }
  if (lines.length === 0) return json({ error: 'ITEMS_REQUIRED' }, { status: 400 })

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
  const total = subtotal + shipping

  let order
  try {
    order = await store.createOrder({
      customerId: session?.sub ?? null,
      name,
      phone,
      email,
      address,
      city,
      notes,
      items: lines,
      subtotal,
      shipping,
      discount: 0,
      total,
      paymentMethod: payload?.paymentMethod === 'card' ? 'card' : 'cod',
      source: payload?.source === 'web' ? 'web' : 'app',
    })
  } catch (err) {
    return json({ error: 'DB_ERROR', detail: String(err) }, { status: 500 })
  }

  return json(order, { status: 201 })
}
