const MAX_W = 1120
const WEBP_Q = 0.82
const JPEG_Q = 0.86

/** Сжимает и уменьшает обложку перед загрузкой на сервер. */
export async function optimizeNewsImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  try {
    let w = bitmap.width
    let h = bitmap.height
    if (w > MAX_W) {
      h = Math.round(h * (MAX_W / w))
      w = MAX_W
    }
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas недоступен')
    ctx.drawImage(bitmap, 0, 0, w, h)

    const webp = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/webp', WEBP_Q)
    })
    if (webp && webp.size > 0) return webp

    const jpeg = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/jpeg', JPEG_Q)
    })
    if (jpeg && jpeg.size > 0) return jpeg
    throw new Error('Не удалось сжать изображение')
  } finally {
    bitmap.close()
  }
}
