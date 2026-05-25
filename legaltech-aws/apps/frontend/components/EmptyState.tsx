import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type EmptyStateProps = {
  action?: ReactNode;
  className?: string;
  description: string;
  icon?: ReactNode;
  secondaryAction?: ReactNode;
  title: string;
  variant?: "compact" | "panel";
};

export function EmptyState({
  action,
  className,
  description,
  icon,
  secondaryAction,
  title,
  variant = "panel"
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.08] bg-white/[0.02] text-center",
        variant === "compact" ? "min-h-32 p-5" : "min-h-48 p-8",
        className
      )}
    >
      {icon && (
        <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-slate-400">
          {icon}
        </span>
      )}
      <h2 className="text-sm font-semibold text-slate-200">{title}</h2>
      <p className="mt-2 max-w-md text-xs leading-5 text-slate-400">{description}</p>
      {(action || secondaryAction) && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
