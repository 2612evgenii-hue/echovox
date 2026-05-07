import { Mic2, Radio, Stars, Trophy, Waves, Headphones } from 'lucide-react'
import { Reveal } from '@/components/animations/Reveal'
import { cn } from '@/lib/utils'
import bento1 from '@/assets/im1.jpeg'
import bento2 from '@/assets/im2.jpeg'
import bento3 from '@/assets/im3.jpeg'
import bento4 from '@/assets/im4.jpeg'
import bento5 from '@/assets/im5.jpeg'
import bento6 from '@/assets/im6.jpeg'

const items = [
  {
    title: 'Техника без форсирования',
    body: 'Покажу, как держать дыхание и не зажимать горло. Без «ломки»: ищем рабочие ощущения и закрепляем их.',
    icon: Waves,
    className: 'md:col-span-2',
    img: bento1,
  },
  {
    title: 'Сцена и микрофон',
    body: 'Как звучать в микрофон и что делать на сцене, когда волнуешься. Репетируем и «живой» номер, и запись.',
    icon: Mic2,
    className: 'md:col-span-1',
    img: bento2,
  },
  {
    title: 'Слышим детали звука',
    body: 'Слушаем запись вместе: где «съедаются» слова, где шумит дыхание, где тон уплывает. После этого уже понятно, что тренировать.',
    icon: Headphones,
    className: 'md:col-span-1',
    img: bento3,
  },
  {
    title: 'Репертуар под вас',
    body: 'Выбираем песни под ваш голос и задачу. Хотите подготовить номер, записать кавер или просто спеть любимую песню — ок.',
    icon: Radio,
    className: 'md:col-span-1',
    img: bento4,
  },
  {
    title: 'Конкурсы и отчёты',
    body: 'Если нужно выступление — соберём программу и отрепетируем выход. Чтобы вы понимали, что делать на сцене.',
    icon: Trophy,
    className: 'md:col-span-1',
    img: bento5,
  },
  {
    title: 'Занятия в студии',
    body: 'Отдельная комната, нормальная акустика, никто не мешает. Можно нормально поработать над голосом.',
    icon: Stars,
    className: 'md:col-span-2',
    img: bento6,
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
            Что делаем на занятиях
          </h2>
          <p className="mt-4 max-w-2xl text-base text-zinc-400 sm:text-lg">
            Говорю по делу: что слышу и что будем править. Даю упражнения, которые
            реально повторить дома, а не «красиво посмотреть один раз».
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
                fetchPriority="low"
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
