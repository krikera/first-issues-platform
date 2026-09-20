import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
  variant?: "text" | "card" | "avatar";
}

export const LoadingSkeleton = ({
  className,
  variant = "text",
}: LoadingSkeletonProps) => {
  const variantClasses = {
    text: "h-4 w-full",
    card: "h-24 w-full",
    avatar: "h-10 w-10 rounded-full",
  };

  return (
    <div
      className={cn(
        "animate-pulse bg-surface-2/60 rounded-[6px]",
        variantClasses[variant],
        className
      )}
    />
  );
};

export const IssueCardSkeleton = () => (
  <div className="linear-card p-5 space-y-4">
    <div className="flex justify-between items-start gap-4">
      <div className="space-y-2 flex-1">
        <LoadingSkeleton className="h-6 w-3/4" />
        <div className="flex items-center gap-2">
          <LoadingSkeleton className="h-3.5 w-32" />
          <LoadingSkeleton className="h-3.5 w-24" />
        </div>
      </div>
      <LoadingSkeleton className="h-7 w-7 rounded-[6px]" />
    </div>

    <div className="flex items-center gap-3 pt-2">
      <LoadingSkeleton className="h-5 w-16 rounded-[4px]" />
      <LoadingSkeleton className="h-5 w-24 rounded-[4px]" />
      <div className="ml-auto flex gap-3">
        <LoadingSkeleton className="h-3.5 w-12" />
        <LoadingSkeleton className="h-3.5 w-12" />
      </div>
    </div>
  </div>
);
