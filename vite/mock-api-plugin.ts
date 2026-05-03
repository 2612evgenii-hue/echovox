import fs from 'node:fs'
import crypto from 'node:crypto'
import path from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'
import busboy from 'busboy'
import type { Plugin } from 'vite'

/** Same as production `api/config.php` (plain password for dev mock only). */
const ADMIN_PASSWORD = '123456'

const COOKIE_NAME = 'echovox_admin'
const COOKIE_VALUE = '1'

type NewsRow = {
  id: number
  title: string
  body: string
  created_at: string
  image?: string | null
}

type ContactRow = {
  id: number
  name: string
  phone: string
  message: string
  created_at: string
}

/** Как в `api/contact.php` и `src/lib/phone.ts` */
const RU_PHONE_REGEX =
  /^(\+7|7|8)?[\s-]?\(?[489][0-9]{2}\)?[\s-]?[0-9]{3}[\s-]?[0-9]{2}[\s-]?[0-9]{2}$/

const DEV_NEWS_IMAGE_RE = /^\/uploads\/dev-news\/[a-f0-9]{20}\.(webp|jpg)$/i

function parseNewsImageUpload(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const bb = busboy({
      headers: req.headers,
      limits: { fileSize: 2_500_000, files: 1 },
    })
    const chunks: Buffer[] = []
    let hitLimit = false

    bb.on('file', (fieldname, file) => {
      if (fieldname !== 'image') {
        file.resume()
        return
      }
      file.on('data', (d: Buffer) => chunks.push(d))
      file.on('limit', () => {
        hitLimit = true
      })
    })
    bb.on('error', reject)
    bb.on('finish', () => {
      if (hitLimit) {
        reject(new Error('too_large'))
        return
      }
      const buf = Buffer.concat(chunks)
      if (buf.length === 0) {
        reject(new Error('no_file'))
        return
      }
      resolve(buf)
    })
    req.pipe(bb)
  })
}

function deleteDevNewsUpload(webPath: string) {
  if (!DEV_NEWS_IMAGE_RE.test(webPath)) return
  const dir = path.join(process.cwd(), 'public', 'uploads', 'dev-news')
  const full = path.join(dir, path.basename(webPath))
  if (!full.startsWith(dir)) return
  try {
    if (fs.existsSync(full)) fs.unlinkSync(full)
  } catch {
    /* ignore */
  }
}

function parseCookies(header?: string): Record<string, string> {
  const out: Record<string, string> = {}
  if (!header) return out
  for (const part of header.split(';')) {
    const eq = part.indexOf('=')
    if (eq === -1) continue
    const k = part.slice(0, eq).trim()
    const v = part.slice(eq + 1).trim()
    try {
      out[k] = decodeURIComponent(v)
    } catch {
      out[k] = v
    }
  }
  return out
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (c: Buffer) => chunks.push(c))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

function sendJson(res: ServerResponse, code: number, data: unknown) {
  res.statusCode = code
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(data))
}

function isLoggedIn(req: IncomingMessage): boolean {
  return parseCookies(req.headers.cookie)[COOKIE_NAME] === COOKIE_VALUE
}

/**
 * Dev-only: handles /api/*.php without PHP — login, news CRUD, contact, session cookie.
 * configureServer runs only during `vite` dev, not during `vite build`.
 */
export function echovoxMockApiPlugin(): Plugin {
  let newsPath = ''
  let news: NewsRow[] = []
  let contactsPath = ''
  let contacts: ContactRow[] = []

  function loadNews() {
    try {
      const raw = fs.readFileSync(newsPath, 'utf8')
      const parsed = JSON.parse(raw) as unknown
      news = Array.isArray(parsed) ? (parsed as NewsRow[]) : []
    } catch {
      news = []
    }
  }

  function saveNews() {
    fs.mkdirSync(path.dirname(newsPath), { recursive: true })
    fs.writeFileSync(newsPath, JSON.stringify(news, null, 2), 'utf8')
  }

  function loadContacts() {
    try {
      const raw = fs.readFileSync(contactsPath, 'utf8')
      const parsed = JSON.parse(raw) as unknown
      contacts = Array.isArray(parsed) ? (parsed as ContactRow[]) : []
    } catch {
      contacts = []
    }
  }

  function saveContacts() {
    fs.mkdirSync(path.dirname(contactsPath), { recursive: true })
    fs.writeFileSync(contactsPath, JSON.stringify(contacts, null, 2), 'utf8')
  }

  return {
    name: 'echovox-mock-api',
    enforce: 'pre',
    configureServer(server) {
      newsPath = path.join(process.cwd(), 'data/dev-news.json')
      loadNews()
      contactsPath = path.join(process.cwd(), 'data/dev-contacts.json')
      loadContacts()

      /** Регистрируем до внутренних middleware Vite, чтобы /api не ушёл в SPA fallback. */
      server.middlewares.use(async (req, res, next) => {
        const rawUrl = req.url ?? ''
        if (!rawUrl.startsWith('/api/')) {
          next()
          return
        }

        const parsedUrl = new URL(rawUrl, 'http://127.0.0.1')
        const pathname = parsedUrl.pathname
        const method = (req.method || 'GET').toUpperCase()

        try {
          if (pathname === '/api/me.php' && method === 'GET') {
            sendJson(res, 200, { ok: isLoggedIn(req) })
            return
          }

          if (pathname === '/api/login.php' && method === 'POST') {
            const raw = await readBody(req)
            let password = ''
            try {
              const j = JSON.parse(raw || '{}') as { password?: unknown }
              password =
                typeof j.password === 'string' ? j.password.trim() : ''
            } catch {
              password = ''
            }
            if (password !== ADMIN_PASSWORD) {
              sendJson(res, 401, { error: 'Неверный пароль' })
              return
            }
            res.setHeader(
              'Set-Cookie',
              `${COOKIE_NAME}=${COOKIE_VALUE}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`,
            )
            sendJson(res, 200, { ok: true })
            return
          }

          if (pathname === '/api/logout.php' && method === 'POST') {
            res.setHeader(
              'Set-Cookie',
              `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
            )
            sendJson(res, 200, { ok: true })
            return
          }

          if (pathname === '/api/news.php' && method === 'GET') {
            loadNews()
            sendJson(res, 200, { news })
            return
          }

          if (pathname === '/api/news-image.php' && method === 'POST') {
            if (!isLoggedIn(req)) {
              sendJson(res, 401, { error: 'Требуется вход' })
              return
            }
            try {
              const buf = await parseNewsImageUpload(req)
              if (buf.length > 2_500_000) {
                sendJson(res, 422, { error: 'Файл больше 2.5 МБ' })
                return
              }
              const outDir = path.join(
                process.cwd(),
                'public',
                'uploads',
                'dev-news',
              )
              fs.mkdirSync(outDir, { recursive: true })
              const isJpeg = buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8
              const ext = isJpeg ? '.jpg' : '.webp'
              const name = crypto.randomBytes(10).toString('hex') + ext
              fs.writeFileSync(path.join(outDir, name), buf)
              sendJson(res, 200, {
                ok: true,
                path: `/uploads/dev-news/${name}`,
              })
            } catch (e) {
              const code =
                e instanceof Error ? e.message : ''
              if (code === 'too_large') {
                sendJson(res, 422, { error: 'Файл больше 2.5 МБ' })
                return
              }
              sendJson(res, 422, { error: 'Файл не получен' })
            }
            return
          }

          if (pathname === '/api/news.php' && method === 'POST') {
            if (!isLoggedIn(req)) {
              sendJson(res, 401, { error: 'Требуется вход' })
              return
            }
            const raw = await readBody(req)
            const j = JSON.parse(raw || '{}') as {
              title?: unknown
              body?: unknown
              image?: unknown
            }
            const title = typeof j.title === 'string' ? j.title.trim() : ''
            const body = typeof j.body === 'string' ? j.body.trim() : ''
            if (!title || !body) {
              sendJson(res, 422, { error: 'Заполните заголовок и текст' })
              return
            }
            let image: string | null | undefined
            if (j.image !== undefined && j.image !== null) {
              const s = typeof j.image === 'string' ? j.image.trim() : ''
              if (s === '') {
                image = null
              } else if (!DEV_NEWS_IMAGE_RE.test(s)) {
                sendJson(res, 422, { error: 'Некорректное изображение' })
                return
              } else {
                image = s
              }
            }
            loadNews()
            const id =
              news.length === 0 ? 1 : Math.max(...news.map((n) => n.id)) + 1
            const row: NewsRow = {
              id,
              title,
              body,
              created_at: new Date().toISOString(),
              ...(image !== undefined ? { image } : {}),
            }
            news = [row, ...news]
            saveNews()
            sendJson(res, 200, { ok: true, id })
            return
          }

          if (pathname === '/api/news.php' && method === 'DELETE') {
            if (!isLoggedIn(req)) {
              sendJson(res, 401, { error: 'Требуется вход' })
              return
            }
            const id = Number(parsedUrl.searchParams.get('id') || '0')
            if (!Number.isFinite(id) || id < 1) {
              sendJson(res, 422, { error: 'Некорректный id' })
              return
            }
            loadNews()
            const row = news.find((n) => n.id === id)
            const img = row?.image
            if (typeof img === 'string' && img) {
              deleteDevNewsUpload(img)
            }
            news = news.filter((n) => n.id !== id)
            saveNews()
            sendJson(res, 200, { ok: true })
            return
          }

          if (pathname === '/api/contact.php' && method === 'POST') {
            const raw = await readBody(req)
            let j: Record<string, unknown> = {}
            try {
              j = JSON.parse(raw || '{}') as Record<string, unknown>
            } catch {
              j = {}
            }
            const name =
              typeof j.name === 'string' ? j.name.trim().slice(0, 120) : ''
            const phone =
              typeof j.phone === 'string' ? j.phone.trim().slice(0, 40) : ''
            const message =
              typeof j.message === 'string' ? j.message.trim().slice(0, 4000) : ''
            if (!name || !message || !RU_PHONE_REGEX.test(phone)) {
              sendJson(res, 422, {
                error: 'Проверьте имя, телефон и сообщение',
              })
              return
            }
            loadContacts()
            const id =
              contacts.length === 0
                ? 1
                : Math.max(...contacts.map((c) => c.id)) + 1
            const row: ContactRow = {
              id,
              name,
              phone,
              message,
              created_at: new Date().toISOString(),
            }
            contacts = [row, ...contacts]
            saveContacts()
            sendJson(res, 200, { ok: true })
            return
          }

          if (pathname === '/api/contacts.php' && method === 'GET') {
            if (!isLoggedIn(req)) {
              sendJson(res, 401, { error: 'Требуется вход' })
              return
            }
            loadContacts()
            sendJson(res, 200, { contacts })
            return
          }

          if (pathname === '/api/contacts.php' && method === 'DELETE') {
            if (!isLoggedIn(req)) {
              sendJson(res, 401, { error: 'Требуется вход' })
              return
            }
            const id = Number(parsedUrl.searchParams.get('id') || '0')
            if (!Number.isFinite(id) || id < 1) {
              sendJson(res, 422, { error: 'Некорректный id' })
              return
            }
            loadContacts()
            contacts = contacts.filter((c) => c.id !== id)
            saveContacts()
            sendJson(res, 200, { ok: true })
            return
          }

          sendJson(res, 404, { error: 'Не найдено' })
        } catch {
          sendJson(res, 500, { error: 'Ошибка mock API' })
        }
      })
    },
  }
}
