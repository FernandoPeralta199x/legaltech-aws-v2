import type { Priority } from "@/types";
import { cn } from "@/lib/cn";

const config: Record<Priority, { label: string; className: string }> = {
  low: { label: "Baixa", className: "border-slate-200 bg-slate-100 text-slate-700" },
  normal: { label: "Normal", className: "border-blue-200 bg-blue-50 text-blue-700" },
  high: { label: "Alta", className: "border-amber-200 bg-amber-50 text-amber-700" },
  urgent: { label: "Urgente", className: "border-red-200 bg-red-50 text-red-700 animate-pulse" }
};

type PriorityBadgeProps = {
  priority: Priority;
  className?: string;
};

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const cfg = config[priority];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold",
        cfg.className,
        className
      )}
    >
      {cfg.label}
    </span>
  );
}
