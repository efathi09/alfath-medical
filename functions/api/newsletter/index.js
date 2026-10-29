import { json, cors } from '../_lib/db.js'
import { getStore } from '../_lib/store.js'
import { rateLimited } from '../_lib/ratelimit.js'

export const onRequestOptions = () => cors()

/**
 * Public newsletter opt-in from the storefront footer. Emails are stored
 * plainly (marketing consent, not credentials) and de-duplicated on the
 * server so a double submit never creates a second row.
 */
export const onRequestPost = async ({ request, env }) => {
  if (rateLimited(request, 'newsletter:subscribe', { limit: 5, windowMs: 60_000 })) {
    return json({ error: 'TOO_MANY_REQUESTS' }, { status: 429 })
  }

  let payload
  try {
    payload = await request.json()
  } catch {
    return json({ error: 'INVALID_JSON' }, { status: 400 })
  }

  const email = String(payload?.email ?? '').trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return json({ error: 'EMAIL_INVALID' }, { status: 400 })
  }
  if (email.length > 200) return json({ error: 'EMAIL_INVALID' }, { status: 400 })

  try {
    const store = await getStore(env)
    const row = await store.addSubscriber(email)
    return json(
      { ok: true, email: row.email, duplicate: Boolean(row.duplicate) },
      { status: row.duplicate ? 200 : 201 },
    )
  } catch (err) {
    if (String(err?.message) === 'EMAIL_INVALID') {
      return json({ error: 'EMAIL_INVALID' }, { status: 400 })
    }
    return json({ error: 'DB_ERROR' }, { status: 500 })
  }
}
