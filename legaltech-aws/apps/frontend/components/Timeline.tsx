import { CheckCircle2, Circle, Clock } from "lucide-react";

import { formatDate } from "@/lib/formatters";
import type { TimelineEvent } from "@/types";
import { cn } from "@/lib/cn";

type TimelineProps = {
  events: TimelineEvent[];
};

export function Timeline({ events }: TimelineProps) {
  if (events.length === 0) {
    return (
      <p className="text-sm text-slate-400 py-4">Nenhum evento na timeline.</p>
    );
  }

  return (
    <ol className="relative space-y-0">
      {events.map((event, idx) => {
        const isLast = idx === events.length - 1;
        const isCurrent = isLast;

        return (
          <li className="flex gap-4" key={event.id}>
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition",
                  isCurrent
                    ? "border-brand-blue bg-brand-blue/20 text-brand-blue shadow-glow"
                    : "border-white/[0.12] bg-white/[0.04] text-slate-400"
                )}
              >
                {isCurrent ? (
                  <Clock className="text-brand-blue" size={14} />
                ) : (
                  <CheckCircle2 className="text-teal-400" size={14} />
                )}
              </div>
              {!isLast && (
                <div className="mt-1 h-full w-px bg-white/[0.08]" />
              )}
            </div>

            <div className={cn("min-w-0 pb-6", isLast && "pb-0")}>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "text-sm font-semibold",
                    isCurrent ? "text-white" : "text-slate-200"
                  )}
                >
                  {event.label}
                </span>
                {isCurrent && (
                  <span className="rounded-full bg-brand-blue/20 px-2 py-0.5 text-[10px] font-semibold text-brand-blue-light">
                    Atual
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-slate-400">{event.description}</p>
              <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-500">
                <span>{event.actor}</span>
                <span>·</span>
                <span>{formatDate(event.createdAt)}</span>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
