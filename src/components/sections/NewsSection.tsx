import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Reveal } from '@/components/animations/Reveal'
import { apiJson } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { MainLayoutOutletContext } from '@/layouts/MainLayout'
import type { NewsItem } from '@/types/news'

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export function NewsSection() {
  const { setNewsNavVisible } = useOutletContext<MainLayoutOutletContext>()
  const [items, setItems] = useState<NewsItem[] | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await apiJson<{ news: NewsItem[] }>('/news.php')
        if (cancelled) return
        setItems(data.news)
        setNewsNavVisible(data.news.length > 0)
      } catch {
        if (cancelled) return
        setItems([])
        setNewsNavVisible(false)
      }
    })()
    return () => {
      cancelled = true
      setNewsNavVisible(false)
    }
  }, [setNewsNavVisible])

  if (items === null || items.length === 0) {
    return null
  }

  return (
    <section id="news" className="scroll-mt-24 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent-gold">
            Новости школы
          </p>
          <h2 className="mt-3 font-display text-3xl font-black tracking-tight text-white sm:text-4xl">
            События и анонсы
          </h2>
          <p className="mt-3 max-w-2xl text-zinc-400">
            Короткие новости школы: концерты, набор, сдвиги по расписанию. По
            мере событий, без лишнего шума.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {items.map((n, idx) => {
            const src = n.image?.trim() || ''
            return (
              <Reveal key={n.id} delay={idx * 0.06}>
                <article
                  className={cn(
                    'group flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/50 transition',
                    'hover:border-accent-violet/30 hover:shadow-lg hover:shadow-accent-violet/10',
                  )}
                >
                  {src ? (
                    <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden border-b border-white/10">
                      <img
                        src={src}
                        alt=""
                        className="h-full w-full object-cover opacity-85 transition duration-700 ease-out group-hover:scale-[1.03] group-hover:opacity-95"
                        width={1120}
                        height={700}
                        sizes="(max-width: 768px) 100vw, 50vw"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/55 to-transparent" />
                    </div>
                  ) : null}
                  <div className="flex flex-1 flex-col p-6 sm:p-7">
                    <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                      {formatDate(n.created_at)}
                    </p>
                    <h3 className="mt-2 font-display text-2xl font-black text-white">
                      {n.title}
                    </h3>
                    <p className="mt-3 flex-1 whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
                      {n.body}
                    </p>
                  </div>
                </article>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
