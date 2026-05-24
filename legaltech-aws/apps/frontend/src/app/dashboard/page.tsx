import { Activity, ClipboardCheck, FileClock, UsersRound } from "lucide-react";

import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { PageTitle } from "@/components/PageTitle";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate } from "@/lib/formatters";
import { mockCases, mockDocuments } from "@/lib/mockData";

const metrics = [
  {
    label: "Casos em processamento",
    value: mockCases.filter((item) => item.status === "processing").length,
    detail: "Jobs locais/mock preparados",
    icon: Activity
  },
  {
    label: "Em revisao humana",
    value: mockCases.filter((item) => item.status === "review").length,
    detail: "Etapa obrigatoria futura",
    icon: ClipboardCheck
  },
  {
    label: "Documentos processados",
    value: mockDocuments.filter((item) => item.status === "processed").length,
    detail: "Chunks e embeddings fake",
    icon: FileClock
  },
  {
    label: "Clientes ativos",
    value: 2,
    detail: "Dados demonstrativos",
    icon: UsersRound
  }
];

export default function DashboardPage() {
  return (
    <AppLayout>
      <PageTitle
        actions={
          <>
            <Button href="/clients" variant="secondary">
              Clientes
            </Button>
            <Button href="/cases">Casos</Button>
          </>
        }
        description="Painel de acompanhamento para o fluxo juridico do MVP. Sem chamadas reais ao backend nesta etapa."
        eyebrow="Dashboard"
        title="Resumo da operacao"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <Card key={metric.label}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-600">{metric.label}</p>
                  <p className="mt-3 text-3xl font-semibold text-ink">
                    {metric.value}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">{metric.detail}</p>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-ink">
                  <Icon aria-hidden="true" size={19} />
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.85fr]">
        <Card
          description="Status mockado dos casos mais recentes."
          title="Fila de casos"
        >
          <div className="divide-y divide-slate-100">
            {mockCases.map((item) => (
              <div
                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                key={item.id}
              >
                <div>
                  <p className="text-sm font-semibold text-ink">{item.code}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {item.caseType} · {item.clientName}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm text-slate-500">
                    {formatDate(item.updatedAt)}
                  </span>
                  <StatusBadge status={item.status} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <EmptyState
          action={
            <Button href="/documents" variant="secondary">
              Ver documentos
            </Button>
          }
          description="A proxima etapa pode conectar agent_executions, audit_log e status de processamento real."
          title="Sem pendencias bloqueantes"
        />
      </div>
    </AppLayout>
  );
}
