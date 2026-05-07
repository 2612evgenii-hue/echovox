import { useEffect, useId, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import logo from '@/assets/logo.jpg'

/** Минимум показа плавного сплэша. По таймеру — `onTimerElapsed` (слой «Загрузка»), затем exit шторы. */
const DISPLAY_MS = 4400
const CURTAIN_DURATION_S = 1.35

const RING_COUNT = 6
/** Длительность одного цикла кольца (синхрон с `index.css` `.echovox-splash-sub-ring`). */
const RING_CYCLE_S = 5.5

function SubwooferRings({
  reduce,
  gradientStrokeId,
}: {
  reduce: boolean
  gradientStrokeId: string
}) {
  return (
    <div
      className="echovox-splash-ring-stage pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      aria-hidden
    >
      {/* Блум: один CSS-blur на всём SVG вместо feGaussianBlur на каждом круге (дешевле по GPU) */}
      <svg
        className="echovox-splash-sub-bloom absolute left-1/2 top-1/2 h-[min(120vmin,640px)] w-[min(120vmin,640px)] -translate-x-1/2 -translate-y-1/2 overflow-visible opacity-[0.55]"
        viewBox="0 0 200 200"
        aria-hidden
      >
        {!reduce &&
          Array.from({ length: RING_COUNT }, (_, i) => (
            <circle
              key={`bloom-${i}`}
              cx="100"
              cy="100"
              r="30"
              fill="none"
              stroke="rgba(167, 139, 250, 0.26)"
              strokeWidth="2.2"
              vectorEffect="nonScalingStroke"
              className="echovox-splash-sub-ring echovox-splash-sub-ring-bloom"
              style={{
                animationDelay: `${(i * RING_CYCLE_S) / RING_COUNT}s`,
              }}
            />
          ))}
      </svg>

      <svg
        className="absolute left-1/2 top-1/2 h-[min(120vmin,640px)] w-[min(120vmin,640px)] -translate-x-1/2 -translate-y-1/2 overflow-visible"
        viewBox="0 0 200 200"
      >
        <defs>
          <radialGradient id={gradientStrokeId} cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#f5f3ff" stopOpacity="0.38" />
            <stop offset="38%" stopColor="#c4b5fd" stopOpacity="0.32" />
            <stop offset="72%" stopColor="#a78bfa" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#b45309" stopOpacity="0.1" />
          </radialGradient>
        </defs>
        {Array.from(
          { length: reduce ? 2 : RING_COUNT },
          (_, i) => i,
        ).map((i) => (
          <circle
            key={i}
            cx="100"
            cy="100"
            r="28"
            fill="none"
            stroke={`url(#${gradientStrokeId})`}
            strokeWidth="0.55"
            strokeLinecap="round"
            vectorEffect="nonScalingStroke"
            className={
              reduce
                ? i === 0
                  ? 'opacity-[0.14] echovox-splash-sub-ring-static-a'
                  : 'opacity-[0.08] echovox-splash-sub-ring-static-b'
                : 'echovox-splash-sub-ring'
            }
            style={
              reduce
                ? undefined
                : {
                    animationDelay: `${(i * RING_CYCLE_S) / RING_COUNT}s`,
                  }
            }
          />
        ))}
      </svg>
    </div>
  )
}

type SplashPreloaderProps = {
  onDismissComplete?: () => void
  /** Вызывается в тот же тик, когда истёк таймер, до начала exit-анимации сплэша — сюда монтируют слой «Загрузка» под сплэшем. */
  onTimerElapsed?: () => void
}

export function SplashPreloader({
  onDismissComplete,
  onTimerElapsed,
}: SplashPreloaderProps) {
  const reduce = useReducedMotion()
  const [visible, setVisible] = useState(true)
  const [timerDone, setTimerDone] = useState(false)
  const ringGradId = `splash-ring-${useId().replace(/:/g, '')}`

  useEffect(() => {
    if (reduce) {
      const t = window.setTimeout(() => setTimerDone(true), 520)
      return () => window.clearTimeout(t)
    }
    const t = window.setTimeout(() => setTimerDone(true), DISPLAY_MS)
    return () => window.clearTimeout(t)
  }, [reduce])

  useEffect(() => {
    if (!timerDone) return
    onTimerElapsed?.()
    setVisible(false)
  }, [timerDone, onTimerElapsed])

  useEffect(() => {
    if (!visible) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [visible])

  const exitTransition = reduce
    ? { duration: 0.4, ease: [0.45, 0, 0.2, 1] as const }
    : {
        duration: CURTAIN_DURATION_S,
        ease: [0.45, 0, 0.2, 1] as const,
      }

  const easeSoft = [0.45, 0, 0.2, 1] as const

  return (
    <AnimatePresence
      mode="wait"
      onExitComplete={() => {
        onDismissComplete?.()
      }}
    >
      {visible ? (
        <motion.div
          key="splash"
          className="pointer-events-auto fixed inset-0 z-[560] flex flex-col overflow-hidden bg-[#030304] transform-gpu contain-[layout_paint]"
          initial={false}
          exit={
            reduce
              ? { opacity: 0, transition: exitTransition }
              : { y: '-100%', transition: exitTransition }
          }
          aria-hidden
          role="presentation"
        >
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_85%_at_50%_52%,#1a1922_0%,#0c0b0f_38%,#030304_68%,#010102_100%)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_40%_at_50%_45%,rgba(91,33,182,0.11)_0%,rgba(3,3,4,0)_65%)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-violet-950/[0.08] via-transparent to-black/50"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black/70 via-black/20 to-transparent"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              backgroundSize: '200px 200px',
            }}
            aria-hidden
          />

          <motion.div
            className="relative min-h-0 w-full flex-1 px-4 sm:px-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: reduce ? 0.12 : 0.85,
              ease: easeSoft,
              delay: reduce ? 0 : 0.04,
            }}
          >
            <div className="absolute inset-0">
              {/*
                < sm: колонка по центру — подпись сразу под лого, не уезжает за край.
                sm+: как раньше — лого в центре вьюпорта, подпись по absolute под центром.
              */}
              <div className="relative flex h-full w-full flex-col items-center justify-center sm:block">
                <div className="relative z-10 flex shrink-0 justify-center sm:absolute sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2">
                  <div className="relative inline-flex">
                    <SubwooferRings
                      reduce={!!reduce}
                      gradientStrokeId={ringGradId}
                    />

                    <motion.div
                      className="relative z-10 flex flex-col items-center"
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        delay: reduce ? 0 : 0.1,
                        duration: 0.75,
                        ease: easeSoft,
                      }}
                    >
                      <div className="pointer-events-none absolute -inset-10 rounded-full bg-[radial-gradient(ellipse_80%_80%_at_50%_40%,rgba(120,80,200,0.2)_0%,rgba(40,30,60,0.08)_40%,transparent_70%)] blur-3xl" />
                      <div className="pointer-events-none absolute -inset-3 rounded-2xl bg-gradient-to-b from-white/[0.08] via-transparent to-black/30 opacity-80 blur-sm" />
                      <img
                        src={logo}
                        alt=""
                        width={160}
                        height={160}
                        decoding="async"
                        fetchPriority="high"
                        className="relative h-[4.5rem] w-[4.5rem] rounded-xl border border-white/[0.12] border-t-white/20 object-cover shadow-[0_1px_0_rgba(255,255,255,0.1)_inset,0_2px_4px_rgba(0,0,0,0.4)_inset,0_8px_32px_rgba(0,0,0,0.5),0_32px_64px_rgba(0,0,0,0.55),0_0_48px_rgba(91,33,182,0.12)] sm:h-[5rem] sm:w-[5rem]"
                      />
                    </motion.div>
                  </div>
                </div>

                <motion.div
                  className="relative z-10 mt-9 w-full max-w-sm shrink-0 px-1 text-center sm:absolute sm:left-1/2 sm:top-[calc(50%+2.5rem+2.5rem)] sm:mt-0 sm:max-w-sm sm:-translate-x-1/2 sm:px-0"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: reduce ? 0 : 0.28,
                    duration: 0.7,
                    ease: easeSoft,
                  }}
                >
                  <p className="font-display text-[11px] font-semibold uppercase tracking-[0.42em] text-zinc-400">
                    Echovox
                  </p>
                  <p className="mt-2.5 text-[10px] font-medium uppercase tracking-[0.28em] text-zinc-600">
                    vocal studio
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
