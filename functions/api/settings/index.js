import { json, cors, SEED } from '../_lib/db.js'
import { getStore } from '../_lib/store.js'
import { requireAdmin } from '../_lib/auth.js'

export const onRequestOptions = () => cors()

export const onRequestGet = async ({ env }) => {
  try {
    const store = await getStore(env)
    const settings = await store.getSettings()
    return json(settings, {
      headers: {
        'cache-control': 'public, max-age=60, stale-while-revalidate=300',
        'x-data-source': store.source,
      },
    })
  } catch (err) {
    return json(SEED.settings ?? {}, {
      status: 200,
      headers: { 'x-data-source': 'seed', 'x-error': String(err) },
    })
  }
}

export const onRequestPut = async ({ request, env }) => {
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
    const settings = await store.updateSettings(payload)
    return json(settings)
  } catch (err) {
    return json({ error: 'DB_ERROR', detail: String(err) }, { status: 500 })
  }
}
