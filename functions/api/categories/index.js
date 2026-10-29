import { json, cors, SEED, mapCategory } from '../_lib/db.js'
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
    const categories = await store.listCategories({ includeInactive })

    return json(categories, {
      headers: {
        'cache-control': includeInactive
          ? 'no-store'
          : 'public, max-age=60, stale-while-revalidate=300',
        'x-data-source': store.source,
      },
    })
  } catch (err) {
    return json(SEED.categories.map(mapCategory), {
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

  if (!payload?.name?.ar && !payload?.name?.en) {
    return json({ error: 'NAME_REQUIRED' }, { status: 400 })
  }

  try {
    const store = await getStore(env)
    const created = await store.createCategory(payload)
    return json(created, { status: 201 })
  } catch (err) {
    const msg = String(err)
    if (msg.includes('CATEGORY_EXISTS') || msg.includes('duplicate key')) {
      return json({ error: 'CATEGORY_EXISTS' }, { status: 409 })
    }
    return json({ error: 'DB_ERROR', detail: msg }, { status: 500 })
  }
}
