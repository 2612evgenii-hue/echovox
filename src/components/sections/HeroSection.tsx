import { lazy, Suspense, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { MapPin, Sparkles, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useMinMd } from '@/hooks/useMinMd'
import { useScrollToSection } from '@/hooks/useScrollToSection'
import heroBackground from '@/assets/baground.jpeg'

const MicrophoneModel = lazy(() => import('@/components/3d/MicrophoneModel'))

export function HeroSection() {
  const reduce = useReducedMotion()
  const minMd = useMinMd()
  const wrap = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const glowPending = useRef<{ x: number; y: number } | null>(null)
  const glowRaf = useRef(0)
  const scrollTo = useScrollToSection()

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
      className="relative isolate min-h-0 overflow-x-hidden overflow-y-hidden pb-10 pt-20 max-md:flex max-md:min-h-[100svh] max-md:flex-col max-md:pb-[max(1.25rem,env(safe-area-inset-bottom))] max-md:pt-[calc(4rem+env(safe-area-inset-top))] md:h-[100svh] md:max-h-[100svh] md:overflow-x-visible md:overflow-y-hidden md:pb-16 md:pt-24"
    >
      <div className="pointer-events-none absolute inset-0 -z-20 overflow-hidden">
        <div
          className="absolute left-0 top-[-20%] h-[140%] w-full origin-center scale-[1.06] transform-gpu bg-cover bg-center opacity-[0.35]"
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

      <div className="relative mx-auto flex min-h-0 max-w-6xl flex-1 flex-col overflow-x-hidden px-4 pb-6 pt-3 max-md:min-h-0 sm:px-6 md:h-full md:flex-none md:overflow-visible md:px-6 md:pb-10 md:pt-8 lg:px-8">
          <div className="relative z-20 flex w-full max-w-2xl shrink-0 flex-col max-md:mx-auto max-md:max-w-lg max-md:flex-1 max-md:items-center max-md:text-center max-md:min-h-0 sm:max-w-xl md:max-w-[min(34rem,40%)] md:flex-none md:items-start md:text-left lg:max-w-[min(36rem,38%)]">
          <div className="flex w-full flex-col max-md:flex-1 max-md:min-h-0 md:block">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex w-fit max-w-full items-center gap-1.5 rounded-full border border-white/[0.12] bg-white/[0.05] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-200 backdrop-blur-md max-md:mx-auto max-md:shrink-0 sm:gap-2 sm:px-3.5 sm:text-[11px] sm:tracking-[0.24em] md:self-start"
          >
            <Sparkles className="size-3.5 text-accent-gold" aria-hidden />
            Студия звука · Санкт-Петербург
          </motion.div>
          <div className="flex flex-col max-md:flex-1 max-md:min-h-0 max-md:justify-center max-md:items-center max-md:py-3 md:block md:py-0">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 max-md:mt-0 text-balance text-center font-display text-[1.75rem] font-black leading-[1.08] tracking-[-0.02em] text-white drop-shadow-[0_4px_48px_rgba(0,0,0,0.55)] sm:text-4xl sm:leading-[1.02] sm:tracking-[-0.025em] md:mt-7 md:text-left md:text-[3.35rem] md:leading-[1.02] md:tracking-[-0.03em]"
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
            className="mt-3 max-w-[34rem] text-balance text-center text-[0.9375rem] font-normal leading-[1.62] tracking-[-0.008em] text-zinc-300/90 sm:mt-4 sm:text-base sm:leading-[1.68] md:mt-6 md:text-left md:text-[1.0625rem] md:leading-[1.68] md:text-zinc-300/95"
          >
            <span className="md:hidden">
              Персональные занятия в Петербурге: опора, микрофон, сцена. Без
              пустых обещаний вроде «чудо за три встречи».
            </span>
            <span className="hidden md:inline">
              Echovox, небольшая вокальная студия в Петербурге. На занятиях
              работаем над тем, чтобы голос держался, звучал в микрофоне и не
              терялся на выступлении. Занятия один на один, без обещаний «чудо за
              три встречи».
            </span>
          </motion.p>
          </div>
          </div>

          <div className="max-md:mt-auto max-md:flex max-md:w-full max-md:max-w-md max-md:flex-col max-md:items-center max-md:gap-5 max-md:pt-6 md:contents">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 flex w-full max-w-md flex-col gap-3 sm:mt-7 md:mt-8 md:max-w-none md:flex-row md:flex-wrap md:items-center md:gap-3"
          >
            <Button
              size="lg"
              type="button"
              className="min-h-12 w-full px-4 text-sm sm:min-h-12 sm:px-8 sm:text-base md:min-h-12 md:w-auto md:flex-none md:px-8"
              onClick={() => scrollTo('#contact')}
            >
              Записаться
            </Button>
            <Button
              variant="secondary"
              size="lg"
              type="button"
              className="min-h-12 w-full px-4 text-sm sm:min-h-12 sm:px-8 sm:text-base md:min-h-12 md:w-auto md:flex-none md:px-8"
              onClick={() => scrollTo('#about')}
            >
              Узнать подход
            </Button>
          </motion.div>

          <div className="flex w-full max-w-md flex-wrap justify-center gap-2 mt-6 max-md:mt-0 md:mt-4 md:max-w-none md:justify-start">
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
          </div>
      </div>

      {minMd ? (
        <div className="pointer-events-none absolute inset-x-0 left-0 right-0 top-0 bottom-0 z-10 min-h-0 w-full overflow-x-visible overflow-y-hidden">
          <Suspense
            fallback={
              <div
                className="absolute inset-y-0 left-auto right-0 h-full min-h-0 w-[min(66vw,56rem)] max-w-none translate-x-3 translate-y-10 animate-pulse rounded-none bg-white/[0.03] max-lg:right-0 max-lg:w-[min(60vw,48rem)] max-lg:translate-x-1 max-lg:translate-y-8 lg:right-0 lg:w-[min(64vw,54rem)] lg:translate-x-4 lg:translate-y-14"
                aria-hidden
              />
            }
          >
            <MicrophoneModel reducedMotion={Boolean(reduce)} />
          </Suspense>
        </div>
      ) : null}
    </section>
  )
}
