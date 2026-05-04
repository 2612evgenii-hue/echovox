/** Поддержка scroll-driven CSS-анимаций (композитор, без лишнего JS). */
let scrollTimelineSupported: boolean | null = null

export function supportsScrollTimeline(): boolean {
  if (scrollTimelineSupported !== null) return scrollTimelineSupported
  if (typeof CSS === 'undefined' || !CSS.supports) {
    scrollTimelineSupported = false
    return false
  }
  scrollTimelineSupported =
    CSS.supports('(animation-timeline: scroll(root block))') ||
    CSS.supports('animation-timeline', 'scroll(root block)')
  return scrollTimelineSupported
}
