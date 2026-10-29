/**
 * In-memory rate limiter for the credential endpoints.
 *
 * It lives in a module-scope Map, so the limit is per isolate. That is enough to
 * blunt credential stuffing (each brute-force burst mostly hits one worker) and
 * it costs nothing on the endpoints that need it. A distributed limiter (Cloudflare
 * Rate Limiting / KV) can replace it later without touching the call sites.
 */

const hits = new Map()
const MAX_KEYS = 5000

function clientKey(request) {
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'local'
  )
}

/**
 * Records one attempt and returns true when the caller has exceeded the budget.
 *
 * @param {Request} request
 * @param {string} route   logical bucket, e.g. 'auth:admin-login'
 * @param {{ limit?: number, windowMs?: number }} [options]
 * @returns {boolean} true when the request must be rejected with 429
 */
export function rateLimited(request, route, options = {}) {
  const limit = options.limit ?? 10
  const windowMs = options.windowMs ?? 60_000
  const now = Date.now()
  const key = `${route}|${clientKey(request)}`

  let bucket = hits.get(key)
  if (!bucket || now >= bucket.reset) {
    bucket = { count: 0, reset: now + windowMs }
    hits.set(key, bucket)
  }
  bucket.count += 1

  if (hits.size > MAX_KEYS) {
    for (const [k, v] of hits) {
      if (now >= v.reset) hits.delete(k)
    }
  }

  return bucket.count > limit
}
