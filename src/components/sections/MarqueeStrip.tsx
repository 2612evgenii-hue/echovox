import { Reveal } from '@/components/animations/Reveal'

const phrases = [
  'Дыхание · Опора · Резонанс',
  'Микрофонная техника',
  'Сцена без страха',
  'Тембр и артикуляция',
  'Репетиции под запись',
  'Подача и образ',
  'Индивидуальный план',
  'Рабочая атмосфера',
]

export function MarqueeStrip() {
  const row = [...phrases, ...phrases].join('   ·   ')
  return (
    <Reveal className="w-full border-y border-white/[0.04] bg-gradient-to-r from-violet-500/[0.06] via-white/[0.02] to-amber-400/[0.05] py-4 backdrop-blur-[2px]">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-28 bg-gradient-to-r from-zinc-950/80 via-zinc-950/25 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-28 bg-gradient-to-l from-zinc-950/80 via-zinc-950/25 to-transparent" />
        <div className="flex w-max animate-marquee whitespace-nowrap font-display text-sm font-black uppercase tracking-[0.2em] text-zinc-400">
          <span className="pr-16">{row}</span>
          <span className="pr-16">{row}</span>
        </div>
      </div>
    </Reveal>
  )
}
