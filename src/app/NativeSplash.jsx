import { useCallback, useEffect, useRef, useState } from 'react'
import { SplashScreen } from '@capacitor/splash-screen'

// Branded splash shown on native platforms.
//
// The native side (NativeSplashPlugin.java) paints the same logo, at the same size and
// the same position as this overlay, so the hand-off between the two is invisible: the
// logo never changes size or moves while the app starts.
const FADE_MS = 300
const MIN_VISIBLE_MS = 900

// Width of the logo in dp. Must match LOGO_SIZE_DP in NativeSplashPlugin.java.
const LOGO_SIZE = 190

const cap = typeof window !== 'undefined' ? window.Capacitor : undefined

// Reveal the native overlay: it is painting the identical logo, so fading it out shows
// the very same pixels that are already waiting behind it.
const hideNativeSplash = () => {
  const plugin = cap?.Plugins?.NativeSplash
  if (plugin?.hide) {
    return plugin.hide({ fadeOutDuration: FADE_MS }).catch(() => {})
  }
  return SplashScreen.hide({ fadeOutDuration: FADE_MS }).catch(() => {})
}

export default function NativeSplash({ children }) {
  const [ready, setReady] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [gone, setGone] = useState(false)
  const paintedAt = useRef(0)
  const timers = useRef([])
  const revealed = useRef(false)

  // The app is on screen. Fade the native overlay away first (it shows the same logo in
  // the same spot), then this overlay: the logo is never seen moving or resizing.
  const reveal = useCallback(() => {
    if (revealed.current) return
    revealed.current = true
    const wait = Math.max(0, MIN_VISIBLE_MS - (Date.now() - paintedAt.current))
    const id = setTimeout(() => {
      hideNativeSplash().then(() => {
        setLeaving(true)
        timers.current.push(setTimeout(() => setGone(true), FADE_MS))
      })
    }, wait)
    timers.current.push(id)
  }, [])

  useEffect(() => {
    const onPainted = () => reveal()
    // The app never painted (see the watchdog in index.html): do not keep the splash up.
    const onForceHide = () => {
      setLeaving(true)
      setGone(true)
    }
    window.addEventListener('app:painted', onPainted)
    window.addEventListener('splash:force-hide', onForceHide)
    // React renders asynchronously, so the app can already be painted by the time this
    // effect runs: the flag is polled as well, the event alone would be missed.
    const poll = setInterval(() => {
      if (window.__appPainted) {
        clearInterval(poll)
        reveal()
      }
    }, 200)
    return () => {
      window.removeEventListener('app:painted', onPainted)
      window.removeEventListener('splash:force-hide', onForceHide)
      clearInterval(poll)
      timers.current.forEach(clearTimeout)
      timers.current = []
    }
  }, [reveal])

  // The logo is only shown once it has actually been painted, so the splash is never a
  // blank white screen (the image may still be downloading when the overlay mounts).
  const onLogoLoad = () => {
    paintedAt.current = Date.now()
    setReady(true)
  }

  // Never block the app on the image: if it fails, show the app right away.
  const onLogoError = () => {
    paintedAt.current = Date.now() - MIN_VISIBLE_MS
    setReady(true)
    reveal()
  }

  if (gone) return children

  return (
    <>
      {children}
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-white"
        style={{
          opacity: leaving ? 0 : 1,
          transition: `opacity ${FADE_MS}ms ease-out`,
        }}
      >
        <img
          src="/splash-logo.png"
          alt="الفتح الطبية"
          onLoad={onLogoLoad}
          onError={onLogoError}
          style={{
            width: `min(${LOGO_SIZE}px, 60vw, 50vh)`,
            // A plain cross-fade: the logo is drawn at its final size from the first frame,
            // so it never appears to "jump" or resize after it shows up.
            opacity: ready ? 1 : 0,
            transition: `opacity ${FADE_MS}ms ease-out`,
          }}
        />
      </div>
    </>
  )
}
