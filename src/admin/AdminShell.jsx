import { useState } from 'react'
import {
  BarChart3,
  BadgeCheck,
  ExternalLink,
  FileText,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Package,
  PackageCheck,
  Percent,
  Settings,
  Store,
  Users,
  X,
} from 'lucide-react'
import { useAdminT } from './adminText.js'
import { useLang } from '../context/LanguageContext.jsx'
import { company } from '../data/company.js'
import Dashboard from './Dashboard.jsx'
import ProductsAdmin from './ProductsAdmin.jsx'
import OrdersAdmin from './OrdersAdmin.jsx'
import CategoriesAdmin from './CategoriesAdmin.jsx'
import QuotesAdmin from './QuotesAdmin.jsx'
import OffersAdmin from './OffersAdmin.jsx'
import BrandsAdmin from './BrandsAdmin.jsx'
import UsersAdmin from './UsersAdmin.jsx'
import ReportsAdmin from './ReportsAdmin.jsx'
import SettingsAdmin from './SettingsAdmin.jsx'
import WhatsAppAdmin from './WhatsAppAdmin.jsx'

const NAV = [
  { id: 'dashboard', icon: LayoutDashboard, labelKey: 'nav.dashboard' },
  { id: 'products', icon: Package, labelKey: 'nav.products' },
  { id: 'orders', icon: PackageCheck, labelKey: 'nav.orders' },
  { id: 'categories', icon: FolderTree, labelKey: 'nav.categories' },
  { id: 'offers', icon: Percent, labelKey: 'nav.offers' },
  { id: 'brands', icon: BadgeCheck, labelKey: 'nav.brands' },
  { id: 'quotes', icon: FileText, labelKey: 'nav.quotes' },
  { id: 'users', icon: Users, labelKey: 'nav.users' },
  { id: 'reports', icon: BarChart3, labelKey: 'nav.reports' },
  { id: 'whatsapp', icon: MessageCircle, labelKey: 'nav.whatsapp' },
  { id: 'settings', icon: Settings, labelKey: 'nav.settings' },
]

export default function AdminShell({ onLogout, role }) {
  const t = useAdminT()
  const { t: brandT } = useLang()
  const [view, setView] = useState('dashboard')
  const [navOpen, setNavOpen] = useState(false)
  const canManage = role === 'admin'
  const navItems = canManage ? NAV : NAV.filter((item) => !['users', 'whatsapp', 'settings'].includes(item.id))

  const sidebar = (
    <div className="flex h-full flex-col gap-6 p-4">
      <div className="flex items-center gap-2.5 px-2 pt-1">
        <span className="grid size-10 place-items-center overflow-hidden rounded-xl bg-white ring-1 ring-ink-100">
          <img src={company.logoMark} alt="" className="size-9 object-contain" />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-extrabold text-ink-900">{t('brand.panel')}</p>
          <p className="text-[11px] text-ink-400">{brandT('brand.name')}</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = view === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setView(item.id)
                setNavOpen(false)
              }}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors ${
                active ? 'bg-brand-600 text-white shadow-soft' : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900'
              }`}
            >
              <Icon className="size-5 shrink-0" aria-hidden="true" />
              {t(item.labelKey)}
            </button>
          )
        })}
      </nav>

      <div className="flex flex-col gap-1 border-t border-ink-100 pt-3">
        <a
          href="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-900"
        >
          <Store className="size-5 shrink-0" aria-hidden="true" />
          {t('nav.backToStore')}
          <ExternalLink className="size-3.5 text-ink-400 ms-auto" aria-hidden="true" />
        </a>
        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-rose-600 transition-colors hover:bg-rose-50"
        >
          <LogOut className="size-5 shrink-0" aria-hidden="true" />
          {t('nav.logout')}
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-ink-100 text-ink-800">
      {/* desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-e border-ink-200 bg-white lg:block">
        {sidebar}
      </aside>

      {/* mobile drawer */}
      {navOpen && (
        <div className="fixed inset-0 z-100 lg:hidden">
          <div
            className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm"
            onClick={() => setNavOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute inset-y-0 start-0 w-64 bg-white shadow-lift">
            <button
              type="button"
              onClick={() => setNavOpen(false)}
              aria-label="close"
              className="absolute end-3 top-3 grid size-9 place-items-center rounded-lg text-ink-500 hover:bg-ink-100"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-50 flex h-16 items-center gap-3 border-b border-ink-200 bg-white/90 px-4 backdrop-blur lg:px-6">
          <button
            type="button"
            onClick={() => setNavOpen(true)}
            aria-label={t('brand.panel')}
            className="grid size-10 place-items-center rounded-xl border border-ink-200 text-ink-600 lg:hidden"
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>
          <h1 className="text-base font-extrabold text-ink-900">{t(`nav.${view}`)}</h1>
          {!canManage && <span className="chip border border-ink-200 bg-ink-50 text-ink-500">{t('nav.viewer')}</span>}
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 p-4 lg:p-6">
          {view === 'dashboard' && <Dashboard onNavigate={setView} canManage={canManage} />}
          {view === 'products' && <ProductsAdmin canManage={canManage} />}
          {view === 'orders' && <OrdersAdmin canManage={canManage} />}
          {view === 'categories' && <CategoriesAdmin canManage={canManage} />}
          {view === 'offers' && <OffersAdmin canManage={canManage} />}
          {view === 'brands' && <BrandsAdmin canManage={canManage} />}
          {view === 'quotes' && <QuotesAdmin canManage={canManage} />}
          {canManage && view === 'users' && <UsersAdmin />}
          {view === 'reports' && <ReportsAdmin />}
          {canManage && view === 'whatsapp' && <WhatsAppAdmin />}
          {canManage && view === 'settings' && <SettingsAdmin />}
        </main>
      </div>
    </div>
  )
}
