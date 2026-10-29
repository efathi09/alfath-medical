// Comparison sheet for the three splash options.
// Row per variant, one thumbnail every 4th captured frame, labelled with what is on
// screen and roughly when it happened.
import sharp from 'sharp'
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const desktop = 'C:/Users/Ehab/Desktop'
const variants = [
  { dir: 'vA-both', label: 'A  native splash + web overlay   (current)' },
  { dir: 'vB-nooverlay', label: 'B  native splash only' },
  { dir: 'vC-noicon', label: 'C  web overlay only' },
]
const STEP = 4
const FRAME_MS = 2500

async function analyse(file) {
  const img = sharp(file)
  const meta = await img.metadata()
  const x0 = Math.round(meta.width * 0.1)
  const w = Math.round(meta.width * 0.8)
  const y0 = Math.round(meta.height * 0.18)
  const h = Math.round(meta.height * 0.64)
  const { data, info } = await img
    .extract({ left: x0, top: y0, width: w, height: h })
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true })
  const { width: ww, height: hh, channels: ch } = info
  let minX = ww, maxX = 0, count = 0
  for (let y = 0; y < hh; y += 2) {
    for (let x = 0; x < ww; x += 2) {
      if (data[(y * ww + x) * ch] < 170) {
        count++
        if (x < minX) minX = x
        if (x > maxX) maxX = x
      }
    }
  }
  if (!count) return { kind: 'blank' }
  const wDp = Math.round((maxX - minX) / 2.628)
  if (wDp > 260) return { kind: 'app' }
  return { kind: 'logo', wDp }
}

const rows = []
for (const v of variants) {
  const dir = resolve(desktop, v.dir)
  const files = readdirSync(dir).filter((f) => f.endsWith('.png')).sort()
  const timesFile = resolve(dir, 'times.txt')
  const times = existsSync(timesFile)
    ? readFileSync(timesFile, 'utf8').split('\n').map((n) => Number(n.trim())).filter(Boolean)
    : files.map((_, i) => i * FRAME_MS)
  const picks = []
  for (let i = 0; i < files.length; i += STEP) {
    const a = await analyse(resolve(dir, files[i]))
    const t = times ? Math.round((times[i] - times[0]) / 1000) : Math.round((i * FRAME_MS) / 1000)
    picks.push({ f: files[i], a, t })
  }
  rows.push({ ...v, picks })
}

const cellW = 150
const cellH = Math.round((2400 / 1080) * cellW)
const GAP = 8
const LABEL_H = 22
const cols = Math.max(...rows.map((r) => r.picks.length))
const sheetW = cols * cellW + (cols + 1) * GAP
const rowH = cellH + LABEL_H * 2 + GAP
const sheetH = rows.length * rowH + GAP

const composites = []
for (let r = 0; r < rows.length; r++) {
  const row = rows[r]
  composites.push({
    input: Buffer.from(
      `<svg width="${sheetW}" height="${LABEL_H}"><rect width="100%" height="100%" fill="#020617"/>` +
        `<text x="8" y="16" font-family="Arial" font-size="13" font-weight="bold" fill="#e2e8f0">${row.label}</text></svg>`
    ),
    top: GAP + r * rowH,
    left: GAP,
  })
  for (let c = 0; c < row.picks.length; c++) {
    const p = row.picks[c]
    const thumb = await sharp(resolve(desktop, row.dir, p.f)).resize(cellW, cellH).toBuffer()
    composites.push({ input: thumb, top: GAP + r * rowH + LABEL_H, left: GAP + c * (cellW + GAP) })
    const tag =
      p.a.kind === 'logo' ? `logo ${p.a.wDp}dp` : p.a.kind === 'app' ? 'APP' : 'blank'
    const color = p.a.kind === 'logo' ? '#22c55e' : p.a.kind === 'app' ? '#38bdf8' : '#f97316'
    composites.push({
      input: Buffer.from(
        `<svg width="${cellW}" height="${LABEL_H}"><rect width="100%" height="100%" fill="#020617"/>` +
          `<text x="6" y="15" font-family="Arial" font-size="11" fill="${color}">${p.t}s  ${tag}</text></svg>`
      ),
      top: GAP + r * rowH + LABEL_H + cellH,
      left: GAP + c * (cellW + GAP),
    })
  }
}

await sharp({ create: { width: sheetW, height: sheetH, channels: 3, background: '#020617' } })
  .composite(composites)
  .png()
  .toFile(resolve(desktop, 'splash-options.png'))

console.log('wrote splash-options.png')
for (const r of rows) {
  console.log(r.label)
  console.log('   ' + r.picks.map((p) => `${p.t}s:${p.a.kind === 'logo' ? p.a.wDp + 'dp' : p.a.kind}`).join('  '))
}
