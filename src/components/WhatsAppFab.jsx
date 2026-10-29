import { useEffect, useState } from 'react'
import { MessageCircle, X } from 'lucide-react'
import { useLang } from '../context/LanguageContext.jsx'
import { useCompany } from '../context/DataContext.jsx'

export default function WhatsAppFab() {
  const { t, lang } = useLang()
  const company = useCompany()
  const [visible, setVisible] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 320)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const message = encodeURIComponent(
    lang === 'ar'
      ? 'مرحباً، أرغب في الاستفسار عن منتجات المستلزمات الطبية.'
      : 'Hello, I would like to ask about your medical supplies products.',
  )

  return (
    <div
      className={`fixed bottom-5 end-5 z-70 flex flex-col items-end gap-3 transition-all duration-300 ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'
      }`}
    >
      {open && (
        <div className="w-64 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-lift">
          <div className="bg-[#1FA855] px-4 py-3 text-white">
            <p className="text-sm font-extrabold">{t('footer.whatsapp')}</p>
            <p className="mt-0.5 text-[11px] text-white/85">{t('footer.whatsappDesc')}</p>
          </div>
          <div className="p-3">
            <p className="mb-2 text-[11px] text-ink-500">{t('header.callUs')}</p>
            <a
              href={`https://wa.me/${company.whatsapp}?text=${message}`}
              target="_blank"
              rel="noreferrer noopener"
              className="btn w-full bg-[#1FA855] py-2.5 text-white hover:bg-[#17924a]"
            >
              <MessageCircle className="size-4" aria-hidden="true" />
              {t('footer.whatsappCta')}
            </a>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-label={t('footer.whatsappCta')}
        className="relative grid size-14 place-items-center rounded-full bg-[#1FA855] text-white shadow-lift transition-transform duration-200 hover:scale-105 active:scale-95"
      >
        {open ? <X className="size-6" aria-hidden="true" /> : <MessageCircle className="size-7" aria-hidden="true" />}
        {!open && (
          <span className="absolute -end-0.5 -top-0.5 size-3.5 rounded-full bg-white ring-2 ring-[#1FA855]" aria-hidden="true" />
        )}
      </button>
    </div>
  )
}
