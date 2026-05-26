import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type CardProps = {
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
  description?: string;
  /** Adds a blue glow shadow */
  glow?: boolean;
  /** Enables hover lift + border brightening */
  interactive?: boolean;
  title?: string;
};

export function Card({
  actions,
  children,
  className,
  description,
  glow,
  interactive,
  title
}: CardProps) {
  return (
    <section
      className={cn(
        /* Base */
        "rounded-lg border border-slate-200 p-5",
        /* Background: subtle gradient + inner highlight via box-shadow */
        "bg-white",
        "shadow-card-rest",
        /* Transition */
        "transition-all duration-base ease-smooth",
        /* Glow */
        glow && "shadow-glow",
        /* Interactive hover lift */
        interactive &&
          "cursor-pointer hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-card-hover",
        className
      )}
    >
      {(title || description || actions) && (
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {title && (
              <h2 className="text-sm font-semibold leading-snug text-slate-900">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-0.5 text-xs leading-5 text-slate-500">{description}</p>
            )}
          </div>
          {actions && (
            <div className="flex shrink-0 items-center gap-2">{actions}</div>
          )}
        </div>
      )}
      {children}
    </section>
  );
}
