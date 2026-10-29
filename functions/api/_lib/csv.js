// Minimal RFC-4180-compatible CSV helpers (no dependencies).

export function csvEscape(value) {
  const s = value == null ? '' : String(value)
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function toCsv(headers, rows) {
  const lines = [headers.join(',')]
  for (const row of rows) {
    lines.push(headers.map((h) => csvEscape(row[h])).join(','))
  }
  return lines.join('\r\n')
}

export function parseCsv(text) {
  const src = String(text).replace(/^\uFEFF/, '')
  const rows = []
  let field = ''
  let row = []
  let inQuotes = false

  for (let i = 0; i < src.length; i += 1) {
    const c = src[i]
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"'
          i += 1
        } else {
          inQuotes = false
        }
      } else {
        field += c
      }
    } else if (c === '"') {
      inQuotes = true
    } else if (c === ',') {
      row.push(field)
      field = ''
    } else if (c === '\n') {
      row.push(field)
      field = ''
      rows.push(row)
      row = []
    } else if (c !== '\r') {
      field += c
    }
  }
  if (field !== '' || row.length) {
    row.push(field)
    rows.push(row)
  }

  const headers = (rows.shift() || []).map((h) => h.trim())
  return rows
    .filter((r) => r.some((x) => String(x).trim() !== ''))
    .map((r) => {
      const obj = {}
      headers.forEach((h, i) => {
        obj[h] = r[i] ?? ''
      })
      return obj
    })
}
