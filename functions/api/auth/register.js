import { json, cors } from '../_lib/db.js'
import { getStore } from '../_lib/store.js'
import { adminSecret, hashPassword, signCustomerToken } from '../_lib/auth.js'
import { rateLimited } from '../_lib/ratelimit.js'

export const onRequestOptions = () => cors()

export const onRequestPost = async ({ request, env }) => {
  if (!adminSecret(env)) return json({ error: 'NOT_CONFIGURED' }, { status: 503 })

  if (rateLimited(request, 'auth:register', { limit: 5 })) {
    return json({ error: 'RATE_LIMITED' }, { status: 429, headers: { 'retry-after': '60' } })
  }

  let payload
  try {
    payload = await request.json()
  } catch {
    return json({ error: 'INVALID_JSON' }, { status: 400 })
  }

  const name = String(payload?.name ?? '').trim()
  const phone = String(payload?.phone ?? '').trim()
  const email = String(payload?.email ?? '').trim().toLowerCase()
  const password = String(payload?.password ?? '')

  if (name.length < 2) return json({ error: 'NAME_REQUIRED' }, { status: 400 })
  if (phone.replace(/\D/g, '').length < 8) return json({ error: 'PHONE_INVALID' }, { status: 400 })
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return json({ error: 'EMAIL_INVALID' }, { status: 400 })
  if (password.length < 6) return json({ error: 'PASSWORD_TOO_SHORT' }, { status: 400 })

  let customer
  try {
    const store = await getStore(env)
    const passwordHash = await hashPassword(password)
    customer = await store.createCustomer({ name, phone, email, passwordHash })
  } catch (err) {
    const msg = String(err)
    if (msg.includes('EMAIL_EXISTS') || msg.includes('duplicate key') || msg.includes('unique')) {
      return json({ error: 'EMAIL_EXISTS' }, { status: 409 })
    }
    return json({ error: 'DB_ERROR', detail: msg }, { status: 500 })
  }

  const token = await signCustomerToken(customer, env)
  return json({ token, customer }, { status: 201 })
}
