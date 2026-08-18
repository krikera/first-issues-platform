import { cn } from "@/lib/utils"

interface LoadingSkeletonProps {
  className?: string
  variant?: "text" | "card" | "avatar"
}

export const LoadingSkeleton = ({
  className,
  variant = "text",
}: LoadingSkeletonProps) => {
  const variantClasses = {
    text: "h-4 w-full",
    card: "h-24 w-full",
    avatar: "h-10 w-10 rounded-full",
  }

  return (
    <div
      className={cn(
        "animate-pulse bg-muted rounded",
        variantClasses[variant],
        className
      )}
    />
  )
}

export const IssueCardSkeleton = () => (
  <div className="p-5 border rounded-lg bg-card">
    <div className="flex justify-between items-start gap-4 mb-4">
      <div className="space-y-2 flex-1">
        <LoadingSkeleton className="h-7 w-3/4" />
        <div className="flex items-center gap-2">
          <LoadingSkeleton className="h-4 w-32" />
          <LoadingSkeleton className="h-4 w-24" />
        </div>
      </div>
      <LoadingSkeleton className="h-8 w-8 rounded-md" />
    </div>

    <div className="flex items-center gap-3 mt-4">
      <LoadingSkeleton className="h-6 w-16" />
      <LoadingSkeleton className="h-6 w-24" />
      <div className="ml-auto flex gap-3">
        <LoadingSkeleton className="h-4 w-12" />
        <LoadingSkeleton className="h-4 w-12" />
      </div>
    </div>
  </div>
)
