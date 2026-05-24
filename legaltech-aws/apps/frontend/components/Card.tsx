import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type CardProps = {
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  description?: string;
  title?: string;
};

export function Card({
  actions,
  children,
  className,
  description,
  title
}: CardProps) {
  return (
    <section
      className={cn(
        "rounded-lg border border-slate-200 bg-white p-5 shadow-panel",
        className
      )}
    >
      {(title || description || actions) && (
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {title && <h2 className="text-base font-semibold text-ink">{title}</h2>}
            {description && (
              <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
            )}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}
