import { json, cors } from '../_lib/db.js'
import { getAuth } from '../_lib/auth.js'

export const onRequestOptions = () => cors()

export const onRequestGet = async ({ request, env }) => {
  const payload = await getAuth(request, env)
  if (!payload) return json({ authenticated: false }, { status: 401 })
  return json({ authenticated: true, role: payload.role, username: payload.sub, exp: payload.exp })
}
