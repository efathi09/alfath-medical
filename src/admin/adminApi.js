import { apiUrl } from '../lib/api.js'

const TOKEN_KEY = 'me.adminToken'

export function getToken() {
  try {
    return window.localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token) {
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token)
    else window.localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* ignore */
  }
}

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.status = status
    this.data = data
  }
}

async function request(method, path, body) {
  const headers = {}
  const token = getToken()
  if (token) headers.authorization = `Bearer ${token}`
  if (body !== undefined) headers['content-type'] = 'application/json'

  let res
  try {
    res = await fetch(apiUrl(path), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError('NETWORK', 0, null)
  }

  const text = await res.text()
  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = null
  }

  if (!res.ok) {
    throw new ApiError(data?.error || `HTTP_${res.status}`, res.status, data)
  }
  return data
}

const enc = encodeURIComponent

export const adminApi = {
  login: (username, password) => request('POST', '/api/auth/login', { username, password }),
  session: () => request('GET', '/api/auth/session'),

  stats: () => request('GET', '/api/admin/stats'),
  reports: () => request('GET', '/api/admin/reports'),

  listProducts: () => request('GET', '/api/products?all=1'),
  createProduct: (data) => request('POST', '/api/products', data),
  updateProduct: (id, data) => request('PUT', `/api/products/${enc(id)}`, data),
  deleteProduct: (id) => request('DELETE', `/api/products/${enc(id)}`),

  listCategories: () => request('GET', '/api/categories?all=1'),
  createCategory: (data) => request('POST', '/api/categories', data),
  updateCategory: (id, data) => request('PUT', `/api/categories/${enc(id)}`, data),
  deleteCategory: (id) => request('DELETE', `/api/categories/${enc(id)}`),

  listQuotes: () => request('GET', '/api/quotes'),
  updateQuoteStatus: (id, status) => request('PATCH', `/api/quotes/${enc(id)}`, { status }),

  listOrders: ({ status, q } = {}) => {
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    if (q) params.set('q', q)
    const qs = params.toString()
    return request('GET', `/api/admin/orders${qs ? `?${qs}` : ''}`)
  },
  getOrder: (id) => request('GET', `/api/admin/orders/${enc(id)}`),
  updateOrderStatus: (id, status) => request('PATCH', `/api/admin/orders/${enc(id)}`, { status }),

  getSettings: () => request('GET', '/api/settings'),
  updateSettings: (data) => request('PUT', '/api/settings', data),

  listBrands: () => request('GET', '/api/brands?all=1'),
  createBrand: (data) => request('POST', '/api/brands', data),
  updateBrand: (id, data) => request('PUT', `/api/brands/${enc(id)}`, data),
  deleteBrand: (id) => request('DELETE', `/api/brands/${enc(id)}`),

  listPromos: () => request('GET', '/api/promos?all=1'),
  createPromo: (data) => request('POST', '/api/promos', data),
  updatePromo: (id, data) => request('PUT', `/api/promos/${enc(id)}`, data),
  deletePromo: (id) => request('DELETE', `/api/promos/${enc(id)}`),

  listUsers: () => request('GET', '/api/admin/users'),
  createUser: (data) => request('POST', '/api/admin/users', data),
  updateUser: (id, data) => request('PUT', `/api/admin/users/${enc(id)}`, data),
  deleteUser: (id) => request('DELETE', `/api/admin/users/${enc(id)}`),

  exportUrl: '/api/admin/export',
  importProducts: (csv, mode = 'upsert') => request('POST', '/api/admin/import', { csv, mode }),

  getWhatsApp: () => request('GET', '/api/admin/whatsapp'),
  updateWhatsApp: (data) => request('PUT', '/api/admin/whatsapp', data),
  testWhatsApp: (to, text) => request('POST', '/api/admin/whatsapp/test', { to, text }),
  listWhatsAppMessages: () => request('GET', '/api/admin/whatsapp/messages'),

  listSubscribers: () => request('GET', '/api/admin/subscribers'),
  subscribersCsvUrl: '/api/admin/subscribers?format=csv',
}

/** Download a CSV endpoint using the stored bearer token. */
async function downloadCsv(path, filename) {
  const headers = {}
  const token = getToken()
  if (token) headers.authorization = `Bearer ${token}`
  const res = await fetch(apiUrl(path), { headers })
  if (!res.ok) throw new ApiError(`HTTP_${res.status}`, res.status, null)
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

/** Download the products CSV using the stored bearer token. */
export function downloadExport() {
  return downloadCsv(adminApi.exportUrl, 'products.csv')
}

/** Download the newsletter subscribers CSV. */
export function downloadSubscribers() {
  return downloadCsv(adminApi.subscribersCsvUrl, 'subscribers.csv')
}
