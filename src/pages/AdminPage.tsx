import { useCallback, useEffect, useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Eye,
  ImagePlus,
  LogOut,
  MessageSquare,
  Trash2,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { apiJson } from '@/lib/api'
import { optimizeNewsImage } from '@/lib/optimizeNewsImage'
import { uploadNewsImage } from '@/lib/uploadNewsImage'
import type { ContactItem } from '@/types/contact'
import type { NewsItem } from '@/types/news'
import { BentoCardsAdmin } from '@/components/admin/BentoCardsAdmin'

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export function AdminPage() {
  const coverFieldId = useId()
  const [session, setSession] = useState<'unknown' | 'in' | 'out'>('unknown')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [news, setNews] = useState<NewsItem[]>([])
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [coverPath, setCoverPath] = useState<string | null>(null)
  const [coverBusy, setCoverBusy] = useState(false)
  const [contacts, setContacts] = useState<ContactItem[]>([])
  const [viewContact, setViewContact] = useState<ContactItem | null>(null)

  const refreshNews = useCallback(async () => {
    const data = await apiJson<{ news: NewsItem[] }>('/news.php')
    setNews(data.news)
  }, [])

  const refreshContacts = useCallback(async () => {
    const data = await apiJson<{ contacts: ContactItem[] }>('/contacts.php')
    setContacts(data.contacts)
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const me = await apiJson<{ ok: boolean }>('/me.php')
        if (!cancelled) {
          setSession(me.ok ? 'in' : 'out')
          if (me.ok) {
            await refreshNews()
            await refreshContacts()
          }
        }
      } catch {
        if (!cancelled) setSession('out')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [refreshContacts, refreshNews])

  const login = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await apiJson<{ ok: boolean }>('/login.php', {
        method: 'POST',
        body: JSON.stringify({ password: password.trim() }),
      })
      setPassword('')
      setSession('in')
      toast.success('Добро пожаловать')
      await refreshNews()
      await refreshContacts()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ошибка входа')
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      await apiJson<{ ok: boolean }>('/logout.php', { method: 'POST' })
      setSession('out')
      setNews([])
      setContacts([])
      toast.success('Вы вышли')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ошибка')
    } finally {
      setLoading(false)
    }
  }

  const onCoverFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Нужен файл изображения')
      return
    }
    setCoverBusy(true)
    try {
      const blob = await optimizeNewsImage(file)
      const path = await uploadNewsImage(blob)
      setCoverPath(path)
      toast.success('Обложка загружена')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Не удалось загрузить')
    } finally {
      setCoverBusy(false)
    }
  }

  const createNews = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !body.trim()) {
      toast.error('Заполните заголовок и текст')
      return
    }
    setLoading(true)
    try {
      await apiJson<{ ok: boolean }>('/news.php', {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          ...(coverPath ? { image: coverPath } : {}),
        }),
      })
      setTitle('')
      setBody('')
      setCoverPath(null)
      toast.success('Новость опубликована')
      await refreshNews()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ошибка')
    } finally {
      setLoading(false)
    }
  }

  const removeContact = async (id: number) => {
    if (!confirm('Удалить это обращение?')) return
    setLoading(true)
    try {
      await apiJson<{ ok: boolean }>(`/contacts.php?id=${id}`, {
        method: 'DELETE',
      })
      toast.success('Обращение удалено')
      setViewContact((c) => (c?.id === id ? null : c))
      await refreshContacts()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ошибка')
    } finally {
      setLoading(false)
    }
  }

  const remove = async (id: number) => {
    if (!confirm('Удалить эту новость?')) return
    setLoading(true)
    try {
      await apiJson<{ ok: boolean }>(`/news.php?id=${id}`, {
        method: 'DELETE',
      })
      toast.success('Удалено')
      await refreshNews()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ошибка')
    } finally {
      setLoading(false)
    }
  }

  if (session === 'unknown') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-studio-bg px-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent-violet border-t-transparent" />
      </div>
    )
  }

  if (session === 'out') {
    return (
      <div className="min-h-screen bg-studio-bg px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto w-full max-w-md"
        >
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="size-4" />
            На сайт
          </Link>
          <Card>
            <CardHeader>
              <CardTitle>Админ-панель</CardTitle>
              <CardDescription>
                Вход для публикации новостей и просмотра обращений (пароль в{' '}
                <code className="text-zinc-300">api/config.php</code>).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={login}>
                <div className="space-y-2">
                  <Label htmlFor="pw">Пароль</Label>
                  <Input
                    id="pw"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Вход…' : 'Войти'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-studio-bg px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-black text-white sm:text-3xl">
              Админка Echovox
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Новости, карточки блока «Что делаем на занятиях» и обращения с формы.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" asChild>
              <Link to="/">На сайт</Link>
            </Button>
            <Button variant="outlineGold" type="button" onClick={logout}>
              <LogOut className="size-4" />
              Выйти
            </Button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Новая публикация</CardTitle>
              <CardDescription>Заголовок и текст для блока «Новости».</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={createNews}>
                <div className="space-y-2">
                  <Label htmlFor="nt">Заголовок</Label>
                  <Input
                    id="nt"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nb">Текст</Label>
                  <Textarea
                    id="nb"
                    rows={6}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={coverFieldId}>Обложка</Label>
                  <p className="text-xs text-zinc-500">
                    По желанию. В браузере файл ужимается примерно до 1120px и
                    WebP, чтобы страница грузилась легче.
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={loading || coverBusy}
                      className="relative"
                      asChild
                    >
                      <label className="cursor-pointer">
                        <ImagePlus className="mr-2 size-4" aria-hidden />
                        {coverBusy ? 'Загрузка…' : 'Выбрать фото'}
                        <input
                          id={coverFieldId}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="sr-only"
                          onChange={onCoverFile}
                          disabled={loading || coverBusy}
                        />
                      </label>
                    </Button>
                    {coverPath ? (
                      <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] p-1.5 pr-2">
                        <img
                          src={coverPath}
                          alt=""
                          className="h-12 w-16 rounded-md object-cover"
                          width={64}
                          height={48}
                          loading="lazy"
                          decoding="async"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8 shrink-0 text-zinc-400 hover:text-white"
                          onClick={() => setCoverPath(null)}
                          aria-label="Убрать обложку"
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </div>
                <Button type="submit" disabled={loading}>
                  Опубликовать
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Лента</CardTitle>
              <CardDescription>Всего: {news.length}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full min-w-[320px] text-left text-sm">
                  <thead className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-wide text-zinc-500">
                    <tr>
                      <th className="w-16 px-2 py-3 font-medium" />
                      <th className="px-4 py-3 font-medium">Дата</th>
                      <th className="px-4 py-3 font-medium">Заголовок</th>
                      <th className="w-14 px-2 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {news.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-8 text-center text-zinc-500"
                        >
                          Пока нет записей
                        </td>
                      </tr>
                    ) : (
                      news.map((n) => (
                        <tr key={n.id} className="hover:bg-white/[0.02]">
                          <td className="px-2 py-2">
                            {n.image ? (
                              <img
                                src={n.image}
                                alt=""
                                className="mx-auto h-10 w-14 rounded-md border border-white/10 object-cover"
                                width={56}
                                height={40}
                                loading="lazy"
                                decoding="async"
                              />
                            ) : (
                              <span className="block text-center text-zinc-600">
                                нет
                              </span>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-zinc-400">
                            {formatDate(n.created_at)}
                          </td>
                          <td className="px-4 py-3 font-medium text-zinc-100">
                            {n.title}
                          </td>
                          <td className="px-2 py-3 text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                              onClick={() => remove(n.id)}
                              aria-label="Удалить"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <BentoCardsAdmin />

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="size-5 text-accent-violet" aria-hidden />
              Обращения с сайта
            </CardTitle>
            <CardDescription>
              Заявки из формы контактов (сохраняются в SQLite на сервере или в{' '}
              <code className="text-zinc-400">data/dev-contacts.json</code> в
              dev).
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-wide text-zinc-500">
                  <tr>
                    <th className="px-3 py-3 font-medium">Дата</th>
                    <th className="px-3 py-3 font-medium">Имя</th>
                    <th className="px-3 py-3 font-medium">Телефон</th>
                    <th className="min-w-[8rem] px-3 py-3 font-medium">
                      Сообщение
                    </th>
                    <th className="w-28 px-2 py-3 text-right font-medium">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {contacts.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-zinc-500"
                      >
                        Пока нет обращений
                      </td>
                    </tr>
                  ) : (
                    contacts.map((c) => {
                      const preview =
                        c.message.length > 80
                          ? `${c.message.slice(0, 80)}…`
                          : c.message
                      return (
                        <tr key={c.id} className="hover:bg-white/[0.02]">
                          <td className="whitespace-nowrap px-3 py-3 text-zinc-400">
                            {formatDate(c.created_at)}
                          </td>
                          <td className="max-w-[10rem] truncate px-3 py-3 font-medium text-zinc-100">
                            {c.name}
                          </td>
                          <td className="whitespace-nowrap px-3 py-3 text-zinc-300">
                            {c.phone}
                          </td>
                          <td className="max-w-xs px-3 py-3 text-zinc-400">
                            {preview}
                          </td>
                          <td className="px-2 py-3 text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-zinc-400 hover:bg-white/10 hover:text-white"
                              onClick={() => setViewContact(c)}
                              aria-label="Просмотр"
                            >
                              <Eye className="size-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                              onClick={() => removeContact(c.id)}
                              aria-label="Удалить"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {viewContact ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-view-title"
          onClick={() => setViewContact(null)}
        >
          <div
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <h2
                id="contact-view-title"
                className="font-display text-lg font-bold text-white"
              >
                Обращение
              </h2>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 text-zinc-400 hover:text-white"
                onClick={() => setViewContact(null)}
                aria-label="Закрыть"
              >
                <X className="size-5" />
              </Button>
            </div>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wide text-zinc-500">
                  Дата
                </dt>
                <dd className="mt-1 text-zinc-200">
                  {formatDate(viewContact.created_at)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-zinc-500">
                  Имя
                </dt>
                <dd className="mt-1 text-zinc-100">{viewContact.name}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-zinc-500">
                  Телефон
                </dt>
                <dd className="mt-1">
                  <a
                    href={`tel:${viewContact.phone.replace(/\s/g, '')}`}
                    className="font-medium text-accent-gold hover:underline"
                  >
                    {viewContact.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-zinc-500">
                  Сообщение
                </dt>
                <dd className="mt-2 whitespace-pre-wrap rounded-lg border border-white/10 bg-black/30 p-3 text-zinc-200">
                  {viewContact.message}
                </dd>
              </div>
            </dl>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setViewContact(null)}
              >
                Закрыть
              </Button>
              <Button
                type="button"
                variant="outlineGold"
                className="text-red-400 hover:bg-red-500/10"
                onClick={() => {
                  void removeContact(viewContact.id)
                }}
              >
                Удалить обращение
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
