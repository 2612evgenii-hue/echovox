/** Поддержка scroll-driven CSS-анимаций (композитор, без лишнего JS). */
export function supportsScrollTimeline(): boolean {
  if (typeof CSS === 'undefined' || !CSS.supports) return false
  return (
    CSS.supports('(animation-timeline: scroll(root block))') ||
    CSS.supports('animation-timeline', 'scroll(root block)')
  )
}
