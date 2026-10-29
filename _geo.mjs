// One-off probe: read the live WebView viewport geometry.
import { execFileSync } from 'node:child_process'

const adb = process.env.LOCALAPPDATA + '\\Android\\Sdk\\platform-tools\\adb.exe'
const unix = execFileSync(adb, ['shell', 'cat', '/proc/net/unix'], { encoding: 'utf8' })
const m = unix.match(/webview_devtools_remote_(\d+)/)
if (!m) {
  console.log('no devtools socket found')
  process.exit(1)
}
execFileSync(adb, ['forward', 'tcp:9333', 'localabstract:webview_devtools_remote_' + m[1]])
const list = await (await fetch('http://127.0.0.1:9333/json')).json()
const page = list.find((t) => t.type === 'page')
if (!page) {
  console.log('no page target')
  process.exit(1)
}
const ws = new WebSocket(page.webSocketDebuggerUrl)
await new Promise((r) => (ws.onopen = r))
let id = 0
const send = (method, params = {}) =>
  new Promise((resolve) => {
    const n = ++id
    const h = (e) => {
      const msg = JSON.parse(e.data)
      if (msg.id === n) {
        ws.removeEventListener('message', h)
        resolve(msg.result)
      }
    }
    ws.addEventListener('message', h)
    ws.send(JSON.stringify({ id: n, method, params }))
  })
const expr = [
  'JSON.stringify({',
  'innerW: innerWidth,',
  'innerH: innerHeight,',
  'vh: visualViewport ? visualViewport.height : null,',
  'vhOffTop: visualViewport ? visualViewport.offsetTop : null,',
  'screenW: screen.width,',
  'screenH: screen.height,',
  'dpr: devicePixelRatio,',
  'appBar: (function(){var el=document.querySelector("header"); if(!el) return null; var r=el.getBoundingClientRect(); return {top:r.top,bottom:r.bottom,h:r.height};})(),',
  'bodyBg: getComputedStyle(document.body).backgroundColor,',
  'rootPad: getComputedStyle(document.getElementById("root")).paddingTop',
  '})',
].join('')
const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true })
console.log(r.result.value)
ws.close()
process.exit(0)
