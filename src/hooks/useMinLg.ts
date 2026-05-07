import { useSyncExternalStore } from 'react'

/** Совпадает с Tailwind `lg:` (1024px). На SSR — false. */
const QUERY = '(min-width: 1024px)'

function subscribe(onStoreChange: () => void) {
  const mq = window.matchMedia(QUERY)
  mq.addEventListener('change', onStoreChange)
  return () => mq.removeEventListener('change', onStoreChange)
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches
}

function getServerSnapshot() {
  return false
}

export function useMinLg() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
