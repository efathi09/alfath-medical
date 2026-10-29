import { apiUrl } from './api.js'

const TOKEN_KEY = 'me.customerToken'
const CUSTOMER_KEY = 'me.customer'

export function readToken() {
  try {
    return window.localStorage.getItem(TOKEN_KEY) || ''
  } catch {
    return ''
  }
}

export function readStoredCustomer() {
  try {
    const raw = window.localStorage.getItem(CUSTOMER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function writeSession(token, customer) {
  try {
    window.localStorage.setItem(TOKEN_KEY, token)
    window.localStorage.setItem(CUSTOMER_KEY, JSON.stringify(customer))
  } catch {
    /* storage unavailable — the session just will not survive a reload */
  }
}

export function patchStoredCustomer(customer) {
  try {
    window.localStorage.setItem(CUSTOMER_KEY, JSON.stringify(customer))
  } catch {
    /* ignore */
  }
}

export function clearSession() {
  try {
    window.localStorage.removeItem(TOKEN_KEY)
    window.localStorage.removeItem(CUSTOMER_KEY)
  } catch {
    /* ignore */
  }
}

async function request(method, path, body) {
  const token = readToken()
  const headers = { accept: 'application/json' }
  if (token) headers.authorization = `Bearer ${token}`
  if (body !== undefined) headers['content-type'] = 'application/json'

  let response
  try {
    response = await fetch(apiUrl(path), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new Error('OFFLINE')
  }

  let data = null
  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {
    const error = new Error(data?.error || `HTTP_${response.status}`)
    error.status = response.status
    error.code = data?.error || `HTTP_${response.status}`
    throw error
  }
  return data
}

export const customerApi = {
  register: (payload) => request('POST', '/api/auth/register', payload),
  login: (payload) => request('POST', '/api/auth/customer/login', payload),
  session: () => request('GET', '/api/auth/customer'),
  updateProfile: (patch) => request('PATCH', '/api/auth/customer', patch),
  listOrders: () => request('GET', '/api/orders'),
  getOrder: (id) => request('GET', `/api/orders/${id}`),
  createOrder: (payload) => request('POST', '/api/orders', payload),
}
