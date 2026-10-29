// Generates ios/App/App/Assets.xcassets/LaunchLogo.imageset from public/splash-logo.png.
//
// The web splash overlay (src/app/NativeSplash.jsx) renders the logo at
// min(190px, 60vw, 50vh) with the aspect ratio preserved. On iOS, 1 CSS px maps to
// 1 pt, so the launch-screen logo is constrained to 190pt wide (see LaunchScreen.storyboard).
// These images are the raster source for that constraint at each scale.
//
// Run: node scripts/gen-ios-launch-logo.mjs

import { mkdir, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const ROOT = path.resolve(import.meta.dirname, '..')
const SRC = path.join(ROOT, 'public', 'splash-logo.png')
const OUT_DIR = path.join(ROOT, 'ios', 'App', 'App', 'Assets.xcassets', 'LaunchLogo.imageset')

// Max displayed width in pt (keep in sync with NativeSplash.jsx LOGO_SIZE and
// the LaunchScreen.storyboard width constraint).
const BASE_PT = 190

const SCALES = [
  { name: 'launch-logo-1x', scale: 1 },
  { name: 'launch-logo-2x', scale: 2 },
  { name: 'launch-logo-3x', scale: 3 },
]

async function main() {
  if (!existsSync(SRC)) {
    console.error('Missing source:', SRC)
    process.exit(1)
  }
  await mkdir(OUT_DIR, { recursive: true })

  for (const { name, scale } of SCALES) {
    const width = Math.round(BASE_PT * scale)
    const file = path.join(OUT_DIR, `${name}.png`)
    // Preserve aspect ratio; embed on a transparent background (the launch screen
    // paints white behind it, matching the web overlay).
    await sharp(SRC)
      .resize({ width, withoutEnlargement: true })
      .png({ compressionLevel: 9 })
      .toFile(file)
    console.log('wrote', path.relative(ROOT, file), `${width}px wide`)
  }

  const contents = {
    images: [
      { filename: 'launch-logo-1x.png', idiom: 'universal', scale: '1x' },
      { filename: 'launch-logo-2x.png', idiom: 'universal', scale: '2x' },
      { filename: 'launch-logo-3x.png', idiom: 'universal', scale: '3x' },
    ],
    info: { author: 'xcode', version: 1 },
  }
  const contentsPath = path.join(OUT_DIR, 'Contents.json')
  await writeFile(contentsPath, JSON.stringify(contents, null, 2) + '\n')
  console.log('wrote', path.relative(ROOT, contentsPath))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
