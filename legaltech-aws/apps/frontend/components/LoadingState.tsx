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
      <div className="inline-flex items-center gap-2 text-xs text-slate-400">
        <LoaderCircle aria-hidden="true" className="animate-spin text-brand-blue-light" size={14} />
        {label}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-blue/20 bg-brand-blue/10 text-brand-blue-light">
          <LoaderCircle aria-hidden="true" className="animate-spin" size={18} />
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-200">{label}</p>
          {description && (
            <p className="mt-0.5 text-xs leading-5 text-slate-500">{description}</p>
          )}
        </div>
      </div>
      <div className="mt-5 space-y-3" aria-hidden="true">
        {Array.from({ length: rows }).map((_, index) => (
          <div className="flex items-center gap-3" key={index}>
            <div className="h-9 w-9 rounded-xl bg-white/[0.06]" />
            <div className="flex-1 space-y-2">
              <div className={cn("h-2.5 rounded-full bg-white/[0.08]", index === 0 ? "w-2/3" : "w-1/2")} />
              <div className="h-2 rounded-full bg-white/[0.05] w-4/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
