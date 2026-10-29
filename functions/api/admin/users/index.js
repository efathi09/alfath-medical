import { json, cors } from '../../_lib/db.js'
import { getStore } from '../../_lib/store.js'
import { requireAdmin, hashPassword } from '../../_lib/auth.js'

export const onRequestOptions = () => cors()

export const onRequestGet = async ({ request, env }) => {
  const denied = await requireAdmin(request, env)
  if (denied) return denied

  try {
    const store = await getStore(env)
    const users = await store.listUsers()
    return json(users, { headers: { 'cache-control': 'no-store' } })
  } catch (err) {
    return json({ error: 'DB_ERROR', detail: String(err) }, { status: 500 })
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

  const username = String(payload?.username ?? '').trim()
  const password = String(payload?.password ?? '')
  if (!username) return json({ error: 'USERNAME_REQUIRED' }, { status: 400 })
  if (password.length < 4) return json({ error: 'PASSWORD_TOO_SHORT' }, { status: 400 })

  try {
    const store = await getStore(env)
    const created = await store.createUser({
      username,
      passwordHash: await hashPassword(password),
      role: payload.role === 'viewer' ? 'viewer' : 'admin',
      isActive: payload.isActive ?? true,
    })
    return json(created, { status: 201 })
  } catch (err) {
    const msg = String(err)
    if (msg.includes('USER_EXISTS') || msg.includes('duplicate key')) {
      return json({ error: 'USER_EXISTS' }, { status: 409 })
    }
    if (msg.includes('USERNAME_REQUIRED')) {
      return json({ error: 'USERNAME_REQUIRED' }, { status: 400 })
    }
    return json({ error: 'DB_ERROR', detail: msg }, { status: 500 })
  }
}
