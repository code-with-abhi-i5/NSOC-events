import { cn } from "@/lib/utils";

export function PageLoader({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center min-h-[50vh]",
        className
      )}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="relative h-10 w-10">
          <div className="absolute inset-0 rounded-full border-2 border-muted" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
        </div>
        <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
      </div>
    </div>
  );
}
