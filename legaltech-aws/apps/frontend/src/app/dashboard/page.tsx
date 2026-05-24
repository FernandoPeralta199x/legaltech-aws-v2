import {
  ArrowRight,
  Bot,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  FileText,
  Plus,
  TrendingUp,
  UsersRound
} from "lucide-react";
import Link from "next/link";

import { AppLayout } from "@/components/AppLayout";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { PageTitle } from "@/components/PageTitle";
import { PriorityBadge } from "@/components/PriorityBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate } from "@/lib/formatters";
import { mockAgentExecutions, mockCases, mockDocuments, mockReports } from "@/lib/mockData";

const metrics = [
  {
    label: "Casos em análise",
    value: mockCases.filter((c) => !["draft", "delivered", "completed", "cancelled"].includes(c.status)).length,
    detail: "Processando ou em revisão",
    icon: BriefcaseBusiness,
    color: "text-brand-blue-light",
    bg: "bg-brand-blue/10 border-brand-blue/20"
  },
  {
    label: "Revisões humanas",
    value: mockCases.filter((c) => c.status === "revisao_humana" || c.status === "review").length,
    detail: "Aguardando analista",
    icon: ClipboardCheck,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10 border-yellow-500/20"
  },
  {
    label: "Relatórios aprovados",
    value: mockReports.filter((r) => r.status === "approved" || r.status === "delivered").length,
    detail: "Prontos para entrega",
    icon: CheckCircle2,
    color: "text-teal-400",
    bg: "bg-teal-500/10 border-teal-500/20"
  },
  {
    label: "Clientes ativos",
    value: 3,
    detail: "Dados demonstrativos",
    icon: UsersRound,
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/20"
  }
];

export default function DashboardPage() {
  const recentCases = mockCases.slice(0, 4);
  const activeAgents = mockAgentExecutions.filter((e) => e.status === "running");

  return (
    <AuthGuard>
      <AppLayout>
        <PageTitle
          actions={
            <Button href="/cases/new" icon={<Plus aria-hidden="true" size={15} />}>
              Novo caso
            </Button>
          }
          description="Visão geral dos casos, relatórios e atividade dos agentes."
          eyebrow="Dashboard"
          title="Painel operacional"
        />

        {/* Metrics */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((m) => {
            const Icon = m.icon;
            return (
              <Card className="group hover:border-white/[0.14] transition-all" key={m.label}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400">{m.label}</p>
                    <p className={`mt-3 text-3xl font-bold ${m.color}`}>{m.value}</p>
                    <p className="mt-1 text-[11px] text-slate-500">{m.detail}</p>
                  </div>
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${m.bg}`}>
                    <Icon className={m.color} size={18} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.5fr]">
          {/* Cases queue */}
          <Card
            actions={
              <Link
                className="flex items-center gap-1.5 text-xs text-brand-blue-light hover:text-brand-blue transition"
                href="/cases"
              >
                Ver todos
                <ArrowRight size={13} />
              </Link>
            }
            description="Casos mais recentes com status e prioridade."
            title="Fila de casos"
          >
            <div className="divide-y divide-white/[0.06]">
              {recentCases.map((c) => (
                <Link
                  className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between hover:bg-white/[0.02] -mx-2 px-2 rounded-lg transition group"
                  href={`/cases/${c.id}`}
                  key={c.id}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold text-brand-blue-light">
                        {c.code}
                      </p>
                      <PriorityBadge priority={c.priority} />
                    </div>
                    <p className="mt-0.5 truncate text-sm font-medium text-slate-100">
                      {c.caseType}
                    </p>
                    <p className="text-xs text-slate-400">{c.clientName}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="hidden sm:block text-right">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <FileText size={11} />
                        {c.documentsCount} docs
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {formatDate(c.updatedAt)}
                      </p>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                </Link>
              ))}
            </div>
          </Card>

          {/* Right column */}
          <div className="space-y-6">
            {/* Active agents */}
            <Card title="Agentes ativos" description="Execuções em andamento agora.">
              {activeAgents.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-6 text-center">
                  <Bot className="text-slate-600" size={24} />
                  <p className="text-xs text-slate-400">Nenhum agente ativo no momento</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeAgents.map((agent) => (
                    <div
                      className="flex items-center gap-3 rounded-lg border border-brand-blue/20 bg-brand-blue/5 px-3 py-2.5"
                      key={agent.id}
                    >
                      <div className="h-2 w-2 animate-pulse rounded-full bg-brand-blue" />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-slate-200">
                          {agent.agentName}
                        </p>
                        <p className="text-[10px] text-slate-500">Caso {agent.caseId}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Progress overview */}
            <Card title="Progresso dos casos" description="Distribuição por etapa.">
              <div className="space-y-3">
                {[
                  { label: "Em análise IA", count: 2, color: "bg-violet-500" },
                  { label: "Revisão humana", count: 1, color: "bg-yellow-500" },
                  { label: "Entregues", count: 1, color: "bg-teal-500" },
                  { label: "Rascunho", count: 1, color: "bg-slate-500" }
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-xs text-slate-400">{item.label}</p>
                      <p className="text-xs font-semibold text-slate-200">{item.count}</p>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className={`h-1.5 rounded-full ${item.color}`}
                        style={{ width: `${(item.count / mockCases.length) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </AppLayout>
    </AuthGuard>
  );
}
