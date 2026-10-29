import { Headset, LockKeyhole, Percent, ShieldCheck, Truck } from 'lucide-react'
import { useLang } from '../context/LanguageContext.jsx'

const featureIcons = {
  shipping: Truck,
  warranty: ShieldCheck,
  support: Headset,
  secure: LockKeyhole,
  bulk: Percent,
}

export default function FeaturesStrip() {
  const { t } = useLang()
  const keys = Object.keys(featureIcons)

  return (
    <section className="border-y border-ink-100 bg-white">
      <div className="container-x">
        <ul className="grid grid-cols-2 gap-x-4 gap-y-6 py-7 sm:grid-cols-3 lg:grid-cols-5">
          {keys.map((key) => {
            const Icon = featureIcons[key]
            return (
              <li key={key} className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[13px] font-extrabold text-ink-900">{t(`features.${key}`)}</span>
                  <span className="mt-0.5 block text-[11px] leading-4 text-ink-500">{t(`features.${key}Desc`)}</span>
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
