import { useEffect, useState } from 'react'

const UNITS = [
  { key: 'days', ms: 86_400_000, pad: 2 },
  { key: 'hours', ms: 3_600_000, pad: 2 },
  { key: 'minutes', ms: 60_000, pad: 2 },
  { key: 'seconds', ms: 1000, pad: 2 },
]

function splitRemaining(remaining) {
  let rest = Math.max(0, remaining)
  return UNITS.map(({ key, ms, pad }) => {
    const value = Math.floor(rest / ms)
    rest -= value * ms
    return { key, value: String(value).padStart(pad, '0') }
  })
}

function useTicker(deadline) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  return Math.max(0, deadline - now)
}

export default function CountdownTimer({ deadline, labels, variant = 'panel', onExpire, className = '' }) {
  const remaining = useTicker(deadline)
  const expired = remaining <= 0

  useEffect(() => {
    if (expired) onExpire?.()
  }, [expired, onExpire])

  const parts = splitRemaining(remaining)

  const skin = {
    panel: 'bg-ink-950 text-white',
    light: 'bg-white text-ink-900 border border-ink-100',
    brand: 'bg-brand-700 text-white',
  }[variant]

  const cellSkin = {
    panel: 'bg-white/10 text-white',
    light: 'bg-ink-50 text-ink-900',
    brand: 'bg-white/15 text-white',
  }[variant]

  if (expired) {
    return (
      <div
        className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold ${skin} ${className}`}
        role="timer"
        aria-live="polite"
      >
        {labels.ended}
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-1.5 ${className}`} role="timer" aria-live="off">
      {parts.map((part, index) => (
        <div key={part.key} className="flex items-center gap-1.5">
          <div
            className={`flex min-w-13 flex-col items-center rounded-xl px-2 py-1.5 tabular-nums ${cellSkin}`}
          >
            <span className="num text-lg leading-6 font-extrabold sm:text-xl">{part.value}</span>
            <span className="text-[10px] font-medium opacity-70">{labels[part.key]}</span>
          </div>
          {index < parts.length - 1 && (
            <span className="text-lg leading-6 font-extrabold opacity-40" aria-hidden="true">
              :
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

export function CompactCountdown({ deadline, labels, className = '' }) {
  const remaining = useTicker(deadline)
  const parts = splitRemaining(remaining).filter(
    (part) => part.key !== 'days' || Number(part.value) > 0,
  )

  return (
    <div
      className={`flex items-center gap-1 rounded-xl bg-ink-950 px-3 py-2 text-white ${className}`}
      role="timer"
    >
      <span className="text-[11px] font-medium opacity-70">{labels.endsIn}</span>
      <span className="num text-sm font-extrabold tabular-nums">
        {parts.map((part) => part.value).join(':')}
      </span>
    </div>
  )
}
