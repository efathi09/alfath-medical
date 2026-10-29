import WebSocket from 'ws'

const res = await fetch('http://localhost:9222/json')
const list = await res.json()
const page = list.find((p) => p.type === 'page') || list[0]
const ws = new WebSocket(page.webSocketDebuggerUrl)
await new Promise((r) => ws.on('open', r))

function send(method, params) {
  return new Promise((resolve) => {
    const id = Math.floor(Math.random() * 1e6)
    const onMsg = (data) => {
      const msg = JSON.parse(data.toString())
      if (msg.id === id) {
        ws.off('message', onMsg)
        resolve(msg)
      }
    }
    ws.on('message', onMsg)
    ws.send(JSON.stringify({ id, method, params }))
  })
}
const evalExpr = async (expression) => {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  if (r.result?.exceptionDetails) return 'EXC: ' + JSON.stringify(r.result.exceptionDetails.exception?.description)
  return r.result?.result?.value
}
const setInput = (selector, value) =>
  evalExpr(`(() => {
    const el = document.querySelector(${JSON.stringify(selector)})
    if (!el) return 'not found'
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
    setter.call(el, ${JSON.stringify(value)})
    el.dispatchEvent(new Event('input', { bubbles: true }))
    return 'set'
  })()`)
const clickText = (selector, text) =>
  evalExpr(`(() => {
    const els = Array.from(document.querySelectorAll(${JSON.stringify(selector)}))
    const el = els.find(e => e.innerText && e.innerText.trim().includes(${JSON.stringify(text)}))
    if (!el) return 'not found: ' + ${JSON.stringify(text)}
    el.click(); return 'clicked'
  })()`)

// open register
console.log('→ register', await clickText('button', 'إنشاء حساب'))
await new Promise((r) => setTimeout(r, 600))
console.log('FIELDS:', await evalExpr(`Array.from(document.querySelectorAll('input')).map(i=>i.type).join(',')`))

const email = `app${Date.now()}@example.com`
await setInput('input[autocomplete="name"]', 'عميل التطبيق')
await setInput('input[type="tel"]', '01066660200')
await setInput('input[type="email"]', email)
await setInput('input[type="password"]', 'secret123')
await new Promise((r) => setTimeout(r, 300))
console.log('→ submit', await clickText('button[type="submit"]', 'إنشاء الحساب'))
await new Promise((r) => setTimeout(r, 2500))
console.log('AFTER SUBMIT (account?):', (await evalExpr('document.body.innerText')).replace(/\n{2,}/g, '\n').slice(0, 260))
console.log('TOKEN:', await evalExpr("localStorage.getItem('me.customerToken') ? 'SAVED' : 'none'"))
ws.close()

// stash email for reuse
process.stdout.write('\nEMAIL=' + email + '\n')
