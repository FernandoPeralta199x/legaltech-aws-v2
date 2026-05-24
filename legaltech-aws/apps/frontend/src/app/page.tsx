import { ArrowRight, FileText, ShieldCheck, UsersRound } from "lucide-react";

import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { PageTitle } from "@/components/PageTitle";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate } from "@/lib/formatters";
import { mockCases, mockClients, mockDocuments } from "@/lib/mockData";

const overviewCards = [
  {
    label: "Clientes monitorados",
    value: mockClients.length,
    detail: "Base mockada para UI",
    icon: UsersRound
  },
  {
    label: "Casos ativos",
    value: mockCases.filter((item) => item.status !== "completed").length,
    detail: "Rascunho, revisao e processamento",
    icon: ShieldCheck
  },
  {
    label: "Documentos recentes",
    value: mockDocuments.length,
    detail: "Sem upload real nesta etapa",
    icon: FileText
  }
];

export default function HomePage() {
  const latestCase = mockCases[0];

  return (
    <AppLayout>
      <PageTitle
        actions={
          <Button href="/dashboard" icon={<ArrowRight aria-hidden="true" size={16} />}>
            Abrir dashboard
          </Button>
        }
        description="Base visual inicial para acompanhamento juridico, clientes, casos e documentos. Os dados abaixo sao demonstrativos e nao representam pessoas ou contratos reais."
        eyebrow="LegalTech AWS V2"
        title="Visao operacional"
      />

      <div className="grid gap-4 md:grid-cols-3">
        {overviewCards.map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.label}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-600">{item.label}</p>
                  <p className="mt-3 text-3xl font-semibold text-ink">{item.value}</p>
                  <p className="mt-2 text-sm text-slate-500">{item.detail}</p>
                </div>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-registry">
                  <Icon aria-hidden="true" size={21} />
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <Card
          actions={
            <Button href="/cases" variant="secondary">
              Ver casos
            </Button>
          }
          description="Casos mockados para validar layout e hierarquia de informacao."
          title="Caso em destaque"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-registry">{latestCase.code}</p>
              <h2 className="mt-1 text-xl font-semibold text-ink">
                {latestCase.caseType}
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                {latestCase.clientName} · {latestCase.documentsCount} documentos
              </p>
            </div>
            <StatusBadge status={latestCase.status} />
          </div>
          <div className="mt-5 h-2 rounded-full bg-slate-100">
            <div className="h-2 w-2/3 rounded-full bg-registry" />
          </div>
          <p className="mt-3 text-sm text-slate-500">
            Atualizado em {formatDate(latestCase.updatedAt)}
          </p>
        </Card>

        <EmptyState
          action={
            <Button href="/documents" variant="secondary">
              Ver documentos
            </Button>
          }
          description="Quando a integracao real estiver ativa, alertas de tenant, RBAC, auditoria e processamento aparecerao aqui."
          title="Nenhum alerta critico"
        />
      </div>
    </AppLayout>
  );
}
