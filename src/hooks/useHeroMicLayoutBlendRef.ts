import { useEffect, useRef } from 'react'

/**
 * 0 = узкая раскладка (центр), 1 = широкая (микрофон справа).
 * Плавное следование за шириной окна между BLEND_MIN и BLEND_MAX (вокруг lg 1024).
 */
const BLEND_MIN = 992
const BLEND_MAX = 1064
const SMOOTH = 0.16

function widthToTargetBlend(w: number): number {
  if (w <= BLEND_MIN) return 0
  if (w >= BLEND_MAX) return 1
  return (w - BLEND_MIN) / (BLEND_MAX - BLEND_MIN)
}

export function useHeroMicLayoutBlendRef() {
  const ref = useRef(
    typeof window !== 'undefined' ? widthToTargetBlend(window.innerWidth) : 0,
  )

  useEffect(() => {
    let raf = 0

    const step = () => {
      const target = widthToTargetBlend(window.innerWidth)
      ref.current += (target - ref.current) * SMOOTH
      if (Math.abs(target - ref.current) < 0.004) {
        ref.current = target
        return
      }
      raf = requestAnimationFrame(step)
    }

    const kick = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(step)
    }

    ref.current = widthToTargetBlend(window.innerWidth)
    kick()
    window.addEventListener('resize', kick, { passive: true })

    return () => {
      window.removeEventListener('resize', kick)
      cancelAnimationFrame(raf)
    }
  }, [])

  return ref
}
