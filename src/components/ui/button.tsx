import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold tracking-wide transition-[transform,box-shadow,background-color,border-color,color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-studio-bg disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'border border-violet-500/30 bg-[linear-gradient(165deg,rgba(24,24,27,0.98)_0%,rgba(9,9,11,0.99)_45%,rgba(15,10,28,0.98)_100%)] text-zinc-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_0_1px_rgba(139,92,246,0.12),0_14px_40px_-16px_rgba(0,0,0,0.75)] hover:border-violet-400/45 hover:text-white hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.09),0_0_0_1px_rgba(167,139,250,0.22),0_20px_48px_-14px_rgba(139,92,246,0.35)] hover:-translate-y-px active:translate-y-0',
        secondary:
          'glass border-white/10 text-zinc-100 hover:border-white/18 hover:bg-white/[0.08] hover:-translate-y-px active:translate-y-0',
        ghost:
          'text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-100 active:translate-y-0',
        outlineGold:
          'border border-amber-400/28 bg-transparent text-amber-100/95 hover:border-amber-300/45 hover:bg-amber-400/[0.06] hover:text-amber-50 active:translate-y-0',
      },
      size: {
        default: 'h-11 px-5 py-2',
        sm: 'h-9 rounded-lg px-3',
        lg: 'h-12 rounded-xl px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button }
