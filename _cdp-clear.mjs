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

await send('Network.enable', {})
await send('Network.clearBrowserCache', {})
console.log('unregister:', await evalExpr(`(async()=>{const rs=await navigator.serviceWorker.getRegistrations();await Promise.all(rs.map(r=>r.unregister()));const ks=await caches.keys();await Promise.all(ks.map(k=>caches.delete(k)));return rs.length+' sw, '+ks.length+' caches cleared'})()`))
await send('Page.enable', {})
await send('Page.navigate', { url: 'https://localhost/?ui=app' })
await new Promise((r) => setTimeout(r, 5000))
console.log('URL   :', await evalExpr('location.href'))
console.log('STATE :', await evalExpr(`JSON.stringify({sw: !!navigator.serviceWorker.controller, appShell: !!document.querySelector('.app-shell'), navBtns: Array.from(document.querySelectorAll('nav button')).map(b=>b.innerText.trim()).join(' | '), tiles: document.querySelectorAll('.app-tap').length})`))
console.log('TEXT  :', (await evalExpr('document.body.innerText')).slice(0, 300).replace(/\n{2,}/g, '\n'))
ws.close()
