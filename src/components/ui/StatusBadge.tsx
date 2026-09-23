import { cva, type VariantProps } from "class-variance-authority";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-secondary text-secondary-foreground",
        success:
          "bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-400",
        warning:
          "bg-amber-500/10 text-amber-500 dark:bg-amber-500/20 dark:text-amber-400",
        danger:
          "bg-red-500/10 text-red-500 dark:bg-red-500/20 dark:text-red-400",
        info: "bg-blue-500/10 text-blue-500 dark:bg-blue-500/20 dark:text-blue-400",
        pending:
          "bg-gray-500/10 text-gray-500 dark:bg-gray-500/20 dark:text-gray-400",
        active:
          "bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-400",
        revoked:
          "bg-red-500/10 text-red-500 dark:bg-red-500/20 dark:text-red-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

// Convenience mapper for common statuses
const statusVariantMap: Record<string, VariantProps<typeof statusBadgeVariants>["variant"]> = {
  ACTIVE: "active",
  PENDING: "pending",
  REVOKED: "revoked",
  REISSUED: "info",
  CERTIFICATE_GENERATED: "success",
  EMAIL_SENT: "success",
  VERIFIED: "active",
  SENT: "success",
  DELIVERED: "success",
  BOUNCED: "warning",
  FAILED: "danger",
  DRAFT: "pending",
  QUEUED: "info",
  PROCESSING: "info",
  PAUSED: "warning",
  COMPLETED: "success",
  COMPLETED_WITH_ERRORS: "warning",
  EMAIL_PENDING: "pending",
  EMAIL_FAILED: "danger",
};

export function getStatusVariant(status: string): VariantProps<typeof statusBadgeVariants>["variant"] {
  return statusVariantMap[status] || "default";
}

export interface StatusBadgeProps extends VariantProps<typeof statusBadgeVariants> {
  label?: string;
  status?: string;
  icon?: LucideIcon;
  className?: string;
  dot?: boolean;
}

export function StatusBadge({
  label,
  status,
  icon: Icon,
  variant,
  className,
  dot = true,
}: StatusBadgeProps) {
  const resolvedVariant = variant || (status ? getStatusVariant(status) : "default");
  const displayLabel = label || (status ? status.replace(/_/g, " ") : "");

  return (
    <span className={cn(statusBadgeVariants({ variant: resolvedVariant }), className)}>
      {dot && !Icon && (
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
      )}
      {Icon && <Icon className="h-3 w-3" />}
      {displayLabel}
    </span>
  );
}
