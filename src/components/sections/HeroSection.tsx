import { lazy, Suspense, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { MapPin, Sparkles, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  useSplashDismissed,
  useSplashMicSignal,
} from '@/context/SplashGateContext'
import { useScrollToSection } from '@/hooks/useScrollToSection'
import heroBackground from '@/assets/baground.jpeg'

const MicrophoneModel = lazy(() => import('@/components/3d/MicrophoneModel'))

const micAreaSkeleton = (
  <div
    className="absolute inset-0 z-0 overflow-visible"
    aria-hidden
  >
    <div className="mx-auto mt-[min(20vh,7.5rem)] h-[min(58vh,29rem)] w-full max-w-[38rem] bg-[radial-gradient(ellipse_at_50%_72%,rgba(9,9,12,0.28)_0%,transparent_68%)] sm:mt-[min(22vh,8.5rem)] sm:h-[min(60vh,31rem)] sm:max-w-[40rem] lg:absolute lg:inset-y-0 lg:right-0 lg:left-auto lg:mx-0 lg:mt-0 lg:h-full lg:min-h-0 lg:w-[min(78vw,58rem)] lg:max-w-full lg:bg-gradient-to-l lg:from-studio-bg lg:from-[28%] lg:via-studio-bg/93 lg:via-[50%] lg:to-transparent" />
  </div>
)

export function HeroSection() {
  const reduce = useReducedMotion()
  const splashDismissed = useSplashDismissed()
  const signalSplashMic = useSplashMicSignal()
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
      className="relative isolate w-full min-w-0 overflow-x-hidden pb-10 pt-20 max-md:flex max-md:min-h-[100svh] max-md:flex-col max-md:overflow-x-hidden max-md:pb-[max(1.25rem,env(safe-area-inset-bottom))] max-md:pt-[calc(4rem+env(safe-area-inset-top))] md:h-[100svh] md:max-h-[100svh] md:overflow-hidden md:pb-0 md:pt-20 lg:pt-24"
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

      {splashDismissed ? (
        <div className="absolute inset-0 z-0 min-h-0 w-full overflow-hidden">
          <Suspense fallback={micAreaSkeleton}>
            <MicrophoneModel
              reducedMotion={Boolean(reduce)}
              onSplashSceneReady={() => signalSplashMic?.()}
            />
          </Suspense>
        </div>
      ) : null}

      <div className="relative z-20 mx-auto flex h-full min-h-0 w-full min-w-0 max-w-5xl flex-1 flex-col justify-start overflow-hidden px-4 pb-6 pt-3 max-md:h-auto max-md:min-h-0 max-md:overflow-x-hidden sm:px-6 md:h-full md:max-h-full md:max-w-6xl md:flex-none md:px-6 md:pb-8 md:pt-6 max-lg:items-center lg:items-start lg:justify-center lg:px-8 pointer-events-none xl:max-w-[min(100%,76rem)] 2xl:max-w-[min(100%,82rem)]">
          <div className="relative flex w-full min-w-0 shrink-0 flex-col gap-6 max-lg:mx-auto max-lg:max-w-lg max-lg:min-h-0 max-lg:flex-1 max-lg:gap-4 max-lg:text-center lg:h-auto lg:max-w-[30rem] lg:gap-6 lg:self-start lg:py-0 lg:text-left xl:max-w-[36rem] xl:gap-8 2xl:max-w-[42rem] 2xl:gap-9 pointer-events-auto">
          <div className="flex min-h-0 w-full min-w-0 flex-col max-lg:flex-1 max-lg:min-h-0 lg:min-h-0">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex w-fit max-w-full items-center gap-1.5 rounded-full border border-white/[0.12] bg-white/[0.05] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-200 backdrop-blur-md max-lg:mx-auto max-lg:shrink-0 sm:gap-2 sm:px-3.5 sm:text-[11px] sm:tracking-[0.24em] lg:self-start xl:gap-2 xl:px-4 xl:py-2 xl:text-xs xl:tracking-[0.22em]"
          >
            <Sparkles className="size-3.5 text-accent-gold" aria-hidden />
            Студия звука · Санкт-Петербург
          </motion.div>
          <div className="flex flex-col max-lg:flex-1 max-lg:min-h-0 max-lg:justify-center max-lg:items-center max-lg:py-3 lg:block lg:py-0">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 max-lg:mt-0 text-balance text-center font-display text-[1.75rem] font-black leading-[1.08] tracking-[-0.02em] text-white drop-shadow-[0_4px_48px_rgba(0,0,0,0.55)] sm:text-4xl sm:leading-[1.02] sm:tracking-[-0.025em] lg:mt-4 lg:text-left lg:text-[clamp(1.65rem,1.2vw+1.25rem,3.35rem)] lg:leading-[1.06] lg:tracking-[-0.026em] xl:text-[clamp(1.85rem,1.35vw+1.05rem,3.5rem)] xl:leading-[1.05] 2xl:text-[clamp(2.05rem,1.05vw+1.2rem,3.85rem)] 2xl:leading-[1.03]"
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
            className="mt-3 max-w-[34rem] text-balance text-center text-[0.9375rem] font-normal leading-[1.62] tracking-[-0.008em] text-zinc-300/90 sm:mt-4 sm:text-base sm:leading-[1.68] lg:mt-4 lg:max-w-none lg:text-left lg:text-[clamp(0.8125rem,0.22vw+0.78rem,1.05rem)] lg:leading-[1.55] lg:text-zinc-300/95 xl:text-[clamp(0.875rem,0.15vw+0.82rem,1.1rem)] 2xl:text-[clamp(0.92rem,0.1vw+0.85rem,1.15rem)] 2xl:leading-[1.56]"
          >
            <span className="lg:hidden">
              Персональные занятия в Петербурге: опора, микрофон, сцена. Без
              пустых обещаний вроде «чудо за три встречи».
            </span>
            <span className="hidden lg:inline">
              Echovox, небольшая вокальная студия в Петербурге. На занятиях
              работаем над тем, чтобы голос держался, звучал в микрофоне и не
              терялся на выступлении. Занятия один на один, без обещаний «чудо за
              три встречи».
            </span>
          </motion.p>
          </div>
          </div>

          <div className="flex w-full min-w-0 shrink-0 flex-col gap-4 pt-4 max-lg:mx-auto lg:gap-3 lg:pt-3 xl:gap-5 xl:pt-4 2xl:gap-6 2xl:pt-5">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="flex w-full min-w-0 flex-col gap-3 sm:gap-3 max-lg:flex-col max-lg:items-stretch max-lg:gap-2.5 lg:flex-row lg:flex-wrap lg:items-center lg:gap-3 pointer-events-auto xl:flex-nowrap"
          >
            <Button
              size="lg"
              type="button"
              className="min-h-11 w-full shrink-0 px-4 text-sm sm:min-h-12 sm:px-8 sm:text-base max-lg:min-h-11 max-lg:w-full max-lg:px-6 max-lg:text-[clamp(0.8125rem,0.15vw+0.78rem,0.9375rem)] lg:w-auto lg:min-h-12 lg:min-w-0 lg:flex-1 lg:px-6 xl:min-h-[3.15rem] xl:min-w-[9.5rem] xl:px-8 xl:text-[clamp(0.875rem,0.1vw+0.82rem,1rem)] xl:flex-none 2xl:min-h-14 2xl:px-9 2xl:text-lg"
              onClick={() => scrollTo('#contact')}
            >
              Записаться
            </Button>
            <Button
              variant="secondary"
              size="lg"
              type="button"
              className="min-h-11 w-full shrink-0 px-4 text-sm sm:min-h-12 sm:px-8 sm:text-base max-lg:min-h-11 max-lg:w-full max-lg:px-6 max-lg:text-[clamp(0.8125rem,0.15vw+0.78rem,0.9375rem)] lg:w-auto lg:min-h-12 lg:min-w-0 lg:flex-1 lg:px-6 xl:min-h-[3.15rem] xl:min-w-[9.5rem] xl:px-8 xl:text-[clamp(0.875rem,0.1vw+0.82rem,1rem)] xl:flex-none 2xl:min-h-14 2xl:px-9 2xl:text-lg"
              onClick={() => scrollTo('#about')}
            >
              Узнать подход
            </Button>
          </motion.div>

          <div className="flex w-full min-w-0 flex-wrap justify-center gap-2 lg:justify-start lg:gap-x-2 lg:gap-y-2 xl:gap-x-2.5 xl:gap-y-2.5 pointer-events-auto [&>span]:text-[clamp(0.6875rem,0.12vw+0.65rem,0.75rem)] lg:[&>span]:text-xs xl:[&>span]:text-[clamp(0.75rem,0.08vw+0.68rem,0.8125rem)]">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-400 xl:gap-2 xl:px-3.5 xl:py-2">
              <User className="size-3.5 text-zinc-500" aria-hidden />
              Индивидуально
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-400 xl:gap-2 xl:px-3.5 xl:py-2">
              <Sparkles className="size-3.5 text-zinc-500" aria-hidden />
              С нуля или с опытом
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-400 xl:gap-2 xl:px-3.5 xl:py-2">
              <MapPin className="size-3.5 text-zinc-500" aria-hidden />
              Санкт-Петербург
            </span>
          </div>
          </div>
          </div>
      </div>
    </section>
  )
}
