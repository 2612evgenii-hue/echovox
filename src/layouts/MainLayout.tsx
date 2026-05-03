import { useCallback, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'

export type MainLayoutOutletContext = {
  setNewsNavVisible: (visible: boolean) => void
}

export function MainLayout() {
  const location = useLocation()
  const [newsNavVisibleState, setNewsNavVisibleState] = useState(false)

  const setNewsNavVisible = useCallback((visible: boolean) => {
    setNewsNavVisibleState(visible)
  }, [])

  const newsNavVisible =
    location.pathname === '/' && newsNavVisibleState

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader showNewsNav={newsNavVisible} />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
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
  )
}
