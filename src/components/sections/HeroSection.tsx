import { useEffect, useMemo, useRef, type RefObject } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ChevronRight, Headphones, MapPin, Mic2, Sparkles, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useScrollToSection } from '@/hooks/useScrollToSection'
import { supportsScrollTimeline } from '@/lib/supportsScrollTimeline'
import sergeyPhoto from '@/assets/sergey.webp'
import heroBackground from '@/assets/baground.jpeg'

const HERO_PARALLAX_MAX_PX = 120
const HERO_PARALLAX_SCROLL_RANGE = 520
const HERO_PARALLAX_SCALE_START = 1.05
const HERO_PARALLAX_SCALE_EXTRA = 0.14

const heroSergeyIcons = [
  { Icon: Mic2, label: 'Веду занятия сам' },
  { Icon: Headphones, label: 'Студийный звук' },
  { Icon: MapPin, label: 'Санкт-Петербург' },
  { Icon: Sparkles, label: 'Без конвейера' },
] as const

function useHeroPhotoParallax(
  active: boolean,
  elRef: RefObject<HTMLDivElement | null>,
) {
  useEffect(() => {
    if (!active) return
    const el = elRef.current
    if (!el) return

    let raf = 0
    const apply = () => {
      raf = 0
      const y = Math.max(0, window.scrollY)
      const t = Math.min(1, y / HERO_PARALLAX_SCROLL_RANGE)
      const ty = t * HERO_PARALLAX_MAX_PX
      const sc = HERO_PARALLAX_SCALE_START + t * HERO_PARALLAX_SCALE_EXTRA
      el.style.transformOrigin = 'center center'
      el.style.transform = `translate3d(0,${ty}px,0) scale(${sc})`
    }

    const onScroll = () => {
      if (raf === 0) raf = requestAnimationFrame(apply)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    apply()
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [active, elRef])
}

export function HeroSection() {
  const reduce = useReducedMotion()
  const wrap = useRef<HTMLDivElement>(null)
  const heroPhotoRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const glowPending = useRef<{ x: number; y: number } | null>(null)
  const glowRaf = useRef(0)
  const scrollTo = useScrollToSection()
  const cssScroll = useMemo(() => supportsScrollTimeline(), [])
  const parallaxCss = !reduce && cssScroll
  const parallaxFallback = !reduce && !cssScroll

  useHeroPhotoParallax(parallaxFallback, heroPhotoRef)

  const onMove = (e: React.PointerEvent) => {
    const el = wrap.current
    const g = glowRef.current
    if (!el || !g) return
    const r = el.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width) * 100
    const y = ((e.clientY - r.top) / r.height) * 100
    glowPending.current = {
      x: Math.min(100, Math.max(0, x)),
      y: Math.min(100, Math.max(0, y)),
    }
    if (glowRaf.current) return
    glowRaf.current = requestAnimationFrame(() => {
      glowRaf.current = 0
      const p = glowPending.current
      if (!p) return
      g.style.background = `radial-gradient(600px circle at ${p.x}% ${p.y}%, rgba(139,92,246,0.55), transparent 55%)`
    })
  }

  return (
    <section
      ref={wrap}
      onPointerMove={onMove}
      className="relative isolate min-h-[100svh] overflow-hidden pt-16 md:pt-24"
    >
      <div className="pointer-events-none absolute inset-0 -z-20 overflow-hidden">
        <div
          ref={heroPhotoRef}
          className={`absolute left-0 top-[-20%] h-[140%] w-full origin-center transform-gpu bg-cover bg-center opacity-[0.35] ${
            parallaxCss ? 'echovox-hero-photo-parallax' : ''
          }`}
          style={{ backgroundImage: `url(${heroBackground})` }}
        />
      </div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-studio-bg/20 via-studio-bg/85 to-studio-bg" />
      <div className="absolute inset-0 -z-10 bg-radial-glow" />
      <div
        ref={glowRef}
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.22]"
        style={{
          background:
            'radial-gradient(600px circle at 50% 35%, rgba(139,92,246,0.55), transparent 55%)',
        }}
      />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid-white bg-[length:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />

      <div className="mx-auto max-w-6xl px-4 pb-10 pt-4 sm:px-6 sm:pb-16 sm:pt-8 md:pb-24 md:pt-16">
        <div className="relative md:pr-[min(23.5rem,36vw)] lg:pr-[25rem]">
          <div className="flex max-w-2xl flex-col">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex w-fit max-w-full items-center gap-1.5 rounded-full border border-white/[0.12] bg-white/[0.05] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-200 backdrop-blur-md sm:gap-2 sm:px-3.5 sm:text-[11px] sm:tracking-[0.24em]"
          >
            <Sparkles className="size-3.5 text-accent-gold" aria-hidden />
            Студия звука · Санкт-Петербург
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 font-display text-[1.65rem] font-black leading-[1.05] tracking-[-0.02em] text-white drop-shadow-[0_4px_48px_rgba(0,0,0,0.55)] sm:mt-6 sm:text-4xl sm:leading-[1.02] sm:tracking-[-0.025em] md:mt-7 md:text-[3.35rem] md:leading-[1.02] md:tracking-[-0.03em]"
          >
            Голос, который{' '}
            <span className="text-gradient drop-shadow-[0_2px_24px_rgba(139,92,246,0.25)]">
              заполняет пространство
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 max-w-[34rem] text-[0.9375rem] font-normal leading-[1.62] tracking-[-0.008em] text-zinc-300/90 sm:mt-5 sm:text-base sm:leading-[1.68] md:mt-6 md:text-[1.0625rem] md:leading-[1.68] md:text-zinc-300/95"
          >
            Echovox — небольшая вокальная студия в Петербурге. На занятиях
            работаем над тем, чтобы голос держался, звучал в микрофоне и не
            терялся на выступлении. Занятия один на один, без обещаний «чудо за
            три встречи».
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 flex flex-row flex-wrap gap-2 sm:mt-7 sm:gap-3 md:mt-8 md:flex-row md:items-center"
          >
            <Button
              size="lg"
              type="button"
              className="min-h-11 min-w-0 flex-1 basis-[calc(50%-0.25rem)] px-3 text-sm sm:min-h-12 sm:flex-none sm:basis-auto sm:px-8 sm:text-base"
              onClick={() => scrollTo('#contact')}
            >
              Записаться
            </Button>
            <Button
              variant="secondary"
              size="lg"
              type="button"
              className="min-h-11 min-w-0 flex-1 basis-[calc(50%-0.25rem)] px-3 text-sm sm:min-h-12 sm:flex-none sm:basis-auto sm:px-8 sm:text-base"
              onClick={() => scrollTo('#about')}
            >
              Узнать подход
            </Button>
          </motion.div>

          <div className="mt-4 flex flex-wrap gap-2 sm:mt-5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-400">
              <User className="size-3.5 text-zinc-500" aria-hidden />
              Индивидуально
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-400">
              <Sparkles className="size-3.5 text-zinc-500" aria-hidden />
              С нуля или с опытом
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-400">
              <MapPin className="size-3.5 text-zinc-500" aria-hidden />
              Санкт-Петербург
            </span>
          </div>
          </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative mt-6 flex min-h-0 w-full max-w-md flex-col overflow-hidden rounded-2xl border border-white/[0.09] bg-zinc-950/[0.28] shadow-[0_8px_36px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-2xl backdrop-saturate-150 sm:mt-8 sm:bg-zinc-950/[0.32] sm:rounded-3xl sm:shadow-[0_12px_44px_rgba(0,0,0,0.32)] md:mt-0 md:rounded-3xl md:bg-zinc-950/[0.34] md:absolute md:right-0 md:top-0 md:h-full md:max-w-none md:w-[min(22.5rem,32vw)] lg:w-[min(24rem,30%)]"
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-transparent" />
          <div className="relative flex min-h-0 flex-col md:h-full">
            <div className="relative min-h-[10.5rem] w-full flex-1 overflow-hidden border-b border-white/[0.07] sm:min-h-[12rem] md:min-h-0">
              <img
                src={sergeyPhoto}
                alt="Сергей"
                width={320}
                height={400}
                decoding="async"
                fetchPriority="high"
                className="h-full min-h-[10rem] w-full object-cover object-[center_15%] sm:min-h-[11.5rem] md:min-h-0"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-zinc-950/70 via-zinc-950/18 to-transparent sm:h-28" />
              <p className="absolute bottom-3 left-0 right-0 text-center font-display text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                Echovox
              </p>
            </div>

            <div className="flex shrink-0 flex-col gap-3 p-4 sm:gap-4 sm:p-6 md:gap-4 md:p-6">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-accent-violet sm:text-xs sm:tracking-[0.28em]">
                  О себе
                </p>
                <p className="mt-1.5 font-display text-xl font-bold tracking-tight text-white sm:mt-2 sm:text-2xl sm:text-[1.65rem] md:text-3xl">
                  Сергей
                </p>
                <p className="mt-1 text-[11px] leading-snug text-zinc-500 sm:mt-1.5 sm:text-xs sm:text-[13px] sm:leading-relaxed">
                  основатель и преподаватель
                </p>
              </div>

              <div
                className="flex flex-wrap gap-1.5 sm:gap-2"
                role="list"
                aria-label="Направления"
              >
                {heroSergeyIcons.map(({ Icon, label }) => (
                  <span
                    key={label}
                    role="listitem"
                    title={label}
                    className="inline-flex size-9 items-center justify-center rounded-full border border-white/[0.09] bg-white/[0.035] text-accent-gold shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:size-11"
                  >
                    <Icon className="size-4 shrink-0 sm:size-[1.05rem]" aria-hidden />
                    <span className="sr-only">{label}</span>
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={() => scrollTo('#founder')}
                className="group flex w-full items-center justify-between gap-2 rounded-lg border border-white/[0.09] bg-white/[0.03] px-3 py-2.5 text-left text-[11px] font-medium text-zinc-200 transition-colors hover:border-white/[0.1] hover:bg-white/[0.06] hover:text-white sm:gap-3 sm:rounded-xl sm:px-4 sm:py-3.5 sm:text-sm"
              >
                <span>Развернуть о педагоге</span>
                <ChevronRight
                  className="size-4 shrink-0 text-zinc-500 transition-transform group-hover:translate-x-0.5 group-hover:text-accent-gold sm:size-5"
                  aria-hidden
                />
              </button>
            </div>
          </div>
        </motion.div>
        </div>
      </div>
    </section>
  )
}
