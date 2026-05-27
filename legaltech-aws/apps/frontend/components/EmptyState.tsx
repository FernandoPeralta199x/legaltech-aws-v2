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
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-center dark:border-slate-700 dark:bg-slate-900/70",
        variant === "compact" ? "min-h-32 p-5" : "min-h-48 p-8",
        className
      )}
    >
      {icon && (
        <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400">
          {icon}
        </span>
      )}
      <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
      <p className="mt-2 max-w-md text-xs leading-5 text-slate-600 dark:text-slate-400">{description}</p>
      {(action || secondaryAction) && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
