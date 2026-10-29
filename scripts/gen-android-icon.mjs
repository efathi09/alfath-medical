// Generate Android launcher icons from the high-resolution brand logo.
//
// Source of truth: public/logo.png (1254x1254, high res). The logo is trimmed to
// its content and centered on a square canvas with a small margin so the FULL
// logo is visible and as large as possible.
//
// Background is TRANSPARENT: the logo is shown exactly as-is, with no added
// background colour and no cropping.
//
// Produces:
//   mipmap-*/ic_launcher.png        legacy square (transparent bg)
//   mipmap-*/ic_launcher_round.png  legacy round  (transparent bg, circular mask)
//   mipmap-*/ic_launcher_foreground.png  adaptive foreground (logo, transparent)
//   mipmap-*/ic_launcher_background.png  adaptive background (transparent)
//
// Also writes assets/logo.png (used by capacitor-assets for splash, etc.)
import sharp from 'sharp'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const resDir = resolve(root, 'android/app/src/main/res')
const SRC = resolve(root, 'public/logo.png')

const CLEAR = { r: 0, g: 0, b: 0, alpha: 0 }

const ICON_BG = CLEAR

// Fraction of the square canvas the logo is allowed to occupy (leaves a margin).
const LOGO_FILL = 0.9

// High-quality downscale: lanczos3 resampling + a mild sharpen to keep edges crisp.
const RESIZE = { kernel: 'lanczos3' }
const SHARPEN = { sigma: 0.6, m1: 0.6, m2: 2.2 }

// Legacy launcher icons are 48dp; adaptive icon layers are 108dp (2.25x larger).
// Generating the adaptive layers at the correct (larger) size is what keeps them crisp.
const densities = {
  'mipmap-ldpi': 36,
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
}
const ADAPTIVE_SCALE = 108 / 48 // 2.25

// Trim the source logo to its content, once, at high resolution.
const trimmedLogo = await sharp(SRC).ensureAlpha().trim({ threshold: 10 }).png().toBuffer()
const trimmedMeta = await sharp(trimmedLogo).metadata()
const logoAspect = trimmedMeta.width / trimmedMeta.height

// Supersampled master render size (larger than any output) for clean downscaling.
const MASTER = 1024

// Render a master square icon at high resolution (supersampled), with the logo trimmed
// and centered. Downscaling from this master with lanczos3 gives crisp small icons.
async function masterIcon(bg, containRatio, doSharpen) {
  const maxSide = Math.round(MASTER * containRatio)
  let w = maxSide
  let h = Math.round(w / logoAspect)
  if (h > maxSide) {
    h = maxSide
    w = Math.round(h * logoAspect)
  }
  let logo = sharp(trimmedLogo).resize(w, h, { fit: 'fill', ...RESIZE }).ensureAlpha()
  if (doSharpen) logo = logo.sharpen(SHARPEN)
  const logoBuf = await logo.png().toBuffer()
  return sharp({ create: { width: MASTER, height: MASTER, channels: 4, background: bg } })
    .composite([{ input: logoBuf, left: Math.round((MASTER - w) / 2), top: Math.round((MASTER - h) / 2) }])
    .png()
    .toBuffer()
}

// Legacy artwork (square + round share the same full-logo layout).
const LEGACY_MASTER = await masterIcon(ICON_BG, LOGO_FILL, true)

mkdirSync(resolve(root, 'assets'), { recursive: true })

// Transparent logo for capacitor-assets.
await sharp(trimmedLogo).toFile(resolve(root, 'assets/logo.png'))

// Adaptive icons are masked by the launcher to a shape whose safe content area is the
// inner ~66% of the 108dp canvas. Keep the logo inside that zone so nothing is cropped.
const FOREGROUND_FILL = 0.62
const FOREGROUND_MASTER = await masterIcon(ICON_BG, FOREGROUND_FILL, true)

async function writeResized(master, outPath, size) {
  const buf = await sharp(master).resize(size, size, { fit: 'fill', ...RESIZE }).png().toBuffer()
  writeFileSync(outPath, buf)
}

for (const [folder, size] of Object.entries(densities)) {
  const dir = resolve(resDir, folder)
  mkdirSync(dir, { recursive: true })
  const adaptiveSize = Math.round(size * ADAPTIVE_SCALE)

  // --- legacy square: transparent bg + centered full logo (48dp) ---
  await writeResized(LEGACY_MASTER, resolve(dir, 'ic_launcher.png'), size)

  // --- legacy round: same artwork, full logo (no circular crop) ---
  await writeResized(LEGACY_MASTER, resolve(dir, 'ic_launcher_round.png'), size)

  // --- adaptive background: transparent (108dp canvas) ---
  writeFileSync(
    resolve(dir, 'ic_launcher_background.png'),
    await sharp({ create: { width: adaptiveSize, height: adaptiveSize, channels: 4, background: ICON_BG } }).png().toBuffer(),
  )

  // --- adaptive foreground: logo only, transparent, centered, inside the safe zone (108dp) ---
  await writeResized(FOREGROUND_MASTER, resolve(dir, 'ic_launcher_foreground.png'), adaptiveSize)
}

console.log(`android icons: wrote ${Object.keys(densities).length} densities from public/logo.png`)
console.log(`  logo aspect ${logoAspect.toFixed(2)}, legacy fill ${(LOGO_FILL * 100).toFixed(0)}%, adaptive fill ${(FOREGROUND_FILL * 100).toFixed(0)}%`)
console.log(`  supersampled master ${MASTER}px, lanczos3 + sharpen, adaptive layers ${ADAPTIVE_SCALE}x`)
