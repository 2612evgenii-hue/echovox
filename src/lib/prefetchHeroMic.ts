/** Префетч чанка с Three.js во время сплэша — после закрытия заставки модель монтируется быстрее. */
export function prefetchHeroMicrophoneModel(): void {
  void import('@/components/3d/MicrophoneModel')
}
