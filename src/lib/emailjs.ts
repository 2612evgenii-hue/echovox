/**
 * EmailJS — письмо на почту при отправке формы (дополнительно к записи в БД через `/api/contact.php`).
 *
 * Куда вписать ключи:
 * 1. Скопируйте `.env.example` → `.env` в корне репозитория (рядом с `package.json`).
 * 2. Заполните три переменные `VITE_EMAILJS_*` значениями из кабинета EmailJS
 *    (Service ID, Template ID, Public Key).
 * 3. Перезапустите `npm run dev` — Vite подхватывает `.env` только при старте.
 *
 * Шаблон в EmailJS: переменные `{{name}}`, `{{phone}}`, `{{message}}`.
 */

const serviceId =
  (import.meta.env.VITE_EMAILJS_SERVICE_ID as string | undefined)?.trim() ?? ''
const templateId =
  (import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string | undefined)?.trim() ??
  ''
const publicKey =
  (import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string | undefined)?.trim() ?? ''

export const EMAILJS_CONFIG = {
  serviceId: serviceId || 'YOUR_SERVICE_ID',
  templateId: templateId || 'YOUR_TEMPLATE_ID',
  publicKey: publicKey || 'YOUR_PUBLIC_KEY',
} as const

export function isEmailJsConfigured(): boolean {
  return (
    serviceId.length > 0 &&
    templateId.length > 0 &&
    publicKey.length > 0
  )
}
