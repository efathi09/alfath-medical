// Generate Android splash screens from the brand logo.
//
// Consistent look across devices: a white background with the logo centered, sized
// as a fixed fraction of the SHORT screen edge so it scales proportionally on every
// screen size and orientation.
//
// Source of truth: public/logo.png (high res, transparent).
//
// Writes both portrait and landscape variants for every density, plus the day/night
// (light/dark) folders Android expects. Background is always white.
import sharp from 'sharp'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const resDir = resolve(root, 'android/app/src/main/res')
const SRC = resolve(root, 'public/logo.png')

const WHITE = { r: 255, g: 255, b: 255, alpha: 255 }

// Logo occupies this fraction of the SHORT screen edge.
const LOGO_FRACTION = 0.4

const RESIZE = { kernel: 'lanczos3' }
const SHARPEN = { sigma: 0.6, m1: 0.6, m2: 2.2 }

// Portrait (WxH) for each density.
const portrait = {
  ldpi: [240, 320],
  mdpi: [320, 480],
  hdpi: [480, 800],
  xhdpi: [720, 1280],
  xxhdpi: [960, 1600],
  xxxhdpi: [1280, 1920],
}

const trimmed = await sharp(SRC).ensureAlpha().trim({ threshold: 10 }).png().toBuffer()
const tMeta = await sharp(trimmed).metadata()
const aspect = tMeta.width / tMeta.height

// Trimmed transparent logo for the in-app (web layer) splash overlay, so its on-screen
// size can be controlled directly from CSS. It is rendered at most 190dp wide, so a
// 720px palette PNG is plenty and keeps the download small (it sits on the critical
// path of the app start-up).
const WEB_LOGO_WIDTH = 720
const webLogo = resolve(root, 'public/splash-logo.png')
const webLogoBuffer = await sharp(trimmed)
  .resize(WEB_LOGO_WIDTH, Math.round((tMeta.height * WEB_LOGO_WIDTH) / tMeta.width), {
    fit: 'fill',
    ...RESIZE,
  })
  .png({ compressionLevel: 9, palette: true, quality: 92, effort: 10 })
  .toBuffer()
writeFileSync(webLogo, webLogoBuffer)

// The native splash overlay (NativeSplashPlugin.java) must show the exact same pixels as
// the web overlay, so it uses a byte-identical copy of the web logo.
const nativeLogo = resolve(resDir, 'drawable-nodpi/splash_logo.png')
mkdirSync(dirname(nativeLogo), { recursive: true })
writeFileSync(nativeLogo, webLogoBuffer)

// Square system-splash icon (used as windowSplashScreenAnimatedIcon on Android 12+).
// The system constrains the icon to a small square slot, so the logo is composited on a
// white square and centered, keeping the brand mark readable on any screen.
const ICON_FRACTION = 0.78
const iconSizes = {
  mdpi: 48,
  hdpi: 72,
  xhdpi: 96,
  xxhdpi: 144,
  xxxhdpi: 192,
}

async function makeSplashIcon(size, outPath) {
  const targetW = Math.round(size * ICON_FRACTION)
  let logoW = targetW
  let logoH = Math.round(logoW / aspect)
  if (logoH > size * 0.9) {
    logoH = Math.round(size * 0.9)
    logoW = Math.round(logoH * aspect)
  }
  const logo = await sharp(trimmed)
    .resize(logoW, logoH, { fit: 'fill', ...RESIZE })
    .sharpen(SHARPEN)
    .png()
    .toBuffer()
  const buf = await sharp({ create: { width: size, height: size, channels: 4, background: WHITE } })
    .composite([{ input: logo, left: Math.round((size - logoW) / 2), top: Math.round((size - logoH) / 2) }])
    .png()
    .toBuffer()
  mkdirSync(dirname(outPath), { recursive: true })
  writeFileSync(outPath, buf)
}

async function makeSplash(w, h, outPath) {
  const shortEdge = Math.min(w, h)
  const targetW = Math.round(shortEdge * LOGO_FRACTION)
  let logoW = targetW
  let logoH = Math.round(logoW / aspect)
  // Never let the long edge overflow.
  if (logoW > w * 0.9) {
    logoW = Math.round(w * 0.9)
    logoH = Math.round(logoW / aspect)
  }
  if (logoH > h * 0.9) {
    logoH = Math.round(h * 0.9)
    logoW = Math.round(logoH * aspect)
  }
  const logo = await sharp(trimmed)
    .resize(logoW, logoH, { fit: 'fill', ...RESIZE })
    .sharpen(SHARPEN)
    .png()
    .toBuffer()
  const buf = await sharp({ create: { width: w, height: h, channels: 4, background: WHITE } })
    .composite([{ input: logo, left: Math.round((w - logoW) / 2), top: Math.round((h - logoH) / 2) }])
    .png()
    .toBuffer()
  mkdirSync(dirname(outPath), { recursive: true })
  writeFileSync(outPath, buf)
}

let count = 0
for (const [density, [pw, ph]] of Object.entries(portrait)) {
  // Portrait (day + night share the same white look).
  mkdirSync(resolve(resDir, `drawable-port-${density}`), { recursive: true })
  await makeSplash(pw, ph, resolve(resDir, `drawable-port-${density}/splash.png`))
  mkdirSync(resolve(resDir, `drawable-port-night-${density}`), { recursive: true })
  await makeSplash(pw, ph, resolve(resDir, `drawable-port-night-${density}/splash.png`))

  // Landscape (swap dimensions: wider than tall).
  const lw = ph
  const lh = pw
  mkdirSync(resolve(resDir, `drawable-land-${density}`), { recursive: true })
  await makeSplash(lw, lh, resolve(resDir, `drawable-land-${density}/splash.png`))
  mkdirSync(resolve(resDir, `drawable-land-night-${density}`), { recursive: true })
  await makeSplash(lw, lh, resolve(resDir, `drawable-land-night-${density}/splash.png`))

  // Base drawable fallback (mdpi portrait).
  if (density === 'mdpi') {
    await makeSplash(pw, ph, resolve(resDir, 'drawable/splash.png'))
    await makeSplash(pw, ph, resolve(resDir, 'drawable-night/splash.png'))
  }

  count += 4
}

console.log(`android splash: wrote ${count} variants (portrait/landscape, day/night) from public/logo.png`)
console.log(`  white background, logo ${(LOGO_FRACTION * 100).toFixed(0)}% of short edge, centered`)

// System splash icon (square, white background, logo centered).
let iconCount = 0
for (const [density, size] of Object.entries(iconSizes)) {
  mkdirSync(resolve(resDir, `drawable-${density}`), { recursive: true })
  await makeSplashIcon(size, resolve(resDir, `drawable-${density}/splash_icon.png`))
  iconCount += 1
}
await makeSplashIcon(iconSizes.mdpi, resolve(resDir, 'drawable/splash_icon.png'))
iconCount += 1

console.log(`android splash: wrote ${iconCount} square splash_icon variants (logo ${(ICON_FRACTION * 100).toFixed(0)}% on white)`)
