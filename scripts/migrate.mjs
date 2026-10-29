// Applies every migrations/*.sql file to DATABASE_URL (idempotent).
//   node scripts/migrate.mjs
//
// Uses the Neon HTTP driver's .unsafe() so a whole file runs as-is.
// If your provider rejects multi-statement batches, paste the file into
// the Neon SQL Editor instead — the SQL is written to be re-runnable.
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function loadDevVars() {
  const file = resolve(root, '.dev.vars')
  if (!existsSync(file)) return
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (!m) continue
    let val = m[2].trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    if (!process.env[m[1]]) process.env[m[1]] = val
  }
}
loadDevVars()

if (!process.env.DATABASE_URL) {
  console.error('\n  DATABASE_URL is not set. Add it to .dev.vars first.\n')
  process.exit(1)
}

const { neon } = await import('@neondatabase/serverless')
const sql = neon(process.env.DATABASE_URL)

// The Neon HTTP driver runs each call as one prepared statement, so a whole
// migration file has to be split into statements first. Comments, quoted
// strings and `$$ dollar-quoted $$` function bodies must not split on a `;`.
function splitStatements(text) {
  const out = []
  let cur = ''
  let dollarTag = null
  let i = 0
  while (i < text.length) {
    const ch = text[i]
    if (dollarTag) {
      if (text.startsWith(dollarTag, i)) {
        cur += dollarTag
        i += dollarTag.length
        dollarTag = null
      } else {
        cur += ch
        i += 1
      }
      continue
    }
    if (ch === '-' && text[i + 1] === '-') {
      const nl = text.indexOf('\n', i)
      const end = nl === -1 ? text.length : nl
      cur += text.slice(i, end)
      i = end
      continue
    }
    if (ch === '/' && text[i + 1] === '*') {
      const close = text.indexOf('*/', i + 2)
      const end = close === -1 ? text.length : close + 2
      cur += text.slice(i, end)
      i = end
      continue
    }
    if (ch === "'") {
      cur += ch
      i += 1
      while (i < text.length) {
        if (text[i] === "'") {
          if (text[i + 1] === "'") {
            cur += "''"
            i += 2
            continue
          }
          cur += "'"
          i += 1
          break
        }
        cur += text[i]
        i += 1
      }
      continue
    }
    if (ch === '$') {
      const m = /^\$[A-Za-z_0-9]*\$/.exec(text.slice(i, i + 64))
      if (m) {
        dollarTag = m[0]
        cur += dollarTag
        i += dollarTag.length
        continue
      }
    }
    if (ch === ';') {
      out.push(cur)
      cur = ''
      i += 1
      continue
    }
    cur += ch
    i += 1
  }
  if (cur.trim()) out.push(cur)
  return out.map((s) => s.trim()).filter(Boolean)
}

const dir = resolve(root, 'migrations')
const files = readdirSync(dir)
  .filter((f) => f.endsWith('.sql'))
  .sort()

if (files.length === 0) {
  console.log('  no migration files found')
  process.exit(0)
}

for (const file of files) {
  const text = readFileSync(join(dir, file), 'utf8')
  process.stdout.write(`  applying ${file} ... `)
  try {
    const statements = splitStatements(text)
    for (const statement of statements) await sql.query(statement)
    console.log(`ok (${statements.length} statements)`)
  } catch (err) {
    console.log('FAILED')
    console.error('   ', String(err))
    process.exit(1)
  }
}

const tables = await sql`
  SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public' ORDER BY table_name
`
console.log('\n  tables:', tables.map((t) => t.table_name).join(', '), '\n')