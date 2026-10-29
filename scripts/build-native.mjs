// Native (Capacitor) build guard.
//
// The native app loads the bundled site from `capacitor://localhost`, where a
// relative `/api/...` path has no server behind it. Without a real VITE_API_BASE
// the app builds fine but every data request fails silently at runtime, so this
// guard refuses to build a broken bundle: it validates VITE_API_BASE first and
// stops with a clear message when it is missing or not a real https origin.
//
//   npm run cap:build          # validates VITE_API_BASE, then vite build + cap sync
//   npm run cap:build:android  # …then assembles the debug APK
//
// Set the value in `.env` / `.env.local` (git-ignored) or inline:
//   VITE_API_BASE=https://your-deployed-api.example npm run cap:build

import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const ROOT = path.resolve(import.meta.dirname, '..')

/* ---------------------------- read .env files ---------------------------- */
// Vite loads these itself at `vite build`; we mirror its precedence so the value
// we validate here is the same one Vite will bake into the bundle.
// (process.env > .env.local > .env; production-mode files also apply.)
const ENV_FILES = ['.env.production.local', '.env.local', '.env.production', '.env']

function loadDotenv() {
  const out = {}
  for (const name of ENV_FILES) {
    const file = path.join(ROOT, name)
    if (!existsSync(file)) continue
    const text = readFileSync(file, 'utf8')
    for (const raw of text.split(/\r?\n/)) {
      const line = raw.trim()
      if (!line || line.startsWith('#')) continue
      const eq = line.indexOf('=')
      if (eq === -1) continue
      const key = line.slice(0, eq).trim()
      let val = line.slice(eq + 1).trim()
      // Strip surrounding quotes the way Vite does.
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1)
      }
      if (!(key in out)) out[key] = val
    }
  }
  return out
}

/* ------------------------------ validation ------------------------------ */

function fail(message) {
  console.error(`\n  ✗ ${message}\n`)
  process.exit(1)
}

const dotenv = loadDotenv()
const raw = (process.env.VITE_API_BASE ?? dotenv.VITE_API_BASE ?? '').trim().replace(/\/+$/, '')

if (!raw) {
  fail(
    'VITE_API_BASE is not set, so the native app would bundle with a broken API URL.\n' +
      '    Set it in `.env` (e.g. VITE_API_BASE=https://your-api.example), then re-run:\n' +
      '      npm run cap:build\n' +
      '    (The web build does not need it — it uses same-origin /api.)',
  )
}

let url
try {
  url = new URL(raw)
} catch {
  fail(`VITE_API_BASE is not a valid URL: "${raw}"\n    Example: VITE_API_BASE=https://your-api.example`)
}

if (url.protocol !== 'https:') {
  fail(
    `VITE_API_BASE must use https:// (got ${url.protocol}//).\n` +
      '    iOS blocks plain http by default (ATS), so the app would fail to load data.',
  )
}

if (url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname === '::1') {
  console.warn(
    '  ! VITE_API_BASE points at localhost — fine for local testing only.\n' +
      '    Do not ship a build like this to a device that is not on your dev machine.\n',
  )
}

console.log(`  ✓ VITE_API_BASE = ${url.origin}`)

/* -------------------------------- run build ------------------------------ */

const args = process.argv.slice(2)

// Ordered build steps as single command strings (shell:true needs one string,
// not an args array — otherwise Node emits the DEP0190 warning).
const steps = ['npx vite build', 'npx cap sync']

// `--apk` additionally assembles the Android debug APK after syncing.
if (args.includes('--apk')) steps.push('npm run android:apk')

// `--no-sync` builds the web assets only (still with the origin validated):
// drop cap sync (and apk) so only `vite build` remains.
if (args.includes('--no-sync')) steps.splice(1)

for (const step of steps) {
  console.log(`\n  → ${step}`)
  const res = spawnSync(step, { cwd: ROOT, stdio: 'inherit', shell: true })
  if (res.status !== 0) {
    process.exit(res.status ?? 1)
  }
}

console.log('\n  ✓ Native build complete.\n')
