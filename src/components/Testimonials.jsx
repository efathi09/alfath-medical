import { Quote, Star } from 'lucide-react'
import { useLang } from '../context/LanguageContext.jsx'
import { testimonials } from '../data/promos.js'
import ProductArt from './ProductArt.jsx'
import SectionHeader from './ui/SectionHeader.jsx'

export default function Testimonials() {
  const { t } = useLang()

  return (
    <section className="bg-ink-50 py-12 sm:py-16">
      <div className="container-x">
        <SectionHeader title={t('testimonials.title')} subtitle={t('testimonials.subtitle')} icon={Star} />

        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map((item) => (
            <figure key={item.nameKey} className="card flex flex-col p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-0.5" aria-hidden="true">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="size-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <Quote className="size-6 text-brand-200" aria-hidden="true" />
              </div>

              <blockquote className="flex-1 text-sm leading-7 text-ink-600">“{t(item.quoteKey)}”</blockquote>

              <figcaption className="mt-5 flex items-center gap-3 border-t border-ink-100 pt-4">
                <ProductArt kind={item.art} palette={item.palette} className="size-11 shrink-0 rounded-xl" />
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-extrabold text-ink-900">
                    {t(item.nameKey)}
                  </span>
                  <span className="block truncate text-[11px] text-ink-500">{t(item.roleKey)}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
