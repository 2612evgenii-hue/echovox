import { Mic2, Radio, Stars, Trophy, Waves, Headphones } from 'lucide-react'
import { Reveal } from '@/components/animations/Reveal'
import { cn } from '@/lib/utils'

const items = [
  {
    title: 'Техника без форсирования',
    body: 'Опора, дыхание, связки. Объясняем спокойно, без идеи «сломать и собрать» голос заново.',
    icon: Waves,
    className: 'md:col-span-2',
    img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Сцена и микрофон',
    body: 'Подача, микрофон, уверенность. И для живого выступления, и когда вы поёте в запись.',
    icon: Mic2,
    className: 'md:col-span-1',
    img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Слышим детали звука',
    body: 'Тембр, атака, мягкость. Разбираем запись так, чтобы было ясно, что менять по шагам.',
    icon: Headphones,
    className: 'md:col-span-1',
    img: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Репертуар под вас',
    body: 'Поп, рок, соул, академия. Подбираем материал под ваш голос и цель, а не «по учебнику для всех».',
    icon: Radio,
    className: 'md:col-span-1',
    img: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Конкурсы и отчёты',
    body: 'Готовим к выступлениям: программа, образ, сценическое поведение.',
    icon: Trophy,
    className: 'md:col-span-1',
    img: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Занятия в студии',
    body: 'Приглушённый свет, тишина между фразами, нормальная акустика. Удобно сосредоточиться на голосе.',
    icon: Stars,
    className: 'md:col-span-2',
    img: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=82',
  },
]

export function AboutBento() {
  return (
    <section id="about" className="scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent-violet">
            Почему Echovox
          </p>
          <h2 className="mt-3 font-display text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl">
            Собрали лучшее из студии и сцены
          </h2>
          <p className="mt-4 max-w-2xl text-base text-zinc-400 sm:text-lg">
            Не «ходить на занятия ради галочки». От первых шагов к тому, чтобы вы
            сами слышали, что стало лучше в микрофоне и на сцене.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
          {items.map((item, i) => (
            <Reveal
              key={item.title}
              delay={i * 0.05}
              className={cn(
                'group relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/50',
                item.className,
              )}
            >
              <img
                src={item.img}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-40 transition duration-700 ease-out group-hover:scale-105 group-hover:opacity-55"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-studio-bg via-studio-bg/70 to-transparent" />
              <div className="relative flex h-full min-h-[200px] flex-col justify-end p-6 sm:min-h-[220px] sm:p-7">
                <div className="mb-3 inline-flex size-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-accent-gold backdrop-blur">
                  <item.icon className="size-5" aria-hidden />
                </div>
                <h3 className="font-display text-xl font-black text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-300">
                  {item.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
