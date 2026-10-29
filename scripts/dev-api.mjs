// Local dev runner for the Cloudflare Pages Functions in functions/api/.
// No dependencies, no accounts: reuses the exact same handler modules
// that get deployed to Cloudflare Pages, plus a file-backed store so
// admin edits persist locally.
//
//   node scripts/dev-api.mjs          # http://localhost:8787
//
// Set DATABASE_URL in .dev.vars (or the shell) to run against Postgres.
// Otherwise a local JSON database is used (.data/db.json).
import { createServer } from 'node:http'
import { existsSync, readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { createFileStore } from './local-store.mjs'

import * as health from '../functions/api/health.js'
import * as products from '../functions/api/products/index.js'
import * as productById from '../functions/api/products/[id].js'
import * as categories from '../functions/api/categories/index.js'
import * as categoryById from '../functions/api/categories/[id].js'
import * as quote from '../functions/api/quote/index.js'
import * as quotes from '../functions/api/quotes/index.js'
import * as quoteById from '../functions/api/quotes/[id].js'
import * as login from '../functions/api/auth/login.js'
import * as session from '../functions/api/auth/session.js'
import * as register from '../functions/api/auth/register.js'
import * as customerLogin from '../functions/api/auth/customer/login.js'
import * as customerMe from '../functions/api/auth/customer/index.js'
import * as orders from '../functions/api/orders/index.js'
import * as orderById from '../functions/api/orders/[id].js'
import * as adminOrders from '../functions/api/admin/orders/index.js'
import * as adminOrderById from '../functions/api/admin/orders/[id].js'
import * as stats from '../functions/api/admin/stats.js'
import * as settings from '../functions/api/settings/index.js'
import * as brands from '../functions/api/brands/index.js'
import * as brandById from '../functions/api/brands/[id].js'
import * as promos from '../functions/api/promos/index.js'
import * as promoById from '../functions/api/promos/[id].js'
import * as users from '../functions/api/admin/users/index.js'
import * as userById from '../functions/api/admin/users/[id].js'
import * as reports from '../functions/api/admin/reports.js'
import * as exportCsv from '../functions/api/admin/export.js'
import * as importCsv from '../functions/api/admin/import.js'
import * as waConfig from '../functions/api/admin/whatsapp/index.js'
import * as waTest from '../functions/api/admin/whatsapp/test.js'
import * as waMessages from '../functions/api/admin/whatsapp/messages.js'
import * as waWebhook from '../functions/api/whatsapp/webhook.js'
import * as newsletter from '../functions/api/newsletter/index.js'
import * as subscribers from '../functions/api/admin/subscribers/index.js'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const PORT = Number(process.env.API_PORT || 8787)

/* ---- load .dev.vars so DATABASE_URL / ADMIN_PASSWORD are picked up ---- */
function loadDevVars() {
  const file = resolve(root, '.dev.vars')
  if (!existsSync(file)) return
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (!m) continue
    const key = m[1]
    let val = m[2].trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = val
  }
}
loadDevVars()

const store = createFileStore(resolve(root, '.data/db.json'))
// DEV_MODE lets the auth helpers keep their development fallback password and
// secret locally. Cloudflare Pages never sets it, so a deployment refuses to
// issue or accept sessions until ADMIN_PASSWORD / ADMIN_SECRET are configured.
const env = { ...process.env, DEV_MODE: '1', __STORE__: store }

/* ------------------------------ routes ------------------------------ */
// handler names follow the Cloudflare Pages Functions convention.
const routes = [
  ['GET', '/api/health', health.onRequestGet],
  ['GET', '/api/products', products.onRequestGet],
  ['POST', '/api/products', products.onRequestPost],
  ['OPTIONS', '/api/products', products.onRequestOptions],
  ['GET', '/api/products/:id', productById.onRequestGet],
  ['PUT', '/api/products/:id', productById.onRequestPut],
  ['DELETE', '/api/products/:id', productById.onRequestDelete],
  ['OPTIONS', '/api/products/:id', productById.onRequestOptions],
  ['GET', '/api/categories', categories.onRequestGet],
  ['POST', '/api/categories', categories.onRequestPost],
  ['OPTIONS', '/api/categories', categories.onRequestOptions],
  ['GET', '/api/categories/:id', categoryById.onRequestGet],
  ['PUT', '/api/categories/:id', categoryById.onRequestPut],
  ['DELETE', '/api/categories/:id', categoryById.onRequestDelete],
  ['OPTIONS', '/api/categories/:id', categoryById.onRequestOptions],
  ['POST', '/api/quote', quote.onRequestPost],
  ['OPTIONS', '/api/quote', quote.onRequestOptions],
  ['GET', '/api/quotes', quotes.onRequestGet],
  ['OPTIONS', '/api/quotes', quotes.onRequestOptions],
  ['PATCH', '/api/quotes/:id', quoteById.onRequestPatch],
  ['OPTIONS', '/api/quotes/:id', quoteById.onRequestOptions],
  ['POST', '/api/auth/login', login.onRequestPost],
  ['OPTIONS', '/api/auth/login', login.onRequestOptions],
  ['GET', '/api/auth/session', session.onRequestGet],
  ['OPTIONS', '/api/auth/session', session.onRequestOptions],
  ['POST', '/api/auth/register', register.onRequestPost],
  ['OPTIONS', '/api/auth/register', register.onRequestOptions],
  ['POST', '/api/auth/customer/login', customerLogin.onRequestPost],
  ['OPTIONS', '/api/auth/customer/login', customerLogin.onRequestOptions],
  ['GET', '/api/auth/customer', customerMe.onRequestGet],
  ['PATCH', '/api/auth/customer', customerMe.onRequestPatch],
  ['OPTIONS', '/api/auth/customer', customerMe.onRequestOptions],
  ['GET', '/api/orders', orders.onRequestGet],
  ['POST', '/api/orders', orders.onRequestPost],
  ['OPTIONS', '/api/orders', orders.onRequestOptions],
  ['GET', '/api/orders/:id', orderById.onRequestGet],
  ['OPTIONS', '/api/orders/:id', orderById.onRequestOptions],
  ['GET', '/api/admin/stats', stats.onRequestGet],
  ['OPTIONS', '/api/admin/stats', stats.onRequestOptions],
  ['GET', '/api/admin/orders', adminOrders.onRequestGet],
  ['OPTIONS', '/api/admin/orders', adminOrders.onRequestOptions],
  ['GET', '/api/admin/orders/:id', adminOrderById.onRequestGet],
  ['PATCH', '/api/admin/orders/:id', adminOrderById.onRequestPatch],
  ['OPTIONS', '/api/admin/orders/:id', adminOrderById.onRequestOptions],
  ['GET', '/api/settings', settings.onRequestGet],
  ['PUT', '/api/settings', settings.onRequestPut],
  ['OPTIONS', '/api/settings', settings.onRequestOptions],
  ['GET', '/api/brands', brands.onRequestGet],
  ['POST', '/api/brands', brands.onRequestPost],
  ['OPTIONS', '/api/brands', brands.onRequestOptions],
  ['PUT', '/api/brands/:id', brandById.onRequestPut],
  ['DELETE', '/api/brands/:id', brandById.onRequestDelete],
  ['OPTIONS', '/api/brands/:id', brandById.onRequestOptions],
  ['GET', '/api/promos', promos.onRequestGet],
  ['POST', '/api/promos', promos.onRequestPost],
  ['OPTIONS', '/api/promos', promos.onRequestOptions],
  ['PUT', '/api/promos/:id', promoById.onRequestPut],
  ['DELETE', '/api/promos/:id', promoById.onRequestDelete],
  ['OPTIONS', '/api/promos/:id', promoById.onRequestOptions],
  ['GET', '/api/admin/users', users.onRequestGet],
  ['POST', '/api/admin/users', users.onRequestPost],
  ['OPTIONS', '/api/admin/users', users.onRequestOptions],
  ['PUT', '/api/admin/users/:id', userById.onRequestPut],
  ['DELETE', '/api/admin/users/:id', userById.onRequestDelete],
  ['OPTIONS', '/api/admin/users/:id', userById.onRequestOptions],
  ['GET', '/api/admin/reports', reports.onRequestGet],
  ['OPTIONS', '/api/admin/reports', reports.onRequestOptions],
  ['GET', '/api/admin/export', exportCsv.onRequestGet],
  ['OPTIONS', '/api/admin/export', exportCsv.onRequestOptions],
  ['POST', '/api/admin/import', importCsv.onRequestPost],
  ['OPTIONS', '/api/admin/import', importCsv.onRequestOptions],
  ['GET', '/api/admin/whatsapp', waConfig.onRequestGet],
  ['PUT', '/api/admin/whatsapp', waConfig.onRequestPut],
  ['OPTIONS', '/api/admin/whatsapp', waConfig.onRequestOptions],
  ['POST', '/api/admin/whatsapp/test', waTest.onRequestPost],
  ['OPTIONS', '/api/admin/whatsapp/test', waTest.onRequestOptions],
  ['GET', '/api/admin/whatsapp/messages', waMessages.onRequestGet],
  ['OPTIONS', '/api/admin/whatsapp/messages', waMessages.onRequestOptions],
  ['GET', '/api/whatsapp/webhook', waWebhook.onRequestGet],
  ['POST', '/api/whatsapp/webhook', waWebhook.onRequestPost],
  ['OPTIONS', '/api/whatsapp/webhook', waWebhook.onRequestOptions],
  ['POST', '/api/newsletter', newsletter.onRequestPost],
  ['OPTIONS', '/api/newsletter', newsletter.onRequestOptions],
  ['GET', '/api/admin/subscribers', subscribers.onRequestGet],
  ['OPTIONS', '/api/admin/subscribers', subscribers.onRequestOptions],
]

function match(method, path) {
  const parts = path.split('/')
  for (const [m, pattern, handler] of routes) {
    if (m !== method) continue
    const pparts = pattern.split('/')
    if (pparts.length !== parts.length) continue
    const params = {}
    let ok = true
    for (let i = 0; i < pparts.length; i += 1) {
      if (pparts[i].startsWith(':')) {
        params[pparts[i].slice(1)] = decodeURIComponent(parts[i])
      } else if (pparts[i] !== parts[i]) {
        ok = false
        break
      }
    }
    if (ok) return { handler, params }
  }
  return null
}

function readBody(req) {
  return new Promise((res, rej) => {
    const chunks = []
    req.on('data', (c) => chunks.push(c))
    req.on('end', () => res(Buffer.concat(chunks)))
    req.on('error', rej)
  })
}

function source() {
  return env.DATABASE_URL ? 'postgres' : 'local-file'
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`)
  const method = req.method.toUpperCase()
  const path = url.pathname.replace(/\/+$/, '') || '/'

  const hit = match(method, path)
  console.log(`${method.padEnd(7)} ${path}${hit ? '' : '   (no route)'}`)

  if (!hit) {
    res.writeHead(404, { 'content-type': 'application/json; charset=utf-8' })
    res.end(JSON.stringify({ error: 'NOT_FOUND', path }))
    return
  }

  try {
    const init = { method, headers: req.headers }
    if (method !== 'GET' && method !== 'HEAD') {
      init.body = await readBody(req)
      init.duplex = 'half'
    }
    const request = new Request(url.toString(), init)

    const response = await hit.handler({
      request,
      env,
      params: hit.params,
      data: {},
      waitUntil: () => {},
      next: () => new Response('Not found', { status: 404 }),
    })

    const headers = {}
    response.headers.forEach((v, k) => {
      headers[k] = v
    })
    res.writeHead(response.status, headers)
    res.end(Buffer.from(await response.arrayBuffer()))
  } catch (err) {
    console.error('handler error:', err)
    res.writeHead(500, { 'content-type': 'application/json; charset=utf-8' })
    res.end(JSON.stringify({ error: 'INTERNAL', detail: String(err) }))
  }
})

server.listen(PORT, () => {
  console.log(`\n  API dev server  →  http://localhost:${PORT}`)
  console.log(`  data source     →  ${source()}`)
  console.log(`  admin password  →  ${env.ADMIN_PASSWORD || 'admin123 (default)'}`)
  console.log(`  routes          →  products · categories · quotes · auth · stats\n`)
})
