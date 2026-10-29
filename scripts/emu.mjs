// Flexible emulator helper.
//
// Usage:
//   node scripts/emu.mjs start [--scale 0.8] [--skin Pixel_8] [--w 1080] [--h 2400] [--dpi 420]
//   node scripts/emu.mjs size  <W>x<H>        # runtime: wm size
//   node scripts/emu.mjs dpi   <density>      # runtime: wm density
//   node scripts/emu.mjs reset                # reset size + density to hardware defaults
//   node scripts/emu.mjs shot  [out.png]      # screenshot to file
//   node scripts/emu.mjs stop
//
// Notes:
//   - `start` launches the emulator detached with an optional window scale and/or skin.
//   - Runtime `size`/`dpi` let you test any phone resolution without creating a new AVD.
import { spawn, execFileSync } from 'node:child_process'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import os from 'node:os'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SDK = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT || resolve(os.homedir(), 'AppData/Local/Android/Sdk')
const EMULATOR = resolve(SDK, 'emulator/emulator.exe')
const ADB = resolve(SDK, 'platform-tools/adb.exe')
const AVD = process.env.AVD_NAME || 'Medium_Phone_API_37.0'

const args = process.argv.slice(2)
const cmd = args[0]

function flag(name, def) {
  const i = args.indexOf(name)
  return i === -1 ? def : args[i + 1]
}

function adb(...a) {
  return execFileSync(ADB, a, { encoding: 'utf8' })
}

async function start() {
  const scale = flag('--scale', null)
  const skin = flag('--skin', null)
  const emuArgs = ['-avd', AVD, '-no-snapshot-load', '-no-boot-anim', '-gpu', 'auto']
  if (scale) emuArgs.push('-scale', scale)
  if (skin) emuArgs.push('-skin', skin)

  console.log('launching:', EMULATOR, emuArgs.join(' '))
  const child = spawn(EMULATOR, emuArgs, { detached: true, stdio: 'ignore' })
  child.unref()
  console.log('emulator PID', child.pid)
  console.log('started. wait ~20-40s for boot, then check: node scripts/emu.mjs size')
}

function setSize(v) {
  if (!v || !/^\d+x\d+$/.test(v)) throw new Error('usage: size <W>x<H>  e.g. 1080x2400')
  adb('shell', 'wm', 'size', v)
  console.log('wm size ->', v)
}

function setDpi(v) {
  if (!v || !/^\d+$/.test(v)) throw new Error('usage: dpi <density>  e.g. 420')
  adb('shell', 'wm', 'density', v)
  console.log('wm density ->', v)
}

function reset() {
  adb('shell', 'wm', 'size', 'reset')
  adb('shell', 'wm', 'density', 'reset')
  console.log('reset size + density to hardware defaults')
}

function shot(out) {
  const file = out || resolve(root, `emulator-shot-${Date.now()}.png`)
  adb('shell', 'screencap', '-p', '/sdcard/_emu_shot.png')
  execFileSync(ADB, ['pull', '/sdcard/_emu_shot.png', file], { encoding: 'utf8' })
  console.log('screenshot ->', file)
}

function stop() {
  try {
    adb('emu', 'kill')
    console.log('emulator stopped')
  } catch {
    console.log('no running emulator')
  }
}

try {
  if (cmd === 'start') await start()
  else if (cmd === 'size') setSize(args[1])
  else if (cmd === 'dpi') setDpi(args[1])
  else if (cmd === 'reset') reset()
  else if (cmd === 'shot') shot(args[1])
  else if (cmd === 'stop') stop()
  else {
    console.log('commands: start | size WxH | dpi N | reset | shot [out.png] | stop')
    console.log('AVD:', AVD, ' SDK:', SDK)
  }
} catch (e) {
  console.error('error:', e.message)
  process.exit(1)
}
