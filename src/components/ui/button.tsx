import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-[8px] text-[14px] font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-focus disabled:pointer-events-none disabled:opacity-40 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-on-primary hover:bg-primary-hover active:bg-primary-focus",
        secondary:
          "bg-surface-1 text-ink border border-hairline hover:bg-surface-2 hover:border-hairline-strong active:bg-surface-3",
        outline:
          "border border-hairline bg-transparent text-ink hover:bg-surface-1 hover:border-hairline-strong active:bg-surface-2",
        ghost:
          "text-ink-muted hover:text-ink hover:bg-surface-2 active:bg-surface-3",
        link: "text-primary hover:underline hover:text-primary-hover underline-offset-4",
        destructive:
          "bg-destructive text-destructive-foreground hover:opacity-90 active:opacity-100",
      },
      size: {
        default: "h-9 px-3.5 py-2",
        sm: "h-8 rounded-[6px] px-3 text-[13px]",
        lg: "h-11 rounded-[8px] px-6 text-[15px]",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
