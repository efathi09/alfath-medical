import { useEffect, useState } from 'react'

/** Routes that render a full page instead of the storefront home. */
export const INFO_ROUTES = [
  'about',
  'contact',
  'shipping',
  'returns',
  'payment',
  'faq',
  'privacy',
  'terms',
]

const SLUG_ALIASES = {
  'من-نحن': 'about',
  'تواصل-معنا': 'contact',
  'اتصل-بنا': 'contact',
  'الشحن': 'shipping',
  'التوصيل': 'shipping',
  'الشحن-والتوصيل': 'shipping',
  'الاسترجاع': 'returns',
  'الاستبدال': 'returns',
  'سياسة-الاسترجاع': 'returns',
  'الدفع': 'payment',
  'طرق-الدفع': 'payment',
  'الخصوصية': 'privacy',
  'سياسة-الخصوصية': 'privacy',
  'الشروط': 'terms',
  'الشروط-والأحكام': 'terms',
  'الأحكام': 'terms',
  'الأسئلة': 'faq',
  'الأسئلة-الشائعة': 'faq',
}

function parse() {
  const hash = window.location.hash
  // In-page anchors (#main, #flash, #top …) are not routes: they keep the home
  // screen. Only a leading "#/" opts into a page.
  if (!hash.startsWith('#/')) return { name: 'home' }
  const raw = hash.replace(/^#\/?/, '').trim()
  if (!raw) return { name: 'home' }
  const slug = decodeURIComponent(raw).toLowerCase()
  const name = INFO_ROUTES.includes(slug) ? slug : SLUG_ALIASES[slug]
  if (name) return { name }
  // Anything else is a real (if unwanted) URL — show the 404 instead of the home.
  return { name: 'notfound', slug }
}

/**
 * Hash-based routing for the storefront. The site has no server router, so the
 * info pages (privacy, terms, shipping…) live at `#/privacy` and friends; they
 * are shareable and work on static hosting without any server configuration.
 */
export function useHashRoute() {
  const [route, setRoute] = useState(() =>
    typeof window === 'undefined' ? { name: 'home' } : parse(),
  )

  useEffect(() => {
    function onChange() {
      setRoute(parse())
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  useEffect(() => {
    if (route.name === 'home') return
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [route.name])

  return route
}
