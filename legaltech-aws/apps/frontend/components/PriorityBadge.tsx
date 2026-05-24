import type { Priority } from "@/types";
import { cn } from "@/lib/cn";

const config: Record<Priority, { label: string; className: string }> = {
  low: { label: "Baixa", className: "bg-slate-500/10 text-slate-400" },
  normal: { label: "Normal", className: "bg-blue-500/10 text-blue-300" },
  high: { label: "Alta", className: "bg-amber-500/10 text-amber-300" },
  urgent: { label: "Urgente", className: "bg-red-500/10 text-red-300 animate-pulse" }
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
        "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold",
        cfg.className,
        className
      )}
    >
      {cfg.label}
    </span>
  );
}
