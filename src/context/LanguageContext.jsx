import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { createT, translations } from '../i18n/translations.js'

const LanguageContext = createContext(null)
const STORAGE_KEY = 'me.lang'

function detectInitialLang() {
  if (typeof window === 'undefined') return 'ar'
  const saved = window.localStorage.getItem(STORAGE_KEY)
  if (saved === 'ar' || saved === 'en') return saved
  return 'ar'
}

/**
 * @param {string} [fixedLang] pins the UI to one language. Used by the admin panel,
 * which must stay Arabic (and RTL) whatever language the store/app is set to.
 * When pinned, the user's saved preference is left untouched.
 */
export function LanguageProvider({ children, fixedLang }) {
  const [storedLang, setLangState] = useState(detectInitialLang)
  const lang = fixedLang ?? storedLang
  const dir = translations[lang].dir
  const t = useMemo(() => createT(lang), [lang])

  useEffect(() => {
    const root = document.documentElement
    root.lang = lang
    root.dir = dir
    if (!fixedLang) window.localStorage.setItem(STORAGE_KEY, lang)
  }, [lang, dir, fixedLang])

  const setLang = useCallback(
    (next) => {
      if (fixedLang) return
      setLangState((prev) => (prev === next ? prev : next))
    },
    [fixedLang],
  )

  const toggleLang = useCallback(() => {
    if (fixedLang) return
    setLangState((prev) => (prev === 'ar' ? 'en' : 'ar'))
  }, [fixedLang])

  const value = useMemo(
    () => ({ lang, dir, isRTL: dir === 'rtl', t, setLang, toggleLang }),
    [lang, dir, t, setLang, toggleLang],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLang() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang must be used inside <LanguageProvider>')
  return ctx
}

/** Picks the Arabic or English variant of a localized data field. */
export function useLocalizer() {
  const { lang } = useLang()
  return useCallback(
    (obj, field = 'name') => {
      if (obj == null) return ''
      if (typeof obj === 'string') return obj
      const value = field === 'name' ? (obj[field] ?? obj) : obj[field]
      if (value == null) return ''
      if (typeof value === 'string') return value
      return value[lang] ?? value.ar ?? value.en ?? ''
    },
    [lang],
  )
}
