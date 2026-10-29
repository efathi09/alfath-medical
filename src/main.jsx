import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Capacitor } from '@capacitor/core'
import { LanguageProvider } from './context/LanguageContext.jsx'
import App from './App.jsx'
import AppShell from './app/AppShell.jsx'
import NativeSplash from './app/NativeSplash.jsx'
import AdminApp from './admin/AdminApp.jsx'
import './index.css'

const cap = typeof window !== 'undefined' ? window.Capacitor : undefined
const isNative = typeof cap?.isNativePlatform === 'function' ? cap.isNativePlatform() : Capacitor.isNativePlatform()

// Lets the inline watchdog in index.html know the bundle actually booted, so the native
// splash screen is never left on screen if the app fails to start.
if (typeof window !== 'undefined') {
  window.__appBooted = true
  if (typeof window.__armSplashWatchdog === 'function') window.__armSplashWatchdog()
}

if (isNative && typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((reg) => reg.unregister()))
  if (typeof caches !== 'undefined') caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)))
}

const isAdmin = location.pathname.startsWith('/admin')
const isApp = isNative || new URLSearchParams(location.search).get('ui') === 'app'

const screen = isAdmin ? <AdminApp /> : isApp ? <AppShell /> : <App />

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* The admin panel is always Arabic (and RTL), whatever language the
        store/app is set to — the user's saved preference is not overwritten. */}
    <LanguageProvider fixedLang={isAdmin ? 'ar' : undefined}>
      {isNative ? <NativeSplash>{screen}</NativeSplash> : screen}
    </LanguageProvider>
  </StrictMode>,
)

// Tell the splash overlay that the app is on screen, so it can fade out. Two frames are
// needed to be sure the first render has actually been painted.
if (typeof window !== 'undefined') {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.__appPainted = true
      window.dispatchEvent(new Event('app:painted'))
    })
  })
}
