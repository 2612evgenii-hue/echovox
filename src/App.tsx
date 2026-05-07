import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'sonner'
import {
  BootRevealContext,
  SplashDismissedContext,
  SplashMicSignalContext,
} from '@/context/SplashGateContext'
import { AssetLoadingOverlay } from '@/components/layout/AssetLoadingOverlay'
import { SplashPreloader } from '@/components/layout/SplashPreloader'
import { MainLayout } from '@/layouts/MainLayout'
import { HomePage } from '@/pages/HomePage'
import { prefetchHeroMicrophoneModel } from '@/lib/prefetchHeroMic'

const AdminPage = lazy(() =>
  import('@/pages/AdminPage').then((m) => ({ default: m.AdminPage })),
)

export default function App() {
  const { pathname } = useLocation()
  /** Таймер сплэша — монтируем слой «Загрузка» под сплэшем (WebGL ещё не трогаем). */
  const [bootGateOpen, setBootGateOpen] = useState(false)
  /** Exit-анимация сплэша полностью закончилась — можно монтировать Three.js без рывков шторы. */
  const [splashExitComplete, setSplashExitComplete] = useState(false)
  const [heroMicReady, setHeroMicReady] = useState(false)

  const signalHeroMicReady = useCallback(() => {
    setHeroMicReady(true)
  }, [])

  const onSplashTimerElapsed = useCallback(() => {
    flushSync(() => {
      setBootGateOpen(true)
    })
  }, [])

  useEffect(() => {
    if (pathname !== '/') return
    const t = window.setTimeout(() => setHeroMicReady(true), 28000)
    return () => window.clearTimeout(t)
  }, [pathname])

  useEffect(() => {
    let cancelled = false
    const run = () => {
      if (!cancelled) prefetchHeroMicrophoneModel()
    }
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(run, { timeout: 2600 })
      return () => {
        cancelled = true
        window.cancelIdleCallback(id)
      }
    }
    const t = window.setTimeout(run, 1600)
    return () => {
      cancelled = true
      window.clearTimeout(t)
    }
  }, [])

  const homeNeedsMic = pathname === '/'
  const showAssetLoading =
    bootGateOpen && homeNeedsMic && !heroMicReady

  const suppressMainIntro =
    bootGateOpen && homeNeedsMic && !heroMicReady

  return (
    <SplashDismissedContext.Provider value={splashExitComplete}>
      <BootRevealContext.Provider value={suppressMainIntro}>
        <SplashMicSignalContext.Provider value={signalHeroMicReady}>
          <SplashPreloader
            onTimerElapsed={onSplashTimerElapsed}
            onDismissComplete={() => setSplashExitComplete(true)}
          />
          {showAssetLoading ? <AssetLoadingOverlay /> : null}
          <Toaster richColors position="top-center" theme="dark" />
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
            </Route>
            <Route
              path="/admin"
              element={
                <Suspense
                  fallback={
                    <div
                      className="min-h-screen bg-studio-bg"
                      aria-hidden
                    />
                  }
                >
                  <AdminPage />
                </Suspense>
              }
            />
          </Routes>
        </SplashMicSignalContext.Provider>
      </BootRevealContext.Provider>
    </SplashDismissedContext.Provider>
  )
}
