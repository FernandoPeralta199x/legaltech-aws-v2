import { cn } from "@/lib/cn";
import { formatStatusLabel } from "@/lib/formatters";
import type { CaseStatus, ClientStatus, DocumentStatus, RiskLevel } from "@/types";

type StatusBadgeProps = {
  status: CaseStatus | ClientStatus | DocumentStatus | RiskLevel;
  tone?: "status" | "risk";
};

const statusClasses: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  completed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  draft: "bg-slate-50 text-slate-700 ring-slate-200",
  failed: "bg-rose-50 text-rose-700 ring-rose-200",
  high: "bg-rose-50 text-rose-700 ring-rose-200",
  inactive: "bg-slate-100 text-slate-600 ring-slate-200",
  low: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  medium: "bg-amber-50 text-amber-700 ring-amber-200",
  pending_upload: "bg-amber-50 text-amber-700 ring-amber-200",
  processed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  processing: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  review: "bg-violet-50 text-violet-700 ring-violet-200",
  submitted: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  uploaded: "bg-cyan-50 text-cyan-700 ring-cyan-200"
};

const riskLabels: Record<RiskLevel, string> = {
  high: "Risco alto",
  low: "Risco baixo",
  medium: "Risco moderado"
};

export function StatusBadge({ status, tone = "status" }: StatusBadgeProps) {
  const label =
    tone === "risk"
      ? riskLabels[status as RiskLevel]
      : formatStatusLabel(status as CaseStatus | ClientStatus | DocumentStatus);

  return (
    <span
      className={cn(
        "inline-flex min-h-6 items-center rounded-full px-2.5 text-xs font-semibold ring-1 ring-inset",
        statusClasses[status] ?? "bg-slate-50 text-slate-700 ring-slate-200"
      )}
    >
      {label}
    </span>
  );
}
