// Run the Vite dev server and the local API server together.
//
//   npm.cmd run dev:all
//
// Both processes write to the same terminal; press Ctrl+C to stop both.
import { spawn } from 'node:child_process'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const shell = process.platform === 'win32'

const children = new Set()
let shuttingDown = false

function run(script, label) {
  const child = spawn(npm, ['run', script], { cwd: root, stdio: 'inherit', shell })
  children.add(child)
  child.on('exit', (code) => {
    children.delete(child)
    if (!shuttingDown) {
      console.log(`\n[dev:all] "${label}" exited with code ${code ?? 0} — stopping the rest.`)
      shutdown(code ?? 0)
    }
  })
  child.on('error', (err) => {
    console.error(`[dev:all] failed to start "${label}":`, err.message)
    shutdown(1)
  })
}

function shutdown(code = 0) {
  if (shuttingDown) return
  shuttingDown = true
  for (const child of children) {
    try {
      child.kill()
    } catch {
      /* ignore */
    }
  }
  process.exit(code)
}

process.on('SIGINT', () => shutdown(0))
process.on('SIGTERM', () => shutdown(0))

console.log('[dev:all] starting API (:8787) and Vite (:5173)...\n')
run('dev:api', 'api')
run('dev', 'web')
