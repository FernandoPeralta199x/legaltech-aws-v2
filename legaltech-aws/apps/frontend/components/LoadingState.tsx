import { LoaderCircle } from "lucide-react";

import { cn } from "@/lib/cn";

type LoadingStateProps = {
  description?: string;
  label?: string;
  rows?: number;
  variant?: "panel" | "inline";
};

export function LoadingState({
  description,
  label = "Carregando...",
  rows = 3,
  variant = "panel"
}: LoadingStateProps) {
  if (variant === "inline") {
    return (
      <div className="inline-flex items-center gap-2 text-xs text-slate-600">
        <LoaderCircle aria-hidden="true" className="animate-spin text-brand-teal" size={14} />
        {label}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-card-rest">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-brand-teal">
          <LoaderCircle aria-hidden="true" className="animate-spin" size={18} />
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-900">{label}</p>
          {description && (
            <p className="mt-0.5 text-xs leading-5 text-slate-500">{description}</p>
          )}
        </div>
      </div>
      <div className="mt-5 space-y-3" aria-hidden="true">
        {Array.from({ length: rows }).map((_, index) => (
          <div className="flex items-center gap-3" key={index}>
            <div className="h-9 w-9 rounded-lg bg-slate-100" />
            <div className="flex-1 space-y-2">
              <div className={cn("h-2.5 rounded-full bg-slate-200", index === 0 ? "w-2/3" : "w-1/2")} />
              <div className="h-2 rounded-full bg-slate-100 w-4/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
