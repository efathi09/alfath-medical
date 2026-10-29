import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import {
  customerApi,
  clearSession,
  patchStoredCustomer,
  readStoredCustomer,
  readToken,
  writeSession,
} from '../lib/customerApi.js'

const StoreContext = createContext(null)
const CART_KEY = 'me.cart'
const QUOTES_KEY = 'me.quoteList'
const FAVORITES_KEY = 'me.favorites'
export const FREE_SHIPPING_THRESHOLD = 500
export const SHIPPING_FEE = 35

function readStorage(key, fallback) {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'add': {
      const { product, qty = 1 } = action
      const existing = state.find((line) => line.id === product.id)
      if (existing) {
        return state.map((line) =>
          line.id === product.id ? { ...line, qty: Math.min(line.qty + qty, 99) } : line,
        )
      }
      return [
        ...state,
        {
          id: product.id,
          qty,
          price: product.price,
          oldPrice: product.oldPrice,
          name: product.name,
          nameEn: product.nameEn,
          brand: product.brand,
          art: product.art,
          palette: product.palette,
          unit: product.unit,
        },
      ]
    }
    case 'qty': {
      const qty = action.qty
      if (qty <= 0) return state.filter((line) => line.id !== action.id)
      return state.map((line) => (line.id === action.id ? { ...line, qty: Math.min(qty, 99) } : line))
    }
    case 'remove':
      return state.filter((line) => line.id !== action.id)
    case 'clear':
      return []
    default:
      return state
  }
}

export function StoreProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, null, () => readStorage(CART_KEY, []))
  const [quoteList, setQuoteList] = useState(() => readStorage(QUOTES_KEY, []))
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [quoteTarget, setQuoteTarget] = useState(null)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [toasts, setToasts] = useState([])
  const toastId = useRef(0)
  const [favorites, setFavorites] = useState(() => readStorage(FAVORITES_KEY, []))
  const [customer, setCustomer] = useState(() => readStoredCustomer())
  const [customerToken, setCustomerToken] = useState(() => readToken())
  const [orders, setOrders] = useState([])

  useEffect(() => {
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
  }, [favorites])

  useEffect(() => {
    window.localStorage.setItem(CART_KEY, JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    window.localStorage.setItem(QUOTES_KEY, JSON.stringify(quoteList))
  }, [quoteList])

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const notify = useCallback(
    (message, tone = 'success') => {
      const id = ++toastId.current
      setToasts((prev) => [...prev.slice(-2), { id, message, tone }])
      window.setTimeout(() => dismissToast(id), 3200)
    },
    [dismissToast],
  )

  const addToCart = useCallback((product, qty = 1) => {
    dispatch({ type: 'add', product, qty })
  }, [])

  const setQty = useCallback((id, qty) => dispatch({ type: 'qty', id, qty }), [])
  const removeFromCart = useCallback((id) => dispatch({ type: 'remove', id }), [])
  const clearCart = useCallback(() => dispatch({ type: 'clear' }), [])

  const toggleFavorite = useCallback((id) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }, [])
  const isFavorite = useCallback((id) => favorites.includes(id), [favorites])

  const startSession = useCallback((token, profile) => {
    writeSession(token, profile)
    setCustomerToken(token)
    setCustomer(profile)
  }, [])

  const registerCustomer = useCallback(
    async (payload) => {
      const data = await customerApi.register(payload)
      startSession(data.token, data.customer)
      return data.customer
    },
    [startSession],
  )

  const loginCustomer = useCallback(
    async (payload) => {
      const data = await customerApi.login(payload)
      startSession(data.token, data.customer)
      return data.customer
    },
    [startSession],
  )

  const signOut = useCallback(() => {
    clearSession()
    setCustomerToken('')
    setCustomer(null)
    setOrders([])
  }, [])

  const updateProfile = useCallback(async (patch) => {
    const updated = await customerApi.updateProfile(patch)
    patchStoredCustomer(updated)
    setCustomer(updated)
    return updated
  }, [])

  const loadOrders = useCallback(async () => {
    const list = await customerApi.listOrders()
    setOrders(list)
    return list
  }, [])

  const placeOrder = useCallback(async (payload) => {
    const order = await customerApi.createOrder(payload)
    setOrders((prev) => [order, ...prev])
    return order
  }, [])

  // Keep the stored profile in sync with the server token on boot.
  useEffect(() => {
    if (!customerToken) return undefined
    let alive = true
    customerApi
      .session()
      .then((profile) => {
        if (!alive) return
        patchStoredCustomer(profile)
        setCustomer(profile)
      })
      .catch((err) => {
        if (!alive || err?.status !== 401) return
        clearSession()
        setCustomerToken('')
        setCustomer(null)
      })
    return () => {
      alive = false
    }
  }, [customerToken])

  const addToQuote = useCallback((product, qty) => {
    setQuoteList((prev) => {
      const found = prev.find((line) => line.id === product.id)
      if (found) {
        return prev.map((line) => (line.id === product.id ? { ...line, qty } : line))
      }
      return [
        ...prev,
        {
          id: product.id,
          qty,
          name: product.name,
          nameEn: product.nameEn,
          brand: product.brand,
          art: product.art,
          palette: product.palette,
        },
      ]
    })
    setQuoteTarget({ multi: true })
  }, [])

  const removeFromQuote = useCallback((id) => {
    setQuoteList((prev) => prev.filter((line) => line.id !== id))
  }, [])

  const cartCount = useMemo(() => cart.reduce((sum, line) => sum + line.qty, 0), [cart])

  const totals = useMemo(() => {
    const subtotal = cart.reduce((sum, line) => sum + line.price * line.qty, 0)
    const listTotal = cart.reduce((sum, line) => sum + (line.oldPrice ?? line.price) * line.qty, 0)
    const savings = Math.max(0, listTotal - subtotal)
    const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
    return {
      subtotal,
      savings,
      shipping,
      total: subtotal + shipping,
      remainingForFreeShipping: Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal),
    }
  }, [cart])

  const value = useMemo(
    () => ({
      cart,
      cartCount,
      totals,
      addToCart,
      setQty,
      removeFromCart,
      clearCart,
      cartOpen,
      setCartOpen,
      checkoutOpen,
      openCheckout: () => setCheckoutOpen(true),
      closeCheckout: () => setCheckoutOpen(false),
      quoteList,
      quoteTarget,
      openQuote: (product, qty) => setQuoteTarget(product ? { product, qty } : { multi: true }),
      closeQuote: () => setQuoteTarget(null),
      addToQuote,
      removeFromQuote,
      mobileNavOpen,
      setMobileNavOpen,
      searchOpen,
      setSearchOpen,
      toasts,
      notify,
      dismissToast,
      favorites,
      isFavorite,
      toggleFavorite,
      customer,
      customerToken,
      isAuthenticated: Boolean(customerToken && customer),
      registerCustomer,
      loginCustomer,
      signOut,
      updateProfile,
      orders,
      loadOrders,
      placeOrder,
    }),
    [
      cart,
      cartCount,
      totals,
      addToCart,
      setQty,
      removeFromCart,
      clearCart,
      cartOpen,
      checkoutOpen,
      quoteList,
      quoteTarget,
      addToQuote,
      removeFromQuote,
      mobileNavOpen,
      searchOpen,
      toasts,
      notify,
      dismissToast,
      favorites,
      isFavorite,
      toggleFavorite,
      customer,
      customerToken,
      registerCustomer,
      loginCustomer,
      signOut,
      updateProfile,
      orders,
      loadOrders,
      placeOrder,
    ],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>')
  return ctx
}
