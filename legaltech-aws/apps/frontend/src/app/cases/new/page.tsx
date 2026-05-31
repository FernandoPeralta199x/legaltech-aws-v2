import { AppLayout } from "@/components/AppLayout";
import { AuthGuard } from "@/components/AuthGuard";
import { NewCaseWizard } from "@/components/cases/wizard/NewCaseWizard";

export default function NewCasePage() {
  return (
    <AuthGuard>
      <AppLayout>
        <section className="mx-auto mb-6 w-full max-w-3xl rounded-lg border border-[var(--bd)] bg-[var(--surf2)] px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text2)]">
            Fluxo novo - MVP local
          </p>
          <p className="mt-1 text-xs leading-5 text-[var(--text2)]">
            Este wizard é experimental, usa apenas dados fictícios e ainda não faz
            submit real nem integra o backend novo da ADR-001.
          </p>
        </section>
        <NewCaseWizard />
      </AppLayout>
    </AuthGuard>
  );
}
