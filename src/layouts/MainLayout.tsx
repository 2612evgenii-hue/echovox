import { useCallback, useLayoutEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useBootRevealSuppressIntro } from '@/context/SplashGateContext'
import { AtmosphericBackdrop } from '@/components/layout/AtmosphericBackdrop'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'

export type MainLayoutOutletContext = {
  setNewsNavVisible: (visible: boolean) => void
}

export function MainLayout() {
  const location = useLocation()
  const suppressIntro = useBootRevealSuppressIntro()
  const [newsNavVisibleState, setNewsNavVisibleState] = useState(false)

  const setNewsNavVisible = useCallback((visible: boolean) => {
    setNewsNavVisibleState(visible)
  }, [])

  const newsNavVisible =
    location.pathname === '/' && newsNavVisibleState

  useLayoutEffect(() => {
    if (location.hash) return
    window.scrollTo(0, 0)
  }, [location.pathname, location.hash])

  return (
    <div className="relative min-h-screen">
      <AtmosphericBackdrop />
      <div className="relative z-10 flex min-h-screen min-w-0 flex-col overflow-x-hidden">
        <SiteHeader showNewsNav={newsNavVisible} />
        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname}
            initial={suppressIntro ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1"
          >
            <Outlet context={{ setNewsNavVisible }} />
          </motion.main>
        </AnimatePresence>
        <SiteFooter />
      </div>
    </div>
  )
}
