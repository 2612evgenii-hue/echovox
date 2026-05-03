import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useScrollToSection } from '@/hooks/useScrollToSection'

const HERO_IMG =
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=2000&q=80'

export function HeroSection() {
  const wrap = useRef<HTMLDivElement>(null)
  const [spot, setSpot] = useState({ x: 50, y: 35 })
  const scrollTo = useScrollToSection()

  const onMove = (e: React.PointerEvent) => {
    const el = wrap.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width) * 100
    const y = ((e.clientY - r.top) / r.height) * 100
    setSpot({
      x: Math.min(100, Math.max(0, x)),
      y: Math.min(100, Math.max(0, y)),
    })
  }

  return (
    <section
      ref={wrap}
      onPointerMove={onMove}
      className="relative isolate min-h-[100svh] overflow-hidden pt-24"
    >
      <div
        className="absolute inset-0 -z-20 bg-cover bg-center opacity-[0.35]"
        style={{ backgroundImage: `url(${HERO_IMG})` }}
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-studio-bg/20 via-studio-bg/85 to-studio-bg" />
      <div className="absolute inset-0 -z-10 bg-radial-glow" />
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.22]"
        style={{
          background: `radial-gradient(600px circle at ${spot.x}% ${spot.y}%, rgba(139,92,246,0.55), transparent 55%)`,
        }}
      />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid-white bg-[length:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />

      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 pb-20 pt-10 sm:px-6 md:flex-row md:items-end md:justify-between md:pb-24 md:pt-16">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-zinc-300 backdrop-blur-md"
          >
            <Sparkles className="size-3.5 text-accent-gold" aria-hidden />
            Студия звука · Санкт-Петербург
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 font-display text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl"
          >
            Голос, который{' '}
            <span className="text-gradient">заполняет пространство</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg"
          >
            Echovox — вокальная школа с атмосферой студии: дыхание, опора,
            артикуляция и сценическая подача. Индивидуально, бережно, до
            результата, который слышно в зале.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Button size="lg" type="button" onClick={() => scrollTo('#contact')}>
              Записаться
            </Button>
            <Button
              variant="secondary"
              size="lg"
              type="button"
              onClick={() => scrollTo('#about')}
            >
              Узнать подход
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="glass relative w-full max-w-md rounded-3xl p-5 sm:p-6"
        >
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent-violet/30 blur-3xl" />
          <div className="absolute -bottom-12 -left-8 h-44 w-44 rounded-full bg-accent-gold/15 blur-3xl" />
          <p className="text-sm font-semibold text-white">Сергей</p>
          <p className="mt-1 text-sm text-zinc-400">
            Связь напрямую:{' '}
            <a
              className="font-medium text-accent-gold hover:underline"
              href="tel:+79042313359"
            >
              8 904 231 33 59
            </a>
          </p>
          <div className="mt-4 grid gap-3 text-sm text-zinc-300">
            <div className="rounded-2xl border border-white/5 bg-black/30 px-4 py-3">
              Индивидуальные занятия · подготовка к выступлениям
            </div>
            <div className="rounded-2xl border border-white/5 bg-black/30 px-4 py-3">
              Разбор репертуара · микрофонная техника
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
