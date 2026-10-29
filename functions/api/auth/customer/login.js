import { json, cors } from '../../_lib/db.js'
import { getStore } from '../../_lib/store.js'
import { adminSecret, verifyPassword, signCustomerToken } from '../../_lib/auth.js'
import { rateLimited } from '../../_lib/ratelimit.js'

export const onRequestOptions = () => cors()

export const onRequestPost = async ({ request, env }) => {
  if (!adminSecret(env)) return json({ error: 'NOT_CONFIGURED' }, { status: 503 })

  if (rateLimited(request, 'auth:customer-login', { limit: 10 })) {
    return json({ error: 'RATE_LIMITED' }, { status: 429, headers: { 'retry-after': '60' } })
  }
  let payload
  try {
    payload = await request.json()
  } catch {
    return json({ error: 'INVALID_JSON' }, { status: 400 })
  }

  const email = String(payload?.email ?? '').trim().toLowerCase()
  const password = String(payload?.password ?? '')

  if (!email || !password) return json({ error: 'EMAIL_REQUIRED' }, { status: 400 })

  const store = await getStore(env)
  const customer = await store.getCustomerByEmail(email)
  if (!customer) return json({ error: 'INVALID_CREDENTIALS' }, { status: 401 })

  const ok = await verifyPassword(password, customer.passwordHash)
  if (!ok) return json({ error: 'INVALID_CREDENTIALS' }, { status: 401 })

  const token = await signCustomerToken(customer, env)
  const { passwordHash: _hash, ...safe } = customer
  return json({ token, customer: safe })
}
