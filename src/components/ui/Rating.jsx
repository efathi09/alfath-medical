import { Star } from 'lucide-react'
import { useLang } from '../../context/LanguageContext.jsx'
import { formatPrice } from './Logo.jsx'

export function Rating({ value = 0, reviews, size = 'sm', className = '' }) {
  const { t } = useLang()
  const iconSize = size === 'sm' ? 'size-3.5' : 'size-4'
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center gap-0.5" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${iconSize} ${
              star <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-ink-200'
            }`}
          />
        ))}
      </div>
      <span className="text-xs font-bold text-ink-700">{value.toFixed(1)}</span>
      {reviews != null && (
        <span className="text-xs text-ink-400">
          (<span className="num">{reviews}</span> {t('product.reviews')})
        </span>
      )}
      <span className="sr-only">
        {value} {t('product.ratings')}
      </span>
    </div>
  )
}

export function PriceTag({ price, oldPrice, className = '', size = 'md' }) {
  const { lang } = useLang()
  const sizes = {
    sm: { now: 'text-base', old: 'text-xs' },
    md: { now: 'text-xl', old: 'text-sm' },
    lg: { now: 'text-3xl', old: 'text-base' },
  }[size]

  return (
    <div className={`flex flex-wrap items-baseline gap-2 ${className}`}>
      <span className={`${sizes.now} font-extrabold text-ink-900`}>{formatPrice(price, lang)}</span>
      {oldPrice > price && (
        <span className={`${sizes.old} font-medium text-ink-400 line-through`}>
          {formatPrice(oldPrice, lang)}
        </span>
      )}
    </div>
  )
}
