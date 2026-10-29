import { useEffect, useMemo, useRef, useState } from 'react'
import { App } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { DataProvider } from '../context/DataContext.jsx'
import { StoreProvider, useStore } from '../context/StoreContext.jsx'
import { AppNavContext } from './nav.jsx'
import AppBar from './AppBar.jsx'
import TabBar from './TabBar.jsx'
import HomeScreen from './screens/HomeScreen.jsx'
import CategoriesScreen from './screens/CategoriesScreen.jsx'
import OffersScreen from './screens/OffersScreen.jsx'
import CartScreen from './screens/CartScreen.jsx'
import AccountScreen from './screens/AccountScreen.jsx'
import ListScreen from './screens/ListScreen.jsx'
import ProductScreen from './screens/ProductScreen.jsx'
import AuthScreen from './screens/AuthScreen.jsx'
import CheckoutScreen from './screens/CheckoutScreen.jsx'
import OrdersScreen from './screens/OrdersScreen.jsx'
import OrderScreen from './screens/OrderScreen.jsx'
import FavoritesScreen from './screens/FavoritesScreen.jsx'
import ProfileScreen from './screens/ProfileScreen.jsx'
import SearchOverlay from './SearchOverlay.jsx'
import QuotationModal from '../components/QuotationModal.jsx'
import ToastStack from '../components/ToastStack.jsx'

const TAB_SCREENS = {
  home: HomeScreen,
  categories: CategoriesScreen,
  offers: OffersScreen,
  cart: CartScreen,
  account: AccountScreen,
}

function Frame() {
  const {
    isAuthenticated,
    cartOpen,
    setCartOpen,
    quoteTarget,
    closeQuote,
    mobileNavOpen,
    setMobileNavOpen,
  } = useStore()
  const [tab, setTab] = useState('home')
  const [stack, setStack] = useState([])
  const [searchOpen, setSearchOpen] = useState(false)

  const current = useMemo(
    () => (stack.length ? stack[stack.length - 1] : { name: tab }),
    [stack, tab],
  )
  const pushed = stack.length > 0

  const nav = useMemo(
    () => ({
      tab,
      current,
      go(next) {
        setStack([])
        setTab(next)
        window.scrollTo({ top: 0 })
      },
      push(route) {
        setStack((prev) => [...prev, route])
        window.scrollTo({ top: 0 })
      },
      back() {
        setStack((prev) => prev.slice(0, -1))
      },
      openSearch() {
        setSearchOpen(true)
      },
    }),
    [tab, current],
  )

  // Native hardware/gesture back: step back one layer at a time instead of
  // exiting the app outright. Order matters — dismiss the topmost overlay first,
  // then pop a pushed screen, then fall back to Home, and only exit at the root.
  const handleBack = () => {
    if (searchOpen) {
      setSearchOpen(false)
      return
    }
    if (quoteTarget) {
      closeQuote()
      return
    }
    if (cartOpen) {
      setCartOpen(false)
      return
    }
    if (mobileNavOpen) {
      setMobileNavOpen(false)
      return
    }
    if (stack.length > 0) {
      setStack((prev) => prev.slice(0, -1))
      return
    }
    if (tab !== 'home') {
      setStack([])
      setTab('home')
      window.scrollTo({ top: 0 })
      return
    }
    // At the root: this is the only point where leaving the app is correct.
    App.exitApp()
  }

  // Keep the listener registered once (native only) while always calling the
  // latest handler — avoids unregister/re-register races between renders.
  const backRef = useRef(handleBack)
  useEffect(() => {
    backRef.current = handleBack
  })

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return undefined
    let handle
    App.addListener('backButton', () => backRef.current()).then((h) => {
      handle = h
    })
    return () => {
      handle?.remove()
    }
  }, [])

  const Screen = TAB_SCREENS[current.name]

  return (
    <AppNavContext.Provider value={nav}>
      <div className="min-h-dvh bg-ink-100">
        <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-ink-50 shadow-lift">
          <AppBar
            showBack={pushed}
            onBack={nav.back}
            onSearch={nav.openSearch}
            onCart={() => nav.go('cart')}
          />

          <main className="flex-1">
            {current.name === 'list' || current.name === 'category' ? (
              <ListScreen key={JSON.stringify(current.params)} />
            ) : current.name === 'product' ? (
              <ProductScreen key={current.params?.id} />
            ) : current.name === 'auth' ? (
              <AuthScreen key={current.params?.mode} />
            ) : current.name === 'checkout' ? (
              isAuthenticated ? (
                <CheckoutScreen />
              ) : (
                <AuthScreen key="login" />
              )
            ) : current.name === 'orders' ? (
              isAuthenticated ? (
                <OrdersScreen />
              ) : (
                <AuthScreen key="login" />
              )
            ) : current.name === 'order' || current.name === 'favorites' || current.name === 'profile' ? (
              isAuthenticated ? (
                current.name === 'order' ? (
                  <OrderScreen key={current.params?.id} />
                ) : current.name === 'favorites' ? (
                  <FavoritesScreen />
                ) : (
                  <ProfileScreen />
                )
              ) : (
                <AuthScreen key="login" />
              )
            ) : Screen ? (
              <Screen />
            ) : null}
          </main>

          {!pushed && <TabBar active={tab} onChange={nav.go} />}
        </div>
      </div>

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
      <QuotationModal />
      <ToastStack />
    </AppNavContext.Provider>
  )
}

export default function AppShell() {
  return (
    <DataProvider>
      <StoreProvider>
        <Frame />
      </StoreProvider>
    </DataProvider>
  )
}
