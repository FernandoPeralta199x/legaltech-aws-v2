import type { ReactNode } from "react";

type PageTitleProps = {
  actions?: ReactNode;
  description?: string;
  eyebrow?: string;
  title: string;
};

export function PageTitle({ actions, description, eyebrow, title }: PageTitleProps) {
  return (
    <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="text-[10px] font-bold uppercase text-brand-teal">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1 text-[1.375rem] font-bold leading-tight text-slate-950 sm:text-[1.5rem]">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-slate-600">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
