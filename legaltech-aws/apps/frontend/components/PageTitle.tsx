import type { ReactNode } from "react";

type PageTitleProps = {
  actions?: ReactNode;
  description?: string;
  eyebrow?: string;
  title: string;
};

export function PageTitle({ actions, description, eyebrow, title }: PageTitleProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        {eyebrow && (
          <p className="text-sm font-semibold uppercase text-registry">{eyebrow}</p>
        )}
        <h1 className="mt-1 text-3xl font-semibold text-ink">{title}</h1>
        {description && (
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
