import { json, cors } from '../_lib/db.js'
import { adminPassword, adminSecret, signToken, verifyPassword } from '../_lib/auth.js'
import { rateLimited } from '../_lib/ratelimit.js'
import { getStore } from '../_lib/store.js'

export const onRequestOptions = () => cors()

export const onRequestPost = async ({ request, env }) => {
  const secret = adminSecret(env)
  // Deployment is missing ADMIN_SECRET: refuse to issue or accept sessions.
  if (!secret) return json({ error: 'NOT_CONFIGURED' }, { status: 503 })

  if (rateLimited(request, 'auth:admin-login', { limit: 8 })) {
    return json({ error: 'RATE_LIMITED' }, { status: 429, headers: { 'retry-after': '60' } })
  }

  let payload
  try {
    payload = await request.json()
  } catch {
    return json({ error: 'INVALID_JSON' }, { status: 400 })
  }

  const username = (String(payload?.username ?? 'admin').trim() || 'admin').toLowerCase()
  const password = String(payload?.password ?? '')
  if (!password) return json({ error: 'INVALID_CREDENTIALS' }, { status: 401 })

  // 1) Master admin: username "admin" + the deployment ADMIN_PASSWORD env var.
  const masterPassword = adminPassword(env)
  if (username === 'admin' && masterPassword && password === masterPassword) {
    const token = await signToken({ sub: 'admin', role: 'admin' }, secret)
    return json({ token, role: 'admin', username: 'admin', expiresIn: 12 * 3600 })
  }

  // 2) Additional users stored in the database.
  try {
    const store = await getStore(env)
    const user = await store.getUserByUsername(username)
    if (user && user.isActive !== false && (await verifyPassword(password, user.passwordHash))) {
      const token = await signToken({ sub: user.username, role: user.role }, secret)
      return json({ token, role: user.role, username: user.username, expiresIn: 12 * 3600 })
    }
  } catch {
    /* fall through to 401 */
  }

  return json({ error: 'INVALID_CREDENTIALS' }, { status: 401 })
}
