import {
  FileText,
  Globe,
  Heart,
  LogIn,
  LogOut,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  ShieldCheck,
  Truck,
  User,
} from 'lucide-react'
import { useCompany } from '../../context/DataContext.jsx'
import { useLang } from '../../context/LanguageContext.jsx'
import { useStore } from '../../context/StoreContext.jsx'
import { useAppNav } from '../nav.jsx'
import ProductArt from '../../components/ProductArt.jsx'

export default function AccountScreen() {
  const { t, lang, toggleLang } = useLang()
  const company = useCompany()
  const { customer, isAuthenticated, signOut, favorites, notify } = useStore()
  const nav = useAppNav()

  const rows = [
    { icon: Phone, label: t('header.callUs'), value: company.phone, href: `tel:${company.phoneHref}` },
    {
      icon: MessageCircle,
      label: 'واتساب',
      value: company.phone,
      href: `https://wa.me/${company.whatsapp}`,
    },
    { icon: Mail, label: t('footer.email'), value: company.email, href: `mailto:${company.email}` },
    { icon: MapPin, label: t('footer.address'), value: company.address?.[lang] ?? company.address },
  ]

  const accountLinks = [
    { id: 'orders', icon: Package, label: t('account.myOrders') },
    { id: 'favorites', icon: Heart, label: t('header.wishlist'), badge: favorites.length },
    { id: 'profile', icon: User, label: t('account.profile') },
  ]

  return (
    <div className="space-y-4 pb-6">
      <section className="bg-gradient-to-l from-app-800 to-app-500 p-5 pt-safe text-white">
        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white text-app-700">
              <User className="size-7" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-extrabold">{customer?.name}</p>
              <p className="ltr-nums truncate text-xs text-app-100">{customer?.phone}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white">
              <ProductArt kind="case" palette="sky" className="size-full" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-extrabold">{t('brand.name')}</p>
              <p className="text-xs text-app-100">{t('brand.tagline')}</p>
            </div>
          </div>
        )}
      </section>

      {!isAuthenticated && (
        <section className="mx-4 flex gap-2">
          <button
            type="button"
            onClick={() => nav.push({ name: 'auth', params: { mode: 'login' } })}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-app-600 py-3 text-sm font-bold text-white active:scale-[0.98]"
          >
            <LogIn className="size-4" aria-hidden="true" />
            {t('auth.loginAction')}
          </button>
          <button
            type="button"
            onClick={() => nav.push({ name: 'auth', params: { mode: 'register' } })}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-bold text-app-700 shadow-soft active:scale-[0.98]"
          >
            {t('header.register')}
          </button>
        </section>
      )}

      {isAuthenticated && (
        <section className="mx-4 overflow-hidden rounded-2xl bg-white shadow-soft">
          {accountLinks.map(({ id, icon, label, badge }) => {
            const Icon = icon
            return (
              <button
                key={id}
                type="button"
                onClick={() => nav.push({ name: id })}
                className="flex w-full items-center gap-3 border-b border-ink-100 p-4 text-start last:border-b-0"
              >
                <Icon className="size-5 shrink-0 text-app-600" aria-hidden="true" />
                <span className="flex-1 text-sm font-bold text-ink-900">{label}</span>
                {badge > 0 && (
                  <span className="num rounded-full bg-app-50 px-2 py-0.5 text-[11px] font-bold text-app-700">
                    {badge}
                  </span>
                )}
              </button>
            )
          })}
        </section>
      )}

      <section className="mx-4 overflow-hidden rounded-2xl bg-white shadow-soft">
        <button
          type="button"
          onClick={toggleLang}
          className="flex w-full items-center gap-3 border-b border-ink-100 p-4 text-start"
        >
          <Globe className="size-5 text-app-600" aria-hidden="true" />
          <span className="flex-1 text-sm font-bold text-ink-900">{t('header.language')}</span>
          <span className="text-xs font-bold text-app-600">{lang === 'ar' ? 'العربية' : 'English'}</span>
        </button>
        {rows.map(({ icon, label, value, href }) => {
          const Icon = icon
          const content = (
            <>
              <Icon className="size-5 shrink-0 text-app-600" aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <span className="block text-xs text-ink-400">{label}</span>
                <span className="ltr-nums block truncate text-sm font-bold text-ink-900">{value}</span>
              </span>
            </>
          )
          return href ? (
            <a key={label} href={href} className="flex items-center gap-3 border-t border-ink-100 p-4 first:border-t-0">
              {content}
            </a>
          ) : (
            <div key={label} className="flex items-center gap-3 border-t border-ink-100 p-4">
              {content}
            </div>
          )
        })}
      </section>

      <section className="space-y-2 px-4">
        <h3 className="text-xs font-bold text-ink-400">{t('nav.quickLinks')}</h3>
        {[
          { icon: ShieldCheck, label: t('features.warranty'), desc: t('features.warrantyDesc') },
          { icon: Truck, label: t('nav.shipping'), value: t('features.shippingDesc') },
          { icon: FileText, label: t('nav.terms') },
        ].map(({ icon, label, value }) => {
          const Icon = icon
          return (
            <div key={label} className="flex items-center gap-3 rounded-2xl bg-white p-3.5 shadow-soft">
              <Icon className="size-5 shrink-0 text-app-500" aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-ink-900">{label}</span>
                {value && <span className="block truncate text-[11px] text-ink-500">{value}</span>}
              </span>
            </div>
          )
        })}
      </section>

      {isAuthenticated && (
        <section className="px-4">
          <button
            type="button"
            onClick={() => {
              signOut()
              notify(t('auth.signedOut'), 'info')
            }}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-3 text-sm font-bold text-rose-600 shadow-soft active:scale-[0.99]"
          >
            <LogOut className="size-4" aria-hidden="true" />
            {t('auth.signOut')}
          </button>
        </section>
      )}

      <section className="px-4">
        <button
          type="button"
          onClick={toggleLang}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-3 text-sm font-bold text-app-700 shadow-soft active:scale-[0.99]"
        >
          <Globe className="size-4" aria-hidden="true" />
          {lang === 'ar' ? 'English' : 'العربية'}
        </button>
      </section>
    </div>
  )
}
