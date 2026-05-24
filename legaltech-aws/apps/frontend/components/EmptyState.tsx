import type { ReactNode } from "react";

type EmptyStateProps = {
  action?: ReactNode;
  description: string;
  title: string;
};

export function EmptyState({ action, description, title }: EmptyStateProps) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.08] bg-white/[0.02] p-8 text-center">
      <h2 className="text-sm font-semibold text-slate-200">{title}</h2>
      <p className="mt-2 max-w-md text-xs leading-5 text-slate-400">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
