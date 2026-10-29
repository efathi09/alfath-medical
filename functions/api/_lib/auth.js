import { json } from './db.js'

const encoder = new TextEncoder()

/* ----------------------------- base64url ----------------------------- */

function b64urlEncode(input) {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input)
  let bin = ''
  for (let i = 0; i < bytes.length; i += 1) bin += String.fromCharCode(bytes[i])
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function b64urlDecode(str) {
  const pad = str.length % 4 ? '='.repeat(4 - (str.length % 4)) : ''
  const bin = atob(str.replace(/-/g, '+').replace(/_/g, '/') + pad)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i)
  return bytes
}

/* ------------------------------- config ------------------------------ */

/* Development-only defaults. scripts/dev-api.mjs sets DEV_MODE=1 so local work
   keeps running out of the box. Cloudflare Pages never sets it, so a deployment
   without ADMIN_SECRET / ADMIN_PASSWORD fails closed instead of falling back to
   values that are readable in the repository. */
const DEV_PASSWORD = 'admin123'
const DEV_SECRET = 'alfath-dev-secret-change-me'

function isDev(env) {
  return Boolean(env && env.DEV_MODE === '1')
}

export function adminPassword(env) {
  if (env && env.ADMIN_PASSWORD) return env.ADMIN_PASSWORD
  return isDev(env) ? DEV_PASSWORD : null
}

export function adminSecret(env) {
  if (env && env.ADMIN_SECRET) return env.ADMIN_SECRET
  return isDev(env) ? DEV_SECRET : null
}

const TOKEN_TTL = 60 * 60 * 12 // 12h

/* ------------------------------- token ------------------------------- */

async function hmacKey(secret, usages) {
  return crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, usages)
}

export async function signToken(payload, secret) {
  if (!secret) throw new Error('ADMIN_SECRET is not configured')
  const now = Math.floor(Date.now() / 1000)
  const body = { ...payload, iat: now, exp: now + TOKEN_TTL }
  const data = b64urlEncode(encoder.encode(JSON.stringify(body)))
  const key = await hmacKey(secret, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(data))
  return `${data}.${b64urlEncode(sig)}`
}

export async function verifyToken(token, secret) {
  if (!secret || !token || typeof token !== 'string' || !token.includes('.')) return null
  const [data, sig] = token.split('.')
  try {
    const key = await hmacKey(secret, ['verify'])
    const ok = await crypto.subtle.verify('HMAC', key, b64urlDecode(sig), encoder.encode(data))
    if (!ok) return null
    const payload = JSON.parse(new TextDecoder().decode(b64urlDecode(data)))
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  } catch {
    return null
  }
}

export function bearer(request) {
  const header = request.headers.get('authorization') || ''
  return header.replace(/^Bearer\s+/i, '').trim()
}

/** Returns the verified token payload, or null. */
export async function getAuth(request, env) {
  const payload = await verifyToken(bearer(request), adminSecret(env))
  if (!payload || !['admin', 'viewer'].includes(payload.role)) return null
  return payload
}

/** Returns null when authorised, otherwise a 401 Response. */
export async function requireAuth(request, env) {
  const payload = await getAuth(request, env)
  if (!payload) return json({ error: 'UNAUTHORIZED' }, { status: 401 })
  return null
}

export async function requireAdmin(request, env) {
  const payload = await getAuth(request, env)
  if (!payload) return json({ error: 'UNAUTHORIZED' }, { status: 401 })
  if (payload.role !== 'admin') return json({ error: 'FORBIDDEN' }, { status: 403 })
  return null
}

/* --------------------------- customer sessions ---------------------------- */

const CUSTOMER_TOKEN_TTL = 60 * 60 * 24 * 30 // 30 days

export async function signCustomerToken(customer, env) {
  const secret = adminSecret(env)
  if (!secret) throw new Error('ADMIN_SECRET is not configured')
  const now = Math.floor(Date.now() / 1000)
  const body = {
    sub: customer.id,
    role: 'customer',
    kind: 'customer',
    name: customer.name,
    phone: customer.phone,
    email: customer.email ?? null,
    iat: now,
    exp: now + CUSTOMER_TOKEN_TTL,
  }
  const data = b64urlEncode(encoder.encode(JSON.stringify(body)))
  const key = await hmacKey(secret, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(data))
  return `${data}.${b64urlEncode(sig)}`
}

/** Returns the customer session payload, or null. */
export async function getCustomer(request, env) {
  const payload = await verifyToken(bearer(request), adminSecret(env))
  if (!payload || payload.role !== 'customer') return null
  return payload
}

/** Returns the customer session payload, or a 401 Response. */
export async function requireCustomer(request, env) {
  const payload = await getCustomer(request, env)
  if (!payload) return json({ error: 'UNAUTHORIZED' }, { status: 401 })
  return payload
}

/* --------------------------- password hashing --------------------------- */
/* PBKDF2-SHA256 via Web Crypto (works on Cloudflare Workers + Node 18+). */

const PBKDF2_ITERATIONS = 100000
const PBKDF2_KEYLEN = 32

export async function hashPassword(plain) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const key = await crypto.subtle.importKey('raw', encoder.encode(String(plain)), 'PBKDF2', false, [
    'deriveBits',
  ])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    key,
    PBKDF2_KEYLEN * 8,
  )
  return `pbkdf2$${PBKDF2_ITERATIONS}$${b64urlEncode(salt)}$${b64urlEncode(new Uint8Array(bits))}`
}

function timingSafeEqual(a, b) {
  if (!a || !b || a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i += 1) diff |= a[i] ^ b[i]
  return diff === 0
}

export async function verifyPassword(plain, stored) {
  try {
    const [algo, iterStr, saltStr, hashStr] = String(stored).split('$')
    if (algo !== 'pbkdf2' || !saltStr || !hashStr) return false
    const iterations = Number(iterStr) || PBKDF2_ITERATIONS
    const key = await crypto.subtle.importKey('raw', encoder.encode(String(plain)), 'PBKDF2', false, [
      'deriveBits',
    ])
    const bits = new Uint8Array(
      await crypto.subtle.deriveBits(
        { name: 'PBKDF2', salt: b64urlDecode(saltStr), iterations, hash: 'SHA-256' },
        key,
        PBKDF2_KEYLEN * 8,
      ),
    )
    return timingSafeEqual(bits, b64urlDecode(hashStr))
  } catch {
    return false
  }
}
