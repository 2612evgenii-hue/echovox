import { createContext, useContext } from 'react'

/**
 * `true` только после полного завершения exit-анимации сплэша (`onExitComplete`).
 * Тогда монтируется WebGL в hero — не во время сдвига шторы, чтобы не лагало.
 */
export const SplashDismissedContext = createContext(false)

export function useSplashDismissed() {
  return useContext(SplashDismissedContext)
}

/** Сигнал «hero WebGL готов» — убираем экран «Загрузка». */
export const SplashMicSignalContext = createContext<(() => void) | null>(null)

export function useSplashMicSignal() {
  return useContext(SplashMicSignalContext)
}

/** Не проигрывать entrance layout-пока desktop главная ждёт модель */
export const BootRevealContext = createContext(false)

export function useBootRevealSuppressIntro() {
  return useContext(BootRevealContext)
}
