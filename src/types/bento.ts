export type BentoLayout = 'normal' | 'wide'

export type BentoCard = {
  id: number
  sort_order: number
  title: string
  body: string
  icon_svg: string
  image: string | null
  layout: BentoLayout | string
}
