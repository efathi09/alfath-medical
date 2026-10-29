// File-backed store for local development (Node only).
// Mirrors the interface of createMemoryStore, adding JSON persistence so
// admin edits survive dev-server restarts. Writes to .data/db.json.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { createMemoryStore } from '../functions/api/_lib/store.js'

export function createFileStore(file = '.data/db.json') {
  const abs = resolve(file)

  let initial = null
  if (existsSync(abs)) {
    try {
      const parsed = JSON.parse(readFileSync(abs, 'utf8'))
      if (parsed && Array.isArray(parsed.products)) initial = parsed
    } catch {
      initial = null
    }
  }

  return createMemoryStore({
    initial,
    onPersist: (state) => {
      mkdirSync(dirname(abs), { recursive: true })
      writeFileSync(abs, JSON.stringify(state, null, 2), 'utf8')
    },
  })
}
