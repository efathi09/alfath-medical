import { useCallback, useEffect, useState } from 'react'
import { useLang } from './context/LanguageContext.jsx'
import { StoreProvider, useStore } from './context/StoreContext.jsx'
import { DataProvider } from './context/DataContext.jsx'
import Header from './components/Header.jsx'
import HeroCarousel from './components/HeroCarousel.jsx'
import FeaturesStrip from './components/FeaturesStrip.jsx'
import CategoryTiles from './components/CategoryTiles.jsx'
import FlashSales from './components/FlashSales.jsx'
import StudentBanner from './components/StudentBanner.jsx'
import BestSellers from './components/BestSellers.jsx'
import BrandsMarquee from './components/BrandsMarquee.jsx'
import WholesaleCta from './components/WholesaleCta.jsx'
import Footer from './components/Footer.jsx'
import CartDrawer from './components/CartDrawer.jsx'
import CheckoutModal from './components/CheckoutModal.jsx'
import QuotationModal from './components/QuotationModal.jsx'
import WhatsAppFab from './components/WhatsAppFab.jsx'
import ToastStack from './components/ToastStack.jsx'
import PwaUpdater from './components/PwaUpdater.jsx'
import { useHashRoute } from './lib/useHashRoute.js'
import { InfoPage, NotFoundPage } from './pages/InfoPages.jsx'
import { INFO_PAGES } from './pages/infoContent.js'

function Storefront() {
  const { t } = useLang()
  const { openQuote, addToQuote } = useStore()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const route = useHashRoute()
  const onInfoPage = route.name !== 'home'

  const scrollToShop = useCallback(() => {
    document.getElementById('bestsellers')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const handleSearch = useCallback((term, categoryId) => {
    setQuery(term ?? '')
    setCategory(categoryId ?? 'all')
    scrollToShop()
  }, [scrollToShop])

  const handleNavigate = useCallback(
    (categoryId, text) => {
      setCategory(categoryId ?? 'all')
      setQuery(text ?? '')
      scrollToShop()
    },
    [scrollToShop],
  )

  const handleQuote = useCallback(
    (product) => {
      if (product) {
        addToQuote(product, (product.minOrder ?? 1) * 10)
        return
      }
      openQuote()
    },
    [addToQuote, openQuote],
  )

  useEffect(() => {
    const brand = `${t('brand.name')} | ${t('brand.tagline')}`
    const page = INFO_PAGES[route.name]
    const lang = document.documentElement.lang
    if (page) {
      document.title = `${page.title[lang === 'en' ? 'en' : 'ar']} | ${t('brand.name')}`
    } else if (route.name === 'notfound') {
      document.title = `404 | ${t('brand.name')}`
    } else {
      document.title = brand
    }
  }, [t, route.name])

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        onClick={(event) => {
          // Keep it an in-page jump: setting the hash would be read as a route.
          event.preventDefault()
          const main = document.getElementById('main')
          if (!main) return
          main.setAttribute('tabindex', '-1')
          main.focus()
          main.scrollIntoView({ block: 'start' })
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:start-3 focus:z-100 focus:rounded-xl focus:bg-ink-900 focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white"
      >
        {t('common.skipToContent')}
      </a>

      <Header query={query} setQuery={setQuery} onSearch={handleSearch} onQuote={() => handleQuote()} />

      <main id="main" className="flex-1">
        {onInfoPage ? (
          route.name === 'notfound' ? (
            <NotFoundPage />
          ) : (
            <InfoPage slug={route.name} />
          )
        ) : (
          <>
            <HeroCarousel />
            <FeaturesStrip />
            <CategoryTiles onNavigate={handleNavigate} onQuote={() => handleQuote()} />
            <FlashSales onQuote={handleQuote} />
            <StudentBanner onQuote={() => handleQuote()} />
            <BestSellers
              category={category}
              query={query}
              onCategoryChange={handleNavigate}
              onClearFilters={() => {
                setCategory('all')
                setQuery('')
              }}
              onQuote={handleQuote}
            />
            <BrandsMarquee />
            <WholesaleCta onQuote={() => handleQuote()} />
          </>
        )}
      </main>

      <Footer onNavigate={(categoryId) => handleNavigate(categoryId, '')} />

      <CartDrawer />
      <CheckoutModal />
      <QuotationModal />
      <WhatsAppFab />
      <ToastStack />
      <PwaUpdater />
    </div>
  )
}

export default function App() {
  return (
    <DataProvider>
      <StoreProvider>
        <Storefront />
      </StoreProvider>
    </DataProvider>
  )
}
