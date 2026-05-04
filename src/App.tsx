import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { SplashPreloader } from '@/components/layout/SplashPreloader'
import { MainLayout } from '@/layouts/MainLayout'
import { HomePage } from '@/pages/HomePage'
import { AdminPage } from '@/pages/AdminPage'

export default function App() {
  return (
    <>
      <SplashPreloader />
      <Toaster richColors position="top-center" theme="dark" />
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
        </Route>
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </>
  )
}
