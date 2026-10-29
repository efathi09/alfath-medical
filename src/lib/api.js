// Central API base URL helper.
//
// On the web the API is same-origin, so paths stay relative ("/api/...").
// Inside the Capacitor (native) app the web assets are bundled locally
// (origin capacitor://localhost), so requests must be pointed at the deployed
// API. Set VITE_API_BASE at build time, e.g. VITE_API_BASE=https://alfath.pages.dev
//
//   npm run build            # web / same-origin (default, base = "")
//   VITE_API_BASE=https://…  npm run build   # native app pointing at prod API

const RAW = String(import.meta.env?.VITE_API_BASE ?? '').trim().replace(/\/+$/, '')

export const API_BASE = RAW

export function apiUrl(path) {
  if (!path) return path
  if (/^https?:\/\//i.test(path)) return path
  return API_BASE + (path.startsWith('/') ? path : `/${path}`)
}

export function apiOrigin(fallback = '') {
  return API_BASE || fallback
}
