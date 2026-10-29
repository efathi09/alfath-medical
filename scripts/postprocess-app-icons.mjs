// Post-process step after `@capacitor/assets generate`.
//
// The generator leaves the legacy (pre-Android 8) `ic_launcher.png` /
// `ic_launcher_round.png` transparent. Flatten them onto the same background
// colour used for the adaptive icon so old devices show a proper solid icon.
// Round variants also get a circular alpha mask.
import sharp from 'sharp'
import { existsSync, readdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const resDir = resolve(root, 'android/app/src/main/res')
const BG = { r: 255, g: 255, b: 255, alpha: 1 }

function circleSvg(size) {
  const r = size / 2
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><circle cx="${r}" cy="${r}" r="${r}" fill="#fff"/></svg>`,
  )
}

const folders = readdirSync(resDir).filter((f) => f.startsWith('mipmap-'))
let fixed = 0

for (const folder of folders) {
  for (const [file, round] of [
    ['ic_launcher.png', false],
    ['ic_launcher_round.png', true],
  ]) {
    const target = resolve(resDir, folder, file)
    if (!existsSync(target)) continue

    const { width } = await sharp(target).metadata()
    let img = sharp(target).flatten({ background: BG })
    if (round) {
      const flat = await img.png().toBuffer()
      img = sharp(flat).composite([{ input: circleSvg(width), blend: 'dest-in' }])
    }
    writeFileSync(target, await img.png().toBuffer())
    fixed += 1
  }
}

console.log(`postprocess: flattened ${fixed} legacy android icon(s)`)
