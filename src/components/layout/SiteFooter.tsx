import { Link } from 'react-router-dom'
import { ExternalLink, Phone } from 'lucide-react'
import logo from '@/assets/logo.jpg'

const PHONE_DISPLAY = '8 904 231 33 59'
const PHONE_TEL = 'tel:+79042313359'

export function SiteFooter() {
  return (
    <footer className="border-t border-white/[0.06] bg-zinc-950/45 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-4">
          <img
            src={logo}
            width={56}
            height={56}
            alt="Echovox"
            className="h-9 w-auto rounded-2xl border border-white/10 object-cover sm:h-10"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
          <div>
            <div className="font-display text-xl font-black text-white">
              Echovox
            </div>
            <p className="mt-1 max-w-sm text-sm text-zinc-400">
              Вокальная школа в Санкт-Петербурге: техника, сцена, работа с
              микрофоном.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-3 text-sm text-zinc-300">
          <a
            href={PHONE_TEL}
            className="inline-flex items-center gap-2 font-medium text-white hover:text-accent-gold"
          >
            <Phone className="size-4" />
            {PHONE_DISPLAY}
          </a>
          <a
            href="https://vk.com/echovox"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white"
            aria-label="ВКонтакте Echovox"
          >
            <ExternalLink className="size-4 shrink-0 text-accent-violet" aria-hidden />
            ВКонтакте
          </a>
          <Link
            to="/admin"
            className="text-xs text-zinc-600 hover:text-zinc-400"
          >
            Админ-панель
          </Link>
        </div>
      </div>
      <div className="border-t border-white/5 py-4 text-center text-xs text-zinc-600">
        © {new Date().getFullYear()} Echovox. Все права защищены.
      </div>
    </footer>
  )
}
