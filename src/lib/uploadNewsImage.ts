import { API_BASE } from '@/lib/api'

function extractErrorMessage(data: unknown, status: number): string {
  if (data !== null && typeof data === 'object') {
    const o = data as Record<string, unknown>
    if (typeof o.error === 'string' && o.error.trim()) return o.error
  }
  if (status === 401) return 'Сессия истекла — войдите снова'
  return `Ошибка загрузки (${status})`
}

/** Multipart POST; не задавайте Content-Type вручную. */
export async function uploadNewsImage(blob: Blob): Promise<string> {
  const ext = blob.type.includes('jpeg') || blob.type.includes('jpg')
    ? 'jpg'
    : 'webp'
  const fd = new FormData()
  fd.append('image', blob, `cover.${ext}`)

  let res: Response
  try {
    res = await fetch(`${API_BASE}/news-image.php`, {
      method: 'POST',
      body: fd,
      credentials: 'include',
    })
  } catch {
    throw new Error('Нет соединения с сервером')
  }

  const text = await res.text()
  let data: unknown
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    throw new Error(res.ok ? 'Некорректный ответ сервера' : extractErrorMessage(null, res.status))
  }

  if (!res.ok) {
    throw new Error(extractErrorMessage(data, res.status))
  }

  if (data !== null && typeof data === 'object') {
    const o = data as Record<string, unknown>
    if (typeof o.path === 'string' && o.path.startsWith('/uploads/')) {
      return o.path
    }
  }
  throw new Error('Сервер не вернул путь к файлу')
}
