import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { Menu, Phone, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useScrollToSection } from '@/hooks/useScrollToSection'
import { cn } from '@/lib/utils'

const nav = [
  { href: '#about', label: 'О школе' },
  { href: '#news', label: 'Новости' },
  { href: '#contact', label: 'Контакты' },
] as const

const PHONE_DISPLAY = '8 904 231 33 59'
const PHONE_TEL = 'tel:+79042313359'

const menuPanelVariants = {
  closed: { x: '104%', opacity: 0.96 },
  open: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring', damping: 26, stiffness: 320, mass: 0.85 },
  },
  exit: {
    x: '104%',
    opacity: 0,
    transition: { duration: 0.32, ease: [0.76, 0, 0.24, 1] },
  },
} as const

const backdropVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
  exit: { opacity: 0, transition: { duration: 0.25 } },
} as const

const listVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07, delayChildren: 0.08 },
  },
} as const

const itemVariants = {
  hidden: { x: 36, opacity: 0, filter: 'blur(6px)' },
  show: {
    x: 0,
    opacity: 1,
    filter: 'blur(0px)',
    transition: { type: 'spring', damping: 22, stiffness: 280 },
  },
} as const

type SiteHeaderProps = {
  showNewsNav?: boolean
}

export function SiteHeader({ showNewsNav = false }: SiteHeaderProps) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const scrollTo = useScrollToSection()

  const navItems = useMemo(
    () => (showNewsNav ? [...nav] : nav.filter((i) => i.href !== '#news')),
    [showNewsNav],
  )

  const mobileScroll = (href: string) => {
    setOpen(false)
    scrollTo(href, { menuCloseDelayMs: 420 })
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const glassAtTop = open && !scrolled

  const mobileBackdropStyle = scrolled
    ? {
        backgroundImage:
          'radial-gradient(ellipse 70% 50% at 25% 15%, rgba(139,92,246,0.2), transparent 55%), radial-gradient(ellipse 50% 40% at 85% 70%, rgba(251,191,36,0.08), transparent 50%)',
      }
    : {
        backgroundImage:
          'radial-gradient(ellipse 80% 55% at 20% 10%, rgba(139,92,246,0.18), transparent 58%), radial-gradient(ellipse 55% 45% at 90% 75%, rgba(251,191,36,0.1), transparent 52%)',
      }

  const mobileMenu =
    typeof document !== 'undefined' &&
    createPortal(
      <AnimatePresence>
        {open ? (
          <>
            <motion.button
              key="menu-backdrop"
              type="button"
              aria-label="Закрыть меню"
              className={cn(
                'fixed inset-0 top-16 z-[140] md:hidden transition-colors duration-300',
                scrolled
                  ? 'bg-black/88 backdrop-blur-md'
                  : 'bg-studio-bg/40 backdrop-blur-2xl saturate-150',
              )}
              style={mobileBackdropStyle}
              variants={backdropVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              onClick={() => setOpen(false)}
            />

            <motion.aside
              key="menu-panel"
              id="mobile-menu-panel"
              role="dialog"
              aria-modal="true"
              aria-label="Навигация по сайту"
              className={cn(
                'fixed inset-y-0 right-0 top-16 z-[150] flex w-[min(100vw,22rem)] flex-col md:hidden transition-[background-color,backdrop-filter,box-shadow,border-color] duration-300',
                scrolled
                  ? 'border-l border-white/10 bg-zinc-950 shadow-[-24px_0_80px_-20px_rgba(0,0,0,0.9)]'
                  : 'border-l border-white/15 bg-zinc-950/35 backdrop-blur-2xl shadow-[inset_1px_0_0_rgba(255,255,255,0.08)] shadow-[0_0_48px_-12px_rgba(0,0,0,0.55)]',
              )}
              variants={menuPanelVariants}
              initial="closed"
              animate="open"
              exit="exit"
            >
              <div
                className={cn(
                  'pointer-events-none absolute inset-0 overflow-hidden',
                  !scrolled && 'opacity-90',
                )}
              >
                <div className="absolute -left-24 top-1/4 h-64 w-64 rounded-full bg-accent-violet/20 blur-3xl" />
                <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-accent-gold/12 blur-3xl" />
                <div
                  className={cn(
                    'absolute inset-0',
                    scrolled
                      ? 'bg-gradient-to-b from-zinc-950 via-zinc-950 to-[#050508]'
                      : 'bg-gradient-to-b from-white/[0.07] via-zinc-950/50 to-zinc-950/70',
                  )}
                />
              </div>

              <div className="relative flex items-center gap-2 border-b border-white/10 px-5 py-4">
                <Sparkles className="size-4 text-accent-gold" aria-hidden />
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Навигация
                </span>
              </div>

              <motion.nav
                className="relative flex flex-1 flex-col gap-1 px-4 py-6"
                variants={listVariants}
                initial="hidden"
                animate="show"
              >
                {navItems.map((item) => (
                  <motion.button
                    key={item.href}
                    type="button"
                    variants={itemVariants}
                    className={cn(
                      'group flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left text-lg font-semibold transition-colors active:scale-[0.99]',
                      scrolled
                        ? 'border-white/[0.08] bg-zinc-900/80 text-zinc-100 hover:border-white/15 hover:bg-zinc-800/90'
                        : 'border-white/10 bg-white/[0.08] text-zinc-50 backdrop-blur-sm hover:border-white/18 hover:bg-white/[0.12]',
                    )}
                    onClick={() => mobileScroll(item.href)}
                  >
                    <span>{item.label}</span>
                    <span
                      className={cn(
                        'text-sm font-normal transition-colors group-hover:text-accent-violet',
                        scrolled ? 'text-zinc-500' : 'text-zinc-400',
                      )}
                    >
                      →
                    </span>
                  </motion.button>
                ))}
              </motion.nav>

              <motion.div
                className="relative border-t border-white/10 p-4"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.35,
                  duration: 0.4,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <a
                  href={PHONE_TEL}
                  className={cn(
                    'mb-3 flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm',
                    scrolled
                      ? 'border-white/10 bg-zinc-900/80 text-zinc-200'
                      : 'border-white/12 bg-white/[0.08] text-zinc-100 backdrop-blur-sm',
                  )}
                  onClick={() => setOpen(false)}
                >
                  <Phone className="size-4 shrink-0 text-accent-gold" />
                  {PHONE_DISPLAY}
                </a>
                <Button
                  type="button"
                  className="w-full"
                  onClick={() => mobileScroll('#contact')}
                >
                  Записаться
                </Button>
              </motion.div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>,
      document.body,
    )

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 border-b transition-[background-color,backdrop-filter,border-color,box-shadow] duration-300',
          scrolled
            ? 'border-white/10 bg-studio-bg/80 backdrop-blur-xl'
            : glassAtTop
              ? 'border-white/10 bg-studio-bg/50 backdrop-blur-2xl shadow-[0_1px_0_rgba(255,255,255,0.06)_inset] saturate-150'
              : 'border-transparent bg-transparent',
        )}
      >
        <div className="relative z-10 mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:h-[4.25rem] sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-3"
          onClick={() => setOpen(false)}
        >
          <img
            src="/Dlia-avatarki.jpg"
            width={44}
            height={44}
            alt="Echovox"
            className="h-10 w-10 rounded-2xl border border-white/10 object-cover shadow-lg shadow-black/40 sm:h-11 sm:w-11"
            loading="eager"
            decoding="async"
            onError={(e) => {
              const t = e.currentTarget
              t.style.display = 'none'
            }}
          />
          <div className="flex flex-col leading-tight">
            <span className="font-display text-lg font-black tracking-tight text-white sm:text-xl">
              Echovox
            </span>
            <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
              Вокальная школа
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <button
              key={item.href}
              type="button"
              onClick={() => scrollTo(item.href)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href={PHONE_TEL}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-zinc-200 transition-colors hover:border-accent-violet/40 hover:text-white"
          >
            <Phone className="size-4 text-accent-gold" aria-hidden />
            {PHONE_DISPLAY}
          </a>
          <Button size="sm" type="button" onClick={() => scrollTo('#contact')}>
            Записаться
          </Button>
        </div>

        <motion.button
          type="button"
          className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/12 bg-white/[0.05] text-white shadow-inner shadow-black/30 md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu-panel"
          onClick={() => setOpen((v) => !v)}
          whileTap={{ scale: 0.94 }}
        >
          <span className="sr-only">{open ? 'Закрыть меню' : 'Открыть меню'}</span>
          <motion.span
            className="absolute inset-0 flex items-center justify-center"
            initial={false}
            animate={
              open ? { rotate: 90, opacity: 0 } : { rotate: 0, opacity: 1 }
            }
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <Menu className="size-5" aria-hidden />
          </motion.span>
          <motion.span
            className="absolute inset-0 flex items-center justify-center"
            initial={false}
            animate={
              open ? { rotate: 0, opacity: 1 } : { rotate: -90, opacity: 0 }
            }
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              aria-hidden
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </motion.span>
        </motion.button>
        </div>
      </header>
      {mobileMenu}
    </>
  )
}
