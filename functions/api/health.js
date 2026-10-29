import { json } from './_lib/db.js'
import { getStore } from './_lib/store.js'

export const onRequestGet = async ({ env }) => {
  const store = await getStore(env)
  return json({
    ok: true,
    source: store.source,
    db: Boolean(env && env.DATABASE_URL),
  })
}
