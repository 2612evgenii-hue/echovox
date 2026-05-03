import { Link } from 'react-router-dom'
import { Phone } from 'lucide-react'

const PHONE_DISPLAY = '8 904 231 33 59'
const PHONE_TEL = 'tel:+79042313359'

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-black/40">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-4">
          <img
            src="/Dlia-avatarki.jpg"
            width={56}
            height={56}
            alt="Echovox"
            className="h-14 w-14 rounded-2xl border border-white/10 object-cover"
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
              Премиальная вокальная школа: техника, сцена, уверенность в звуке.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-3 text-sm text-zinc-300">
          <a
            href={PHONE_TEL}
            className="inline-flex items-center gap-2 font-medium text-white hover:text-accent-gold"
          >
            <Phone className="size-4" />
            {PHONE_DISPLAY} — Сергей
          </a>
          <a
            href="https://vk.com/echovox"
            target="_blank"
            rel="noreferrer"
            className="text-zinc-400 hover:text-white"
          >
            ВКонтакте: vk.com/echovox
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
