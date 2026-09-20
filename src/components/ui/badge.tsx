import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[12px] font-normal transition-colors leading-none tracking-normal select-none",
  {
    variants: {
      variant: {
        default:
          "border-hairline bg-surface-2 text-ink-muted",
        secondary:
          "border-hairline bg-surface-1 text-ink-subtle hover:text-ink hover:bg-surface-2",
        primary:
          "border-primary/30 bg-primary/10 text-primary-hover font-medium",
        success:
          "border-semantic-success/30 bg-semantic-success/10 text-semantic-success",
        outline:
          "border-hairline text-ink-muted bg-transparent",
        destructive:
          "border-destructive/30 bg-destructive/10 text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
