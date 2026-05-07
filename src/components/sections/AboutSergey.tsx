import {
  Headphones,
  MapPin,
  Mic2,
  Phone,
  Radio,
  Sparkles,
  Waves,
} from 'lucide-react'
import { Reveal } from '@/components/animations/Reveal'
import { Button } from '@/components/ui/button'
import { useScrollToSection } from '@/hooks/useScrollToSection'
import { cn } from '@/lib/utils'
import sergeyPhoto from '@/assets/sergey.webp'

const PHONE_TEL = 'tel:+79042313359'

const traits = [
  { icon: Mic2, label: 'Веду сам' },
  { icon: Headphones, label: 'Студия' },
  { icon: Radio, label: 'Микрофон' },
  { icon: Waves, label: 'Сцена' },
  { icon: Sparkles, label: 'Без конвейера' },
  { icon: MapPin, label: 'СПб' },
] as const

export function AboutSergey() {
  const scrollTo = useScrollToSection()

  return (
    <section id="founder" className="scroll-mt-24 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/50 transition-colors hover:border-white/[0.14]">
            <div className="grid gap-0 md:grid-cols-[minmax(0,13.5rem)_1fr] md:items-stretch">
              <div className="relative aspect-[16/10] w-full max-h-52 border-b border-white/10 sm:aspect-[5/3] sm:max-h-60 md:max-h-none md:aspect-auto md:min-h-[12rem] md:border-b-0 md:border-r">
                <img
                  src={sergeyPhoto}
                  alt="Сергей"
                  className="h-full w-full object-cover object-[center_15%] md:object-top"
                  width={320}
                  height={400}
                  loading="lazy"
                  decoding="async"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-zinc-950/90 via-zinc-950/20 to-transparent md:h-28" />
                <p className="absolute bottom-3 left-0 right-0 text-center font-display text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                  Echovox
                </p>
              </div>

              <div className="flex flex-col gap-4 p-6 sm:p-7 md:gap-4 md:p-8">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent-violet">
                    О себе
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-black tracking-tight text-white sm:text-3xl">
                    Сергей
                  </h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    основатель и преподаватель
                  </p>
                </div>

                <p className="max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
                  Я открыл Echovox, потому что хотел вести уроки сам. На занятии
                  говорю простыми словами, что слышу, и даю упражнения, которые
                  можно повторить дома. Если вы на «нуле» — начнём с базы. Если
                  уже поёте — шлифуем то, что мешает.
                </p>

                <div className="flex flex-wrap gap-2">
                  {traits.map(({ icon: Icon, label }) => (
                    <div
                      key={label}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[11px] font-medium text-zinc-400',
                        'transition-colors hover:border-white/15 hover:bg-white/[0.05] hover:text-zinc-200',
                      )}
                    >
                      <Icon
                        className="size-3.5 shrink-0 text-zinc-500"
                        aria-hidden
                      />
                      {label}
                    </div>
                  ))}
                </div>

                <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-white/5 pt-4 md:pt-5">
                  <a
                    href={PHONE_TEL}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm font-medium text-zinc-200 transition-colors hover:border-white/15 hover:bg-white/[0.06] hover:text-white"
                  >
                    <Phone className="size-4 text-accent-gold" aria-hidden />
                    Позвонить
                  </a>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="h-9"
                    onClick={() => scrollTo('#contact')}
                  >
                    Запись
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
