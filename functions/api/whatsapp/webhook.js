import { json, cors } from '../_lib/db.js'
import { getStore } from '../_lib/store.js'
import {
  loadWaConfig,
  extractInboundMessages,
  verifyWebhookSignature,
} from '../_lib/whatsapp.js'

export const onRequestOptions = () => cors()

// Meta webhook verification handshake.
export const onRequestGet = async ({ request, env }) => {
  const url = new URL(request.url)
  const mode = url.searchParams.get('hub.mode')
  const token = url.searchParams.get('hub.verify_token')
  const challenge = url.searchParams.get('hub.challenge')

  const store = await getStore(env)
  const cfg = await loadWaConfig(store, env)

  if (mode === 'subscribe' && cfg.verifyToken && token === cfg.verifyToken) {
    return new Response(challenge ?? '', {
      status: 200,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    })
  }
  return new Response('FORBIDDEN', { status: 403 })
}

// Incoming messages / status callbacks. We log inbound text messages.
export const onRequestPost = async ({ request, env }) => {
  const raw = await request.text()
  let payload
  try {
    payload = JSON.parse(raw)
  } catch {
    return new Response('BAD_REQUEST', { status: 400 })
  }

  try {
    const store = await getStore(env)
    const cfg = await loadWaConfig(store, env)

    const signature = request.headers.get('x-hub-signature-256')
    const valid = await verifyWebhookSignature(cfg, raw, signature)
    if (!valid) return new Response('INVALID_SIGNATURE', { status: 401 })

    const inbound = extractInboundMessages(payload)
    for (const msg of inbound) {
      await store.createMessage(msg)
    }
    return json({ received: inbound.length })
  } catch (err) {
    return json({ error: 'DB_ERROR', detail: String(err) }, { status: 500 })
  }
}
