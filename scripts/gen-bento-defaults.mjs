/**
 * Generates data/bento-defaults.json + api/bento-defaults.json (продакшен сид рядом с PHP).
 * Run: node scripts/gen-bento-defaults.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

const wrap = (inner) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`

// Lucide v1.14: waves→waves-horizontal, mic-2→mic-vocal, stars→sparkles
const icons = [
  wrap(
    '<path d="M2 12q2.5 2 5 0t5 0 5 0 5 0"/><path d="M2 19q2.5 2 5 0t5 0 5 0 5 0"/><path d="M2 5q2.5 2 5 0t5 0 5 0 5 0"/>',
  ),
  wrap(
    '<path d="m11 7.601-5.994 8.19a1 1 0 0 0 .1 1.298l.817.818a1 1 0 0 0 1.314.087L15.09 12"/><path d="M16.5 21.174C15.5 20.5 14.372 20 13 20c-2.058 0-3.928 2.356-6 2-2.072-.356-2.775-3.369-1.5-4.5"/><circle cx="16" cy="7" r="5"/>',
  ),
  wrap(
    '<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>',
  ),
  wrap(
    '<path d="M16.247 7.761a6 6 0 0 1 0 8.478"/><path d="M19.075 4.933a10 10 0 0 1 0 14.134"/><path d="M4.925 19.067a10 10 0 0 1 0-14.134"/><path d="M7.753 16.239a6 6 0 0 1 0-8.478"/><circle cx="12" cy="12" r="2"/>',
  ),
  wrap(
    '<path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978"/><path d="M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978"/><path d="M18 9h1.5a1 1 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"/><path d="M6 9H4.5a1 1 0 0 1 0-5H6"/>',
  ),
  wrap(
    '<path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/>',
  ),
]

const placeholderIconSvg = wrap('<circle cx="12" cy="12" r="10"/>')

const rows = [
  [
    'Техника без форсирования',
    'Покажу, как держать дыхание и не зажимать горло. Без «ломки». Ищем рабочие ощущения и закрепляем их.',
    'wide',
  ],
  [
    'Сцена и микрофон',
    'Как звучать в микрофон и что делать на сцене, когда волнуешься. Репетируем и «живой» номер, и запись.',
    'normal',
  ],
  [
    'Слышим детали звука',
    'Слушаем запись вместе. Где «съедаются» слова, где шумит дыхание, где тон уплывает. После этого уже понятно, что тренировать.',
    'normal',
  ],
  [
    'Репертуар под вас',
    'Выбираем песни под ваш голос и задачу. Хотите подготовить номер, записать кавер или просто спеть любимую песню? Ок.',
    'normal',
  ],
  [
    'Конкурсы и отчёты',
    'Если нужно выступление, соберём программу и отрепетируем выход. Чтобы вы понимали, что делать на сцене.',
    'normal',
  ],
  [
    'Занятия в студии',
    'Отдельная комната, нормальная акустика, никто не мешает. Можно нормально поработать над голосом.',
    'wide',
  ],
]

const seedCards = rows.map((r, i) => ({
  title: r[0],
  body: r[1],
  layout: r[2],
  iconSvg: icons[i],
  image: `/bento-default/im${i + 1}.jpeg`,
}))

const out = {
  placeholderIconSvg,
  seedCards,
}

const destData = path.join(root, 'data', 'bento-defaults.json')
const destApi = path.join(root, 'api', 'bento-defaults.json')
fs.mkdirSync(path.dirname(destData), { recursive: true })
fs.mkdirSync(path.dirname(destApi), { recursive: true })
const payload = JSON.stringify(out, null, 2) + '\n'
fs.writeFileSync(destData, payload, 'utf8')
fs.writeFileSync(destApi, payload, 'utf8')
console.log('Wrote', destData)
console.log('Wrote', destApi)
