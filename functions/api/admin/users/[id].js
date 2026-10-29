import { json, cors } from '../../_lib/db.js'
import { getStore } from '../../_lib/store.js'
import { getAuth, requireAdmin, hashPassword } from '../../_lib/auth.js'

export const onRequestOptions = () => cors()

export const onRequestPut = async ({ request, params, env }) => {
  const denied = await requireAdmin(request, env)
  if (denied) return denied

  let payload
  try {
    payload = await request.json()
  } catch {
    return json({ error: 'INVALID_JSON' }, { status: 400 })
  }

  const patch = {}
  if (payload.username) patch.username = String(payload.username).trim()
  if (payload.role) patch.role = payload.role === 'viewer' ? 'viewer' : 'admin'
  if (payload.isActive != null) patch.isActive = payload.isActive
  if (payload.password) {
    if (String(payload.password).length < 4) {
      return json({ error: 'PASSWORD_TOO_SHORT' }, { status: 400 })
    }
    patch.passwordHash = await hashPassword(String(payload.password))
  }

  try {
    const store = await getStore(env)
    const updated = await store.updateUser(params.id, patch)
    if (!updated) return json({ error: 'NOT_FOUND' }, { status: 404 })
    return json(updated)
  } catch (err) {
    const msg = String(err)
    if (msg.includes('duplicate key')) return json({ error: 'USER_EXISTS' }, { status: 409 })
    return json({ error: 'DB_ERROR', detail: msg }, { status: 500 })
  }
}

export const onRequestDelete = async ({ request, params, env }) => {
  const denied = await requireAdmin(request, env)
  if (denied) return denied

  const auth = await getAuth(request, env)
  try {
    const store = await getStore(env)
    const users = await store.listUsers()
    const target = users.find((u) => String(u.id) === String(params.id))
    if (target && auth?.sub && target.username === auth.sub) {
      return json({ error: 'CANNOT_DELETE_SELF' }, { status: 400 })
    }
    const ok = await store.deleteUser(params.id)
    if (!ok) return json({ error: 'NOT_FOUND' }, { status: 404 })
    return json({ ok: true })
  } catch (err) {
    return json({ error: 'DB_ERROR', detail: String(err) }, { status: 500 })
  }
}
