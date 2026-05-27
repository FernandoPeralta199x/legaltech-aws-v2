import { AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";

type ErrorStateProps = {
  action?: ReactNode;
  description: string;
  details?: string;
  title?: string;
};

export function ErrorState({
  action,
  description,
  details,
  title = "Não foi possível carregar os dados"
}: ErrorStateProps) {
  return (
    <section className="rounded-lg border border-red-200 bg-red-50 p-5 dark:border-red-900/60 dark:bg-red-950/30">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-red-200 bg-white text-red-600 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            <AlertTriangle aria-hidden="true" size={18} />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-red-900 dark:text-red-200">{title}</h2>
            <p className="mt-1 text-xs leading-5 text-red-800 dark:text-red-300">{description}</p>
            {details && (
              <p className="mt-2 break-words rounded-lg border border-red-200 bg-white px-3 py-2 text-[11px] leading-5 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                {details}
              </p>
            )}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </section>
  );
}
