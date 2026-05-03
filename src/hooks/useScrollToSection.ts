import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export type ScrollToSectionOptions = {
  /** Задержка перед скроллом (мс), например после анимации закрытия мобильного меню */
  menuCloseDelayMs?: number
}

/** Плавный скролл к секции по якорю `#id` — совместимо с React Router и фиксированным хедером. */
export function useScrollToSection() {
  const location = useLocation()
  const navigate = useNavigate()

  return useCallback(
    (href: string, options?: ScrollToSectionOptions) => {
      if (!href.startsWith('#')) return
      const id = href.slice(1)
      const delay = options?.menuCloseDelayMs ?? 0

      const scroll = () => {
        const el = document.getElementById(id)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
        if (location.pathname === '/') {
          window.history.replaceState(null, '', href)
        }
      }

      if (location.pathname !== '/') {
        navigate({ pathname: '/', hash: href })
        window.setTimeout(scroll, 140)
        return
      }

      if (delay > 0) {
        window.setTimeout(scroll, delay)
      } else {
        scroll()
      }
    },
    [location.pathname, navigate],
  )
}
