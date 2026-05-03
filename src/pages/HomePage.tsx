import { HeroSection } from '@/components/sections/HeroSection'
import { MarqueeStrip } from '@/components/sections/MarqueeStrip'
import { AboutBento } from '@/components/sections/AboutBento'
import { NewsSection } from '@/components/sections/NewsSection'
import { ContactSection } from '@/components/sections/ContactSection'

export function HomePage() {
  return (
    <>
      <HeroSection />
      <MarqueeStrip />
      <AboutBento />
      <NewsSection />
      <ContactSection />
    </>
  )
}
