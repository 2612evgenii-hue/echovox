import { useEffect, useMemo, useRef, type RefObject } from 'react'
import { useReducedMotion } from 'framer-motion'
import { supportsScrollTimeline } from '@/lib/supportsScrollTimeline'

const STAR_COUNT = 18

function useFallbackScrollLayers(
  active: boolean,
  sweepRef: RefObject<HTMLDivElement | null>,
  washRef: RefObject<HTMLDivElement | null>,
) {
  useEffect(() => {
    if (!active) return

    const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t)
    const lerp = (y: number, y0: number, y1: number, v0: number, v1: number) => {
      const t = clamp01((y - y0) / (y1 - y0))
      return v0 + t * (v1 - v0)
    }

    const piecewiseOpacity = (scrollY: number) => {
      const y = Math.max(0, scrollY)
      if (y <= 600) return lerp(y, 0, 600, 0.35, 0.75)
      if (y <= 1800) return lerp(y, 600, 1800, 0.75, 0.65)
      if (y <= 3200) return lerp(y, 1800, 3200, 0.65, 0.55)
      if (y <= 4500) return lerp(y, 3200, 4500, 0.55, 0.4)
      return 0.4
    }

    let raf = 0
    const apply = () => {
      raf = 0
      const y = Math.max(0, window.scrollY)
      const sweep = sweepRef.current
      const wash = washRef.current

      if (sweep) {
        const ty = y >= 4200 ? 620 : lerp(y, 0, 4200, -140, 620)
        const rot = y >= 4200 ? 4.5 : lerp(y, 0, 4200, -2.5, 4.5)
        sweep.style.transform = `translate3d(0,${ty}px,0) rotate(${rot}deg)`
        sweep.style.opacity = String(piecewiseOpacity(y))
      }
      if (wash) {
        const wy = y >= 4000 ? -280 : lerp(y, 0, 4000, 120, -280)
        wash.style.transform = `translate3d(0,${wy}px,0)`
      }
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
  }, [active, sweepRef, washRef])
}

function useStars() {
  return useMemo(
    () =>
      Array.from({ length: STAR_COUNT }, (_, i) => {
        const left = ((i * 19.3 + 7.1) % 96) + 1
        const top = ((i * 27.7 + 3.8) % 91) + 2
        const sizePx = i % 5 === 0 ? 2 : 1
        const duration = 2.2 + (i % 5) * 0.45
        const delay = (i * 0.14) % 2.8
        return { left, top, sizePx, duration, delay, key: i }
      }),
    [],
  )
}

/**
 * Туман статичен по скроллу. «Световая волна» привязана к прокрутке:
 * в современных браузерах — CSS scroll-timeline (композитор, без лишнего JS);
 * иначе — один requestAnimationFrame на кадр, без Framer useScroll.
 */
export function AtmosphericBackdrop() {
  const reduce = useReducedMotion()
  const staticMode = !!reduce
  const cssScroll = useMemo(() => supportsScrollTimeline(), [])
  const sweepRef = useRef<HTMLDivElement>(null)
  const washRef = useRef<HTMLDivElement>(null)

  useFallbackScrollLayers(!staticMode && !cssScroll, sweepRef, washRef)

  const stars = useStars()

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-studio-bg"
    >
      <div className="absolute inset-0 bg-[radial-gradient(145%_95%_at_50%_112%,rgba(76,29,149,0.16)_0%,transparent_72%)] blur-[3px]" />
      <div className="absolute inset-0 bg-[radial-gradient(125%_78%_at_50%_-8%,rgba(109,40,217,0.09)_0%,transparent_62%)] blur-[4px]" />
      <div className="absolute inset-0 bg-[radial-gradient(95%_62%_at_18%_45%,rgba(139,92,246,0.055)_0%,transparent_52%)] blur-[5px]" />
      <div className="absolute inset-0 bg-[radial-gradient(88%_55%_at_82%_38%,rgba(251,191,36,0.045)_0%,transparent_52%)] blur-[6px]" />

      <div className="echovox-violet-drift" />
      <div className="echovox-aurora" />

      <div className="absolute inset-[-8%]">
        <div className="absolute -left-[22%] top-[4%] h-[min(95vw,48rem)] w-[min(95vw,48rem)]">
          <div
            className="h-full w-full rounded-[45%] bg-violet-700/[0.065] blur-[100px] motion-reduce:opacity-90 md:blur-[130px]"
            style={
              staticMode
                ? undefined
                : { animation: 'echovox-blob 22s ease-in-out infinite' }
            }
          />
        </div>
        <div className="absolute -right-[18%] top-[30%] h-[min(80vw,40rem)] w-[min(80vw,40rem)]">
          <div
            className="h-full w-full rounded-[48%] bg-amber-200/[0.045] blur-[95px] motion-reduce:opacity-90 md:blur-[125px]"
            style={
              staticMode
                ? undefined
                : {
                    animation: 'echovox-blob 30s ease-in-out infinite',
                    animationDelay: '-6s',
                  }
            }
          />
        </div>
        <div className="absolute bottom-[-14%] left-[16%] h-[min(72vw,34rem)] w-[min(72vw,34rem)]">
          <div
            className="h-full w-full rounded-[42%] bg-fuchsia-950/[0.055] blur-[100px] motion-reduce:opacity-90 md:blur-[130px]"
            style={
              staticMode
                ? undefined
                : {
                    animation: 'echovox-blob 26s ease-in-out infinite',
                    animationDelay: '-3s',
                  }
            }
          />
        </div>
      </div>

      <div className="absolute inset-0">
        {stars.map((s) => (
          <span
            key={s.key}
            className={`absolute rounded-full bg-white/80 shadow-[0_0_3px_rgba(196,181,253,0.35)] ${
              staticMode ? 'opacity-[0.28]' : ''
            }`}
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: s.sizePx,
              height: s.sizePx,
              ...(staticMode
                ? {}
                : {
                    animation: `star-twinkle ${s.duration}s ease-in-out infinite`,
                    animationDelay: `${s.delay}s`,
                  }),
            }}
          />
        ))}
      </div>

      {!staticMode ? (
        <>
          <div
            ref={sweepRef}
            className={`pointer-events-none absolute inset-x-[-35%] top-[-20%] z-[2] h-[85vh] origin-center ${
              cssScroll ? 'echovox-sweep-scroll' : ''
            }`}
          >
            <div
              className="h-full w-full blur-[56px] md:blur-[72px]"
              style={{
                background:
                  'linear-gradient(102deg, transparent 0%, rgba(139,92,246,0.14) 28%, rgba(251,191,36,0.1) 48%, rgba(56,189,248,0.09) 62%, transparent 85%)',
              }}
            />
          </div>
          <div
            ref={washRef}
            className={`pointer-events-none absolute inset-x-[-20%] bottom-[-30%] z-[2] h-[55vh] origin-center opacity-[0.48] mix-blend-screen ${
              cssScroll ? 'echovox-wash-scroll' : ''
            }`}
          >
            <div
              className="h-full w-full blur-[44px] md:blur-[58px]"
              style={{
                background:
                  'radial-gradient(ellipse 70% 55% at 50% 40%, rgba(167,139,250,0.14), transparent 72%)',
              }}
            />
          </div>
        </>
      ) : null}

      {/* лёгкое общее затемнение декора (в т.ч. световой волны по скроллу) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[2] bg-black/[0.2]"
      />

      <div className="echovox-grain" />

      <div className="absolute inset-0 z-[5] bg-[radial-gradient(ellipse_165%_125%_at_50%_50%,transparent_0%,rgba(9,9,11,0.06)_40%,rgba(9,9,11,0.28)_76%,rgba(9,9,11,0.9)_100%)]" />
    </div>
  )
}
