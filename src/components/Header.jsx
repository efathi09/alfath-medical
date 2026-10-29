import { useEffect, useState } from 'react'
import {
  ChevronDown,
  FileText,
  Flame,
  Headset,
  LayoutGrid,
  LogIn,
  Mail,
  Menu,
  Phone,
  ShoppingCart,
  Sparkles,
  Truck,
  UserPlus,
  X,
} from 'lucide-react'
import { useLang, useLocalizer } from '../context/LanguageContext.jsx'
import { useStore } from '../context/StoreContext.jsx'
import { useData, useCompany } from '../context/DataContext.jsx'
import { quickLinks } from '../data/categories.js'
import Logo from './ui/Logo.jsx'
import MegaMenu from './MegaMenu.jsx'
import SearchBox from './SearchBox.jsx'
import LanguageSwitcher from './LanguageSwitcher.jsx'
import AccountMenu from './AccountMenu.jsx'

const categoryIcon = {
  clinical: LayoutGrid,
  student: Sparkles,
  food: Sparkles,
  disposable: LayoutGrid,
}

function MobileDrawer({ open, onClose, onNavigate, onQuote }) {
  const { t } = useLang()
  const localize = useLocalizer()
  const { categories } = useData()
  const company = useCompany()
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    if (!open) return undefined
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    function onKey(event) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  return (
    <>
      <div
        className={`fixed inset-0 z-60 bg-ink-950/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`fixed inset-y-0 start-0 z-70 flex w-[86%] max-w-sm flex-col bg-white shadow-lift transition-transform duration-300 lg:hidden ${
          open ? 'translate-x-0' : 'ltr:-translate-x-full rtl:translate-x-full'
        }`}
        aria-hidden={!open}
        aria-label={t('header.menu')}
      >
        <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
          <Logo />
          <button type="button" onClick={onClose} className="btn-ghost size-10" aria-label={t('header.close')}>
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
          <ul className="space-y-1">
            <li>
              <button
                type="button"
                onClick={() => {
                  onNavigate('all', '')
                  onClose()
                }}
                className="flex w-full items-center gap-2 rounded-xl bg-brand-600 px-3 py-2.5 text-sm font-bold text-white"
              >
                <LayoutGrid className="size-4" aria-hidden="true" />
                {t('nav.allCategories')}
              </button>
            </li>

            {categories.map((category) => {
              const Icon = categoryIcon[category.id] ?? LayoutGrid
              const isOpen = expanded === category.id
              return (
                <li key={category.id} className="overflow-hidden rounded-xl border border-ink-100">
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : category.id)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center gap-2 px-3 py-3 text-sm font-bold text-ink-700"
                  >
                    <Icon className="size-4 text-brand-600" aria-hidden="true" />
                    <span className="flex-1 text-start">{localize(category, 'name')}</span>
                    <ChevronDown
                      className={`size-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      aria-hidden="true"
                    />
                  </button>
                  {isOpen && (
                    <div className="border-t border-ink-100 bg-ink-50/60 px-3 py-2">
                      {(category.groups ?? []).map((group) => (
                        <div key={group.title.en} className="mb-3 last:mb-0">
                          <p className="mb-1.5 text-[11px] font-extrabold text-ink-400">
                            {localize(group, 'title')}
                          </p>
                          <ul className="space-y-0.5">
                            {group.items.map((item) => (
                              <li key={item.en}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    onNavigate(category.id, localize(item))
                                    onClose()
                                  }}
                                  className="w-full rounded-lg px-2 py-1.5 text-start text-[13px] text-ink-600 hover:bg-white hover:text-brand-700"
                                >
                                  {localize(item)}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>

          <div className="mt-5">
            <p className="mb-2 px-1 text-[11px] font-extrabold text-ink-400">{t('nav.quickLinks')}</p>
            <ul className="space-y-1">
              {quickLinks.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.href}
                    onClick={onClose}
                    className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-[13px] font-bold text-ink-700 hover:bg-brand-50 hover:text-brand-700"
                  >
                    <Flame className="size-4 text-deal-500" aria-hidden="true" />
                    {localize(link, 'label')}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            onClick={() => {
              onQuote()
              onClose()
            }}
            className="btn-quote mt-5 py-3"
          >
            <FileText className="size-4" aria-hidden="true" />
            {t('product.requestQuote')}
          </button>

          <div className="mt-5 space-y-2 rounded-2xl bg-ink-50 p-4 text-[13px] font-bold text-ink-600">
            <a href={`tel:${company.phoneHref}`} className="flex items-center gap-2">
              <Phone className="size-4 text-brand-600" aria-hidden="true" />
              <span className="ltr-nums">{company.phone}</span>
            </a>
            {company.email && (
              <a href={`mailto:${company.email}`} className="flex items-center gap-2">
                <Mail className="size-4 text-brand-600" aria-hidden="true" />
                <span className="ltr-nums">{company.email}</span>
              </a>
            )}
            <p className="flex items-center gap-2">
              <Headset className="size-4 text-brand-600" aria-hidden="true" />
              {t('header.callUs')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 border-t border-ink-100 p-4">
          <button type="button" className="btn-outline py-2.5">
            <LogIn className="size-4" aria-hidden="true" />
            {t('header.login')}
          </button>
          <button type="button" className="btn-primary py-2.5">
            <UserPlus className="size-4" aria-hidden="true" />
            {t('header.register')}
          </button>
        </div>
      </aside>
    </>
  )
}

export default function Header({ query, setQuery, onSearch, onQuote }) {
  const { t, lang } = useLang()
  const { categories } = useData()
  const company = useCompany()
  const { cartCount, setCartOpen, mobileNavOpen, setMobileNavOpen } = useStore()
  const [searchCategory, setSearchCategory] = useState('all')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function handleSubmit(term, product) {
    onSearch?.(term, searchCategory === 'all' ? product?.category : searchCategory)
  }

  return (
    <header id="top" className="relative z-50 lg:sticky lg:top-0">
      <div className="hidden bg-ink-950 text-white lg:block">
        <div className="container-x flex h-9 items-center justify-between text-[12px]">
          <p className="flex items-center gap-2 text-white/80">
            <Truck className="size-3.5 text-brand-400" aria-hidden="true" />
            {t('header.freeShipping')}
          </p>
          <div className="flex items-center gap-5 text-white/70">
            <a href={`tel:${company.phoneHref}`} className="flex items-center gap-1.5 transition-colors hover:text-white">
              <Phone className="size-3.5" aria-hidden="true" />
              <span className="ltr-nums">{company.phone}</span>
            </a>
            {company.email && (
              <a
                href={`mailto:${company.email}`}
                className="flex items-center gap-1.5 transition-colors hover:text-white"
              >
                <Mail className="size-3.5" aria-hidden="true" />
                <span className="ltr-nums">{company.email}</span>
              </a>
            )}
            <span className="flex items-center gap-1.5">
              <Headset className="size-3.5" aria-hidden="true" />
              {company.workingHours[lang]}
            </span>
          </div>
        </div>
      </div>

      <div
        className={`border-b border-ink-100 bg-white/95 backdrop-blur transition-shadow ${
          scrolled ? 'shadow-soft' : ''
        }`}
      >
        <div className="container-x flex h-22 items-center gap-3 py-2 sm:h-25">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="btn-ghost size-10 shrink-0 lg:hidden"
            aria-label={t('header.menu')}
            aria-expanded={mobileNavOpen}
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>

          <Logo />

          <SearchBox
            value={query}
            onChange={setQuery}
            category={searchCategory}
            onCategoryChange={setSearchCategory}
            onSubmit={handleSubmit}
            className="mx-auto hidden max-w-2xl flex-1 md:block"
          />

          <div className="ms-auto flex items-center gap-1 sm:gap-2 md:ms-0">
            <div className="hidden lg:block">
              <LanguageSwitcher />
            </div>

            <div className="lg:hidden">
              <LanguageSwitcher variant="compact" />
            </div>

            <div className="hidden sm:block">
              <AccountMenu />
            </div>

            <button
              type="button"
              onClick={() => setCartOpen(true)}
              aria-label={t('header.cart')}
              className="btn-ghost relative h-10 gap-1.5 px-2 sm:px-3"
            >
              <span className="relative">
                <ShoppingCart className="size-5 text-brand-600" aria-hidden="true" />
                {cartCount > 0 && (
                  <span className="num absolute -end-2 -top-2 grid min-w-5 place-items-center rounded-full bg-deal-500 px-1 text-[10px] font-extrabold text-white ring-2 ring-white">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </span>
              <span className="hidden text-xs font-bold lg:inline">{t('header.cart')}</span>
            </button>

            <button
              type="button"
              onClick={() => onQuote?.()}
              className="btn-primary hidden h-10 px-4 xl:inline-flex"
            >
              <FileText className="size-4" aria-hidden="true" />
              {t('product.requestQuote')}
            </button>
          </div>
        </div>

        <div className="container-x pb-3 md:hidden">
          <SearchBox
            value={query}
            onChange={setQuery}
            category={searchCategory}
            onCategoryChange={setSearchCategory}
            onSubmit={handleSubmit}
          />
        </div>
      </div>

      <div className="hidden border-b border-ink-100 bg-white lg:block">
        <MegaMenu
          query={query}
          onNavigate={(categoryId, text) => onSearch?.(text, categoryId)}
          onQuote={() => onQuote?.()}
        />
      </div>

      <div className="border-b border-ink-100 bg-brand-50/70 lg:hidden">
        <div className="no-scrollbar container-x flex items-center gap-1 overflow-x-auto py-2">
          <a
            href="#flash"
            className="chip shrink-0 bg-deal-500 text-white"
            aria-label={t('nav.flash')}
          >
            <Flame className="size-3.5" aria-hidden="true" />
            {t('nav.flash')}
          </a>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => onSearch?.('', category.id)}
              className="chip shrink-0 bg-white text-ink-600 shadow-sm"
            >
              {category.name[lang]}
            </button>
          ))}
          <a href="#students" className="chip shrink-0 bg-white text-ink-600 shadow-sm">
            <Sparkles className="size-3.5" aria-hidden="true" />
            {t('nav.student')}
          </a>
        </div>
      </div>

      <MobileDrawer
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        onNavigate={(categoryId, text) => onSearch?.(text, categoryId)}
        onQuote={() => onQuote?.()}
      />
    </header>
  )
}
