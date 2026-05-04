import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { SplashPreloader } from '@/components/layout/SplashPreloader'
import { MainLayout } from '@/layouts/MainLayout'
import { HomePage } from '@/pages/HomePage'

const AdminPage = lazy(() =>
  import('@/pages/AdminPage').then((m) => ({ default: m.AdminPage })),
)

export default function App() {
  return (
    <>
      <SplashPreloader />
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
    </>
  )
}
