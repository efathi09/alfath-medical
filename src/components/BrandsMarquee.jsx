import { BadgeCheck } from 'lucide-react'
import { useLang } from '../context/LanguageContext.jsx'
import { useCompany } from '../context/DataContext.jsx'
import SectionHeader from './ui/SectionHeader.jsx'

export default function BrandsMarquee() {
  const { t } = useLang()
  const company = useCompany()
  const loop = [...company.brands, ...company.brands]

  return (
    <section id="brands" className="border-y border-ink-100 bg-white py-12">
      <div className="container-x">
        <SectionHeader
          title={t('brands.title')}
          subtitle={t('brands.subtitle')}
          icon={BadgeCheck}
          className="mb-8"
        />
      </div>

      <div
        className="relative overflow-hidden"
        style={{
          maskImage: 'linear-gradient(to right, transparent, #000 8%, #000 92%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, #000 8%, #000 92%, transparent)',
        }}
      >
        <ul className="flex w-max animate-marquee items-center gap-4 px-2">
          {loop.map((brand, index) => (
            <li
              key={`${brand}-${index}`}
              className="ltr-nums flex shrink-0 items-center gap-2 rounded-2xl border border-ink-100 bg-ink-50/70 px-6 py-4 text-sm font-extrabold tracking-wider whitespace-nowrap text-ink-500 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
            >
              <BadgeCheck className="size-4 shrink-0 text-brand-500" aria-hidden="true" />
              {brand}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
