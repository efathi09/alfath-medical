// Prepare source images for `@capacitor/assets generate` (Easy Mode).
//
// Reads the site logo (public/logo.png) and writes:
//   assets/logo.png       – tightly cropped logo on a transparent background
//   assets/logo-dark.png  – white silhouette (uses the logo's alpha) for dark backgrounds
//
// Then run: npm run cap:assets
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const assetsDir = resolve(root, 'assets')
mkdirSync(assetsDir, { recursive: true })

const SRC = resolve(root, 'public/logo.png')

const meta = await sharp(SRC).metadata()
if (!meta.hasAlpha) {
  console.warn('warning: source logo has no alpha channel; dark-mode logo will fall back to the original.')
}

// Crop the transparent border so the mark fills the icon/splash frames.
const trimmed = await sharp(SRC).trim({ threshold: 10 }).png().toBuffer()
const { width, height } = await sharp(trimmed).metadata()

await sharp(trimmed).toFile(resolve(assetsDir, 'logo.png'))

// White silhouette built from the logo's alpha, for dark backgrounds.
const white = await sharp({
  create: { width, height, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } },
})
  .composite([{ input: trimmed, blend: 'dest-in' }])
  .png()
  .toBuffer()
await sharp(white).toFile(resolve(assetsDir, 'logo-dark.png'))

const stats = await sharp(trimmed).stats()
console.log(`logo: ${width}x${height}, alpha-channel present=${meta.hasAlpha}`)
console.log('wrote assets/logo.png and assets/logo-dark.png')
console.log(`channels: ${stats.channels.length}`)
