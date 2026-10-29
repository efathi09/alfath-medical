import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { useLang, useLocalizer } from '../context/LanguageContext.jsx'
import { useData } from '../context/DataContext.jsx'
import { heroSlides } from '../data/promos.js'
import ProductArt from './ProductArt.jsx'

const AUTOPLAY_MS = 6500

function bannerText(slide, field, lang, t) {
  const literal = slide?.[field]
  if (literal && typeof literal === 'object') {
    const value = lang === 'ar' ? literal.ar : literal.en
    if (value) return value
  }
  const key = slide?.[`${field}Key`]
  return key ? t(key) : ''
}

export default function HeroCarousel() {
  const { t, lang, isRTL } = useLang()
  const localize = useLocalizer()
  const { settings } = useData()
  const slides = useMemo(() => {
    const list = Array.isArray(settings?.banners)
      ? settings.banners.filter((b) => b.isActive !== false)
      : []
    return list.length ? list : heroSlides
  }, [settings])
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const touchStart = useRef(null)
  const total = slides.length

  const goTo = useCallback(
    (next) => setIndex((((next % total) + total) % total)),
    [total],
  )

  useEffect(() => {
    if (paused) return undefined
    const id = window.setInterval(() => goTo(index + 1), AUTOPLAY_MS)
    return () => window.clearInterval(id)
  }, [index, paused, goTo])

  useEffect(() => {
    function onKey(event) {
      if (event.key === 'ArrowRight') goTo(index + (isRTL ? -1 : 1))
      if (event.key === 'ArrowLeft') goTo(index + (isRTL ? 1 : -1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, goTo, isRTL])

  function handleTouchEnd(event) {
    if (touchStart.current == null) return
    const delta = event.changedTouches[0].clientX - touchStart.current
    if (Math.abs(delta) > 45) goTo(index + (delta < 0 ? 1 : -1))
    touchStart.current = null
  }

  return (
    <section
      className="relative overflow-hidden bg-ink-50"
      aria-roledescription="carousel"
      aria-label={t('hero.slide1Title')}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(event) => {
        touchStart.current = event.touches[0].clientX
      }}
      onTouchEnd={handleTouchEnd}
    >
      <div className="container-x py-6 lg:py-10">
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-12">
            <div className="relative h-[420px] overflow-hidden rounded-3xl shadow-lift sm:h-[440px] lg:h-[500px]">
              {slides.map((slide, slideIndex) => {
                const active = slideIndex === index
                return (
                  <article
                    key={slide.id}
                    role="group"
                    aria-roledescription="slide"
                    aria-label={`${slideIndex + 1} / ${total}`}
                    aria-hidden={!active}
                    className={`absolute inset-0 flex items-center transition-all duration-700 ease-out ${
                      active ? 'is-active translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-bl from-brand-700 via-brand-800 to-ink-950" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(94,234,212,0.25),transparent_55%)]" />
                    <div
                      className={`absolute -bottom-24 -end-16 size-80 rounded-full opacity-70 blur-2xl ${
                        ['bg-brand-400/40', 'bg-violet-400/40', 'bg-lime-300/35', 'bg-deal-400/40'][slideIndex % 4]
                      }`}
                      aria-hidden="true"
                    />

                    <div className="relative grid w-full grid-cols-1 items-center gap-6 p-7 sm:p-10 lg:grid-cols-2 lg:p-14">
                      <div className={`max-w-xl ${active ? '' : 'translate-y-2'}`}>
                        <span className="chip mb-4 bg-white/15 text-white backdrop-blur">
                          <span className="size-1.5 rounded-full bg-deal-300" aria-hidden="true" />
                          {localize(slide, 'kicker')}
                        </span>
                        <h2 className="text-3xl leading-tight font-extrabold text-white sm:text-4xl lg:text-[42px]">
                          {bannerText(slide, 'title', lang, t)}
                        </h2>
                        <p className="mt-4 max-w-lg text-sm leading-7 text-white/75 sm:text-base">
                          {bannerText(slide, 'sub', lang, t)}
                        </p>

                        <div className="mt-7 flex flex-wrap items-center gap-3">
                          <a href={slide.href} className="btn bg-white px-6 py-3 text-brand-700 hover:bg-brand-50">
                            {bannerText(slide, 'cta', lang, t)}
                          </a>
                          <span className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-3.5 py-2.5 text-xs font-bold text-white/85">
                            <ShieldCheck className="size-4 text-brand-300" aria-hidden="true" />
                            {localize(slide, 'stat')}
                          </span>
                        </div>
                      </div>

                      <div className="relative hidden lg:block">
                        <div className="relative mx-auto aspect-square w-full max-w-[320px]">
                          <div className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-sm" aria-hidden="true" />
                          <div className="absolute inset-6 rounded-full border border-white/15" aria-hidden="true" />
                          <ProductArt
                            kind={slide.art}
                            palette={slide.palette}
                            className="absolute inset-10 size-[calc(100%-5rem)] rounded-full object-cover shadow-lift"
                          />
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })}

              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 p-5">
                <div className="flex items-center gap-2">
                  {slides.map((slide, dotIndex) => (
                    <button
                      key={slide.id}
                      type="button"
                      onClick={() => goTo(dotIndex)}
                      aria-label={`${t('hero.goTo')} ${dotIndex + 1}`}
                      aria-current={dotIndex === index}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        dotIndex === index ? 'w-8 bg-deal-400' : 'w-2 bg-white/40 hover:bg-white/70'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => goTo(index - 1)}
                    aria-label={t('hero.prev')}
                    className="min-h-10 rounded-full border border-white/20 bg-white/10 px-3 text-xs font-bold text-white transition-colors hover:bg-white/25"
                  >
                    {t('hero.prev')}
                  </button>
                  <button
                    type="button"
                    onClick={() => goTo(index + 1)}
                    aria-label={t('hero.next')}
                    className="min-h-10 rounded-full border border-white/20 bg-white/10 px-3 text-xs font-bold text-white transition-colors hover:bg-white/25"
                  >
                    {t('hero.next')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
