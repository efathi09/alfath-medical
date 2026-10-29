import { json, cors } from '../../_lib/db.js'
import { getStore } from '../../_lib/store.js'
import { getCustomer, hashPassword } from '../../_lib/auth.js'

export const onRequestOptions = () => cors()

export const onRequestGet = async ({ request, env }) => {
  const session = await getCustomer(request, env)
  if (!session) return json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const store = await getStore(env)
  const customer = await store.getCustomer(session.sub)
  if (!customer) return json({ error: 'NOT_FOUND' }, { status: 404 })

  const { passwordHash: _passwordHash, ...safe } = customer
  return json(safe, { headers: { 'cache-control': 'no-store', 'x-data-source': store.source } })
}

export const onRequestPatch = async ({ request, env }) => {
  const session = await getCustomer(request, env)
  if (!session) return json({ error: 'UNAUTHORIZED' }, { status: 401 })

  let payload
  try {
    payload = await request.json()
  } catch {
    return json({ error: 'INVALID_JSON' }, { status: 400 })
  }

  const patch = {}
  if (typeof payload?.name === 'string') patch.name = payload.name.trim()
  if (typeof payload?.phone === 'string') patch.phone = payload.phone.trim()
  if (typeof payload?.email === 'string') patch.email = payload.email.trim().toLowerCase()
  if (payload?.address !== undefined) patch.address = payload.address
  if (payload?.city !== undefined) patch.city = payload.city
  if (payload?.notes !== undefined) patch.notes = payload.notes

  if (payload?.password) {
    const plain = String(payload.password)
    if (plain.length < 6) return json({ error: 'PASSWORD_TOO_SHORT' }, { status: 400 })
    patch.passwordHash = await hashPassword(plain)
  }

  const store = await getStore(env)
  let customer
  try {
    customer = await store.updateCustomer(session.sub, patch)
  } catch (err) {
    const msg = String(err)
    if (msg.includes('EMAIL_EXISTS') || msg.includes('duplicate key') || msg.includes('unique')) {
      return json({ error: 'EMAIL_EXISTS' }, { status: 409 })
    }
    return json({ error: 'DB_ERROR', detail: msg }, { status: 500 })
  }

  if (!customer) return json({ error: 'NOT_FOUND' }, { status: 404 })
  const { passwordHash: _passwordHash, ...safe } = customer
  return json(safe)
}
