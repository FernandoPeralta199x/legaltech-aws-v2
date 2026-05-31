"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { WizardProgress } from "./WizardProgress";

type WizardShellProps = {
  title: string;
  step: number;
  totalSteps: number;
  backHref?: string;
  backLabel?: string;
  children: ReactNode;
};

export function WizardShell({
  title,
  step,
  totalSteps,
  backHref,
  backLabel = "Voltar para casos",
  children
}: WizardShellProps) {
  return (
    <div className="mx-auto w-full max-w-3xl">
      {backHref && (
        <Link
          className="mb-4 inline-flex items-center gap-1.5 text-xs text-[var(--text2)] transition hover:text-[var(--text)]"
          href={backHref}
        >
          <ArrowLeft size={14} />
          {backLabel}
        </Link>
      )}

      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-[1.75rem] font-bold leading-tight tracking-tight text-[var(--text)]">
            {title}
          </h1>
          <p className="mt-1 text-xs text-[var(--text2)]">
            Etapa {step} de {totalSteps}
          </p>
        </div>
      </div>

      <WizardProgress className="mt-5" current={step} total={totalSteps} />

      <div className="mt-8 animate-in">{children}</div>
    </div>
  );
}
