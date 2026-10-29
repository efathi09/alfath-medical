import { json, cors } from '../../_lib/db.js'
import { getStore } from '../../_lib/store.js'
import { requireAdmin } from '../../_lib/auth.js'
import { toCsv } from '../../_lib/csv.js'

export const onRequestOptions = () => cors()

/**
 * Newsletter subscribers for the dashboard. `?format=csv` returns a
 * spreadsheet-ready file, otherwise the JSON list.
 */
export const onRequestGet = async ({ request, env }) => {
  const denied = await requireAdmin(request, env)
  if (denied) return denied

  try {
    const store = await getStore(env)
    const rows = await store.listSubscribers()

    const wantsCsv = new URL(request.url).searchParams.get('format') === 'csv'
    if (wantsCsv) {
      const csv = toCsv(
        ['email', 'source', 'created_at'],
        rows.map((row) => ({
          email: row.email,
          source: row.source ?? '',
          created_at: row.created_at ?? '',
        })),
      )
      return new Response(`\uFEFF${csv}`, {
        headers: {
          'content-type': 'text/csv; charset=utf-8',
          'content-disposition': 'attachment; filename="subscribers.csv"',
          'access-control-allow-origin': '*',
          'cache-control': 'no-store',
        },
      })
    }

    return json(rows, {
      headers: { 'cache-control': 'no-store', 'x-data-source': store.source },
    })
  } catch (err) {
    return json({ error: 'DB_ERROR', detail: String(err) }, { status: 500 })
  }
}
