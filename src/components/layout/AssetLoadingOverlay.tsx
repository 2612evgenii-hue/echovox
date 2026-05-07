/**
 * Фаза после таймера сплэша, пока сплэш ещё анимируется выход: закрывает страницу (z под сплэшем).
 * Контент под слоем уже монтируется (WebGL); лаги здесь не видны.
 */
export function AssetLoadingOverlay() {
  return (
    <div
      className="pointer-events-auto fixed inset-0 z-[540] flex flex-col items-center justify-center bg-[#09090B]"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex w-[min(18rem,72vw)] flex-col items-center gap-5 px-6">
        <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.08]">
          <div className="echovox-asset-load-bar h-full w-[38%] rounded-full bg-gradient-to-r from-accent-violet/50 via-accent-violet to-accent-violet/50" />
        </div>
        <p className="text-center font-display text-[11px] font-semibold uppercase tracking-[0.35em] text-zinc-500">
          Загрузка студии…
        </p>
      </div>
    </div>
  )
}
