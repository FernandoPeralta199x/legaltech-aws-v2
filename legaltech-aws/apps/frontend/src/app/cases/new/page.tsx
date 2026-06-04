import { AppLayout } from "@/components/AppLayout";
import { AuthGuard } from "@/components/AuthGuard";
import { NewCaseWizard } from "@/components/cases/wizard/NewCaseWizard";

export default function NewCasePage() {
  return (
    <AuthGuard>
      <AppLayout>
        <section className="mx-auto mb-6 w-full max-w-3xl rounded-lg border border-[var(--bd)] bg-[var(--surf2)] px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--teal)]">
            Novo Pedido - MVP local
          </p>
          <h1 className="mt-2 text-xl font-bold leading-tight text-[var(--text)]">
            Inicie o fluxo principal do MVP local
          </h1>
          <p className="mt-2 text-xs leading-5 text-[var(--text2)]">
            Este wizard guia a simulação frontend-first do pedido: partes,
            contrato, produto jurídico, módulos e revisão da simulação.
          </p>
          <p className="mt-2 text-[11px] leading-5 text-[var(--text3)]">
            Use apenas dados demonstrativos. Registrar a simulação não faz
            submit real nem cria caso real no backend; ao final você volta para
            Casos para acompanhar o MVP local.
          </p>
        </section>
        <NewCaseWizard />
      </AppLayout>
    </AuthGuard>
  );
}
