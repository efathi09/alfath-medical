import { json, cors, SEED } from '../_lib/db.js'
import { getStore } from '../_lib/store.js'
import { requireAdmin, requireAuth } from '../_lib/auth.js'

export const onRequestOptions = () => cors()

export const onRequestGet = async ({ request, env }) => {
  const url = new URL(request.url)
  const includeInactive = url.searchParams.get('all') === '1'

  try {
    if (includeInactive) {
      const denied = await requireAuth(request, env)
      if (denied) return denied
    }
    const store = await getStore(env)
    const promos = await store.listPromos({ includeInactive })
    return json(promos, {
      headers: {
        'cache-control': includeInactive
          ? 'no-store'
          : 'public, max-age=60, stale-while-revalidate=300',
        'x-data-source': store.source,
      },
    })
  } catch (err) {
    return json(SEED.promos ?? [], {
      status: 200,
      headers: { 'x-data-source': 'seed', 'x-error': String(err) },
    })
  }
}

export const onRequestPost = async ({ request, env }) => {
  const denied = await requireAdmin(request, env)
  if (denied) return denied

  let payload
  try {
    payload = await request.json()
  } catch {
    return json({ error: 'INVALID_JSON' }, { status: 400 })
  }
  if (!payload?.id) return json({ error: 'PRODUCT_REQUIRED' }, { status: 400 })

  try {
    const store = await getStore(env)
    const created = await store.createPromo(payload)
    return json(created, { status: 201 })
  } catch (err) {
    const msg = String(err)
    if (msg.includes('PROMO_EXISTS') || msg.includes('duplicate key')) {
      return json({ error: 'PROMO_EXISTS' }, { status: 409 })
    }
    return json({ error: 'DB_ERROR', detail: msg }, { status: 500 })
  }
}
