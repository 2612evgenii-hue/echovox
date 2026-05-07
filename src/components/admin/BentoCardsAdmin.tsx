import { useCallback, useEffect, useId, useState } from 'react'
import { toast } from 'sonner'
import { Grid3x3, ImagePlus, Pencil, Plus, Trash2, X } from 'lucide-react'
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
import { uploadBentoImage } from '@/lib/uploadBentoImage'
import type { BentoCard, BentoLayout } from '@/types/bento'

const DEFAULT_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>`

export function BentoCardsAdmin() {
  const imgFieldId = useId()
  const [cards, setCards] = useState<BentoCard[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [imgBusy, setImgBusy] = useState(false)

  const [editId, setEditId] = useState<number | null>(null)
  const [sortOrder, setSortOrder] = useState(0)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [iconSvg, setIconSvg] = useState(DEFAULT_ICON_SVG)
  const [layout, setLayout] = useState<BentoLayout>('normal')
  const [imagePath, setImagePath] = useState<string | null>(null)

  const refresh = useCallback(async (): Promise<BentoCard[]> => {
    const data = await apiJson<{ cards: BentoCard[] }>('/bento.php')
    const sorted = [...(data.cards ?? [])].sort((a, b) =>
      a.sort_order !== b.sort_order
        ? a.sort_order - b.sort_order
        : a.id - b.id,
    )
    setCards(sorted)
    return sorted
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const list = await refresh()
        if (!cancelled) {
          setSortOrder(
            list.length ? Math.max(...list.map((c) => c.sort_order)) + 1 : 0,
          )
        }
      } catch {
        if (!cancelled) toast.error('Не удалось загрузить карточки bento')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [refresh])

  const resetForm = useCallback((nextCards?: BentoCard[]) => {
    setEditId(null)
    setTitle('')
    setBody('')
    setIconSvg(DEFAULT_ICON_SVG)
    setLayout('normal')
    setImagePath(null)
    const list = nextCards ?? []
    setSortOrder(
      list.length ? Math.max(...list.map((c) => c.sort_order)) + 1 : 0,
    )
  }, [])

  const startEdit = (c: BentoCard) => {
    setEditId(c.id)
    setSortOrder(c.sort_order)
    setTitle(c.title)
    setBody(c.body)
    setIconSvg(c.icon_svg || DEFAULT_ICON_SVG)
    setLayout(c.layout === 'wide' ? 'wide' : 'normal')
    setImagePath(c.image)
  }

  const onImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Нужен файл изображения')
      return
    }
    setImgBusy(true)
    try {
      const blob = await optimizeNewsImage(file)
      const path = await uploadBentoImage(blob)
      setImagePath(path)
      toast.success('Фото загружено')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Не удалось загрузить')
    } finally {
      setImgBusy(false)
    }
  }

  const saveCard = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !body.trim()) {
      toast.error('Заполните заголовок и текст')
      return
    }
    if (!iconSvg.includes('<svg')) {
      toast.error('Иконка должна быть в формате SVG')
      return
    }
    setBusy(true)
    try {
      const payload: Record<string, unknown> = {
        title: title.trim(),
        body: body.trim(),
        icon_svg: iconSvg.trim(),
        layout,
        sort_order: sortOrder,
      }
      if (editId !== null) {
        payload.id = editId
        payload.image = imagePath ?? ''
      } else if (imagePath) {
        payload.image = imagePath
      }
      await apiJson<{ ok: boolean }>('/bento.php', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      toast.success(editId ? 'Карточка сохранена' : 'Карточка добавлена')
      const list = await refresh()
      resetForm(list)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ошибка')
    } finally {
      setBusy(false)
    }
  }

  const remove = async (id: number) => {
    if (!confirm('Удалить эту карточку?')) return
    setBusy(true)
    try {
      await apiJson<{ ok: boolean }>(`/bento.php?id=${id}`, {
        method: 'DELETE',
      })
      toast.success('Удалено')
      if (editId === id) {
        const list = await refresh()
        resetForm(list)
      } else {
        await refresh()
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ошибка')
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid3x3 className="size-5 text-accent-violet" aria-hidden />
            Карточки «Что делаем на занятиях»
          </CardTitle>
          <CardDescription>Загрузка…</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Grid3x3 className="size-5 text-accent-violet" aria-hidden />
          Карточки «Что делаем на занятиях»
        </CardTitle>
        <CardDescription>
          Иконка — только SVG (вставьте код целиком). Фото фона карточки и текст
          заголовка/описания. Ширина: одна или две колонки сетки на десктопе.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <form
          className="space-y-4 rounded-xl border border-white/10 bg-white/[0.02] p-4"
          onSubmit={saveCard}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-zinc-200">
              {editId !== null ? `Редактирование #${editId}` : 'Новая карточка'}
            </p>
            {editId !== null ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-zinc-400"
                onClick={() => resetForm(cards)}
              >
                Отменить
              </Button>
            ) : null}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="bento-sort">Порядок (sort)</Label>
              <Input
                id="bento-sort"
                type="number"
                min={0}
                max={9999}
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bento-layout">Ширина в сетке</Label>
              <select
                id="bento-layout"
                value={layout}
                onChange={(e) =>
                  setLayout(e.target.value === 'wide' ? 'wide' : 'normal')
                }
                className="flex h-10 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none ring-offset-studio-bg focus-visible:ring-2 focus-visible:ring-accent-violet"
              >
                <option value="normal">Одна колонка</option>
                <option value="wide">Две колонки (широкая)</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bento-title">Заголовок</Label>
            <Input
              id="bento-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bento-body">Текст</Label>
            <Textarea
              id="bento-body"
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bento-svg">Иконка (SVG)</Label>
            <p className="text-xs text-zinc-500">
              Вставьте полный код SVG (можно{' '}
              <code className="text-zinc-400">currentColor</code> для цвета).
            </p>
            <Textarea
              id="bento-svg"
              rows={8}
              value={iconSvg}
              onChange={(e) => setIconSvg(e.target.value)}
              className="font-mono text-xs"
              spellCheck={false}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={imgFieldId}>Фото фона</Label>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="secondary"
                disabled={busy || imgBusy}
                className="relative"
                asChild
              >
                <label className="cursor-pointer">
                  <ImagePlus className="mr-2 size-4" aria-hidden />
                  {imgBusy ? 'Загрузка…' : 'Выбрать изображение'}
                  <input
                    id={imgFieldId}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={onImageFile}
                    disabled={busy || imgBusy}
                  />
                </label>
              </Button>
              {imagePath ? (
                <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] p-1.5 pr-2">
                  <img
                    src={imagePath}
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
                    onClick={() => setImagePath(null)}
                    aria-label="Убрать фото"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={busy}>
              {editId !== null ? (
                'Сохранить'
              ) : (
                <>
                  <Plus className="mr-2 size-4" />
                  Добавить
                </>
              )}
            </Button>
          </div>
        </form>

        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-3 py-3 font-medium">Порядок</th>
                <th className="px-3 py-3 font-medium">Фото</th>
                <th className="px-3 py-3 font-medium">Заголовок</th>
                <th className="px-3 py-3 font-medium">Сетка</th>
                <th className="w-32 px-2 py-3 text-right font-medium">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {cards.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-zinc-500"
                  >
                    Нет карточек (на сайте показывается запасной вариант)
                  </td>
                </tr>
              ) : (
                cards.map((c) => (
                  <tr key={c.id} className="hover:bg-white/[0.02]">
                    <td className="whitespace-nowrap px-3 py-3 text-zinc-400">
                      {c.sort_order}
                    </td>
                    <td className="px-2 py-2">
                      {c.image ? (
                        <img
                          src={c.image}
                          alt=""
                          className="mx-auto h-10 w-14 rounded-md border border-white/10 object-cover"
                          width={56}
                          height={40}
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>
                    <td className="max-w-[14rem] truncate px-3 py-3 font-medium text-zinc-100">
                      {c.title}
                    </td>
                    <td className="px-3 py-3 text-zinc-400">
                      {c.layout === 'wide' ? '2 колонки' : '1 колонка'}
                    </td>
                    <td className="px-2 py-3 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-zinc-400 hover:bg-white/10 hover:text-white"
                        onClick={() => startEdit(c)}
                        aria-label="Редактировать"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                        onClick={() => void remove(c.id)}
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
  )
}
