import { useState } from 'react'
import emailjs from '@emailjs/browser'
import { toast } from 'sonner'
import { Reveal } from '@/components/animations/Reveal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { apiJson } from '@/lib/api'
import { EMAILJS_CONFIG, isEmailJsConfigured } from '@/lib/emailjs'
import { isValidRuPhone } from '@/lib/phone'

type FormState = {
  name: string
  phone: string
  message: string
}

const initial: FormState = { name: '', phone: '', message: '' }

export function ContactSection() {
  const [form, setForm] = useState<FormState>(initial)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>(
    {},
  )
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const next: Partial<Record<keyof FormState, string>> = {}
    if (!form.name.trim()) next.name = 'Укажите имя'
    if (!isValidRuPhone(form.phone))
      next.phone = 'Введите корректный номер РФ'
    if (!form.message.trim()) next.message = 'Напишите пару строк о запросе'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) {
      toast.error('Проверьте поля формы')
      return
    }
    setLoading(true)
    try {
      await apiJson<{ ok: boolean }>('/contact.php', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          message: form.message.trim(),
        }),
      })
      if (isEmailJsConfigured()) {
        try {
          await emailjs.send(
            EMAILJS_CONFIG.serviceId,
            EMAILJS_CONFIG.templateId,
            {
              name: form.name.trim(),
              phone: form.phone.trim(),
              message: form.message.trim(),
            },
            { publicKey: EMAILJS_CONFIG.publicKey },
          )
        } catch {
          /* письмо не ушло, заявка в БД уже сохранена */
        }
      }
      toast.success('Сообщение отправлено')
      setForm(initial)
      setErrors({})
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ошибка отправки')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="contact" className="scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-start">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent-violet">
            Запись
          </p>
          <h2 className="mt-3 font-display text-3xl font-black tracking-tight text-white sm:text-4xl">
            Запишитесь на пробное занятие
          </h2>
          <p className="mt-4 text-zinc-400">
            Оставьте контакты, мы перезвоним, уточним цели и договоримся о времени.
            Телефон:{' '}
            <a
              href="tel:+79042313359"
              className="font-semibold text-accent-gold hover:underline"
            >
              8 904 231 33 59
            </a>
            .{' '}
            <a
              href="https://vk.com/echovox"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-accent-violet hover:underline"
            >
              ВКонтакте
            </a>
            .
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          <form
            onSubmit={onSubmit}
            className="glass space-y-5 rounded-3xl p-6 sm:p-8"
            noValidate
          >
            <div className="space-y-2">
              <Label htmlFor="name">Имя</Label>
              <Input
                id="name"
                name="name"
                autoComplete="name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                aria-invalid={!!errors.name}
              />
              {errors.name ? (
                <p className="text-xs text-red-400">{errors.name}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Телефон</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+7 904 231-33-59"
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                aria-invalid={!!errors.phone}
              />
              {errors.phone ? (
                <p className="text-xs text-red-400">{errors.phone}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Сообщение</Label>
              <Textarea
                id="message"
                name="message"
                rows={4}
                value={form.message}
                onChange={(e) =>
                  setForm((f) => ({ ...f, message: e.target.value }))
                }
                aria-invalid={!!errors.message}
              />
              {errors.message ? (
                <p className="text-xs text-red-400">{errors.message}</p>
              ) : null}
            </div>
            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={loading}
            >
              {loading ? 'Отправка…' : 'Отправить'}
            </Button>
          </form>
        </Reveal>
      </div>
    </section>
  )
}
