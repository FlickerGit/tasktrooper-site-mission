import { cn } from "@/lib/utils";
import { STATUS_BADGE, STATUS_LABEL, type JobStatus } from "@/lib/jobs";

export const StatusBadge = ({ status, className }: { status: JobStatus; className?: string }) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
      STATUS_BADGE[status],
      className,
    )}
  >
    {STATUS_LABEL[status]}
  </span>
);