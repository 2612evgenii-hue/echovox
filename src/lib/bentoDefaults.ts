import defaults from '../../data/bento-defaults.json'
import type { BentoCard } from '@/types/bento'

/** Подставляет иконки Lucide и фоны `/bento-default/im*.jpeg`, если API отдал старый сид (круг, без картинки). */
export function enrichBentoCards(cards: BentoCard[]): BentoCard[] {
  const placeholder = defaults.placeholderIconSvg
  const seeds = defaults.seedCards

  return cards.map((card) => {
    const seed = seeds[card.sort_order]
    if (!seed) return card

    const staleIcon = card.icon_svg.trim() === placeholder
    const noImage = !card.image?.trim()
    if (staleIcon && noImage) {
      return {
        ...card,
        icon_svg: seed.iconSvg,
        image: seed.image,
      }
    }
    return card
  })
}
