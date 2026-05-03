/** Relative API base — same origin in production (SpaceWeb), proxied in Vite dev. */
export const API_BASE = '/api'

function extractErrorMessage(data: unknown, status: number): string {
  if (data !== null && typeof data === 'object') {
    const o = data as Record<string, unknown>
    if (typeof o.error === 'string' && o.error.trim()) return o.error
    if (typeof o.message === 'string' && o.message.trim()) return o.message
  }
  if (status === 401) return 'Неверный пароль или сессия истекла'
  if (status === 404)
    return 'API не найден. Проверьте, что папка api/ загружена на хостинг и запущен PHP.'
  if (status === 502 || status === 503)
    return 'Сервер API недоступен. Запустите проект командой npm run dev (нужен PHP в PATH) или отдельно: npm run dev:api.'
  return `Ошибка запроса (${status})`
}

export async function apiJson<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const hasBody = init?.body !== undefined && init?.body !== null
  let res: Response
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
        ...(init?.headers ?? {}),
      },
      credentials: 'include',
    })
  } catch {
    throw new Error(
      'Нет соединения с API. Установите PHP 8+ и запустите npm run dev (поднимает Vite и PHP), либо npm run dev:api в отдельном терминале.',
    )
  }

  const text = await res.text()
  let data: unknown
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    throw new Error(
      res.ok
        ? 'Некорректный ответ сервера'
        : extractErrorMessage(null, res.status),
    )
  }

  if (!res.ok) {
    throw new Error(extractErrorMessage(data, res.status))
  }

  return data as T
}
