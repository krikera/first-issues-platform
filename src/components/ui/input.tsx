import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-[8px] border border-hairline bg-surface-1 px-3 py-2 text-[14px] text-ink placeholder:text-ink-subtle transition-all duration-150 focus-visible:outline-none focus-visible:border-hairline-strong focus-visible:ring-1 focus-visible:ring-primary-focus disabled:cursor-not-allowed disabled:opacity-40",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
