"use client";

import {
  ArrowRight,
  Bot,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Plus,
  RefreshCw,
  UsersRound
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { AppLayout } from "@/components/AppLayout";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { Notification } from "@/components/Notification";
import { PageTitle } from "@/components/PageTitle";
import { PriorityBadge } from "@/components/PriorityBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate } from "@/lib/formatters";
import { mockAgentExecutions, mockReports } from "@/lib/mockData";
import { ApiClientError } from "@/src/services/apiClient";
import { listCases } from "@/src/services/cases";
import { listClients } from "@/src/services/clients";
import { listDocuments } from "@/src/services/documents";
import type { Case, Client, Document } from "@/types";

function errorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    return `${error.code}: ${error.message}`;
  }

  return error instanceof Error ? error.message : "Não foi possível carregar o dashboard.";
}

function caseDisplayTitle(legalCase: Case): string {
  const title = legalCase.metadata?.title;
  return typeof title === "string" && title.trim() ? title : legalCase.caseType;
}

export default function DashboardPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [error, setError] = useState("");
  const [fallbackReason, setFallbackReason] = useState("");
  const [loading, setLoading] = useState(true);

  const refreshDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const clientsResult = await listClients();
      const [casesResult, documentsResult] = await Promise.all([
        listCases(clientsResult.data),
        listDocuments()
      ]);
      setClients(clientsResult.data);
      setDocuments(documentsResult.data);
      setCases(
        casesResult.data.map((legalCase) => ({
          ...legalCase,
          documentsCount: documentsResult.data.filter(
            (document) => document.caseId === legalCase.id
          ).length
        }))
      );
      setFallbackReason(
        clientsResult.source === "mock" ||
          casesResult.source === "mock" ||
          documentsResult.source === "mock"
          ? clientsResult.fallbackReason ??
              casesResult.fallbackReason ??
              documentsResult.fallbackReason ??
              ""
          : ""
      );
    } catch (err) {
      setError(errorMessage(err));
      setFallbackReason("");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refreshDashboard();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [refreshDashboard]);

  const recentCases = useMemo(() => cases.slice(0, 4), [cases]);
  const activeAgents = mockAgentExecutions.filter((execution) => execution.status === "running");
  const reportsApproved = mockReports.filter(
    (report) => report.status === "approved" || report.status === "delivered"
  ).length;
  const casesInAnalysis = cases.filter(
    (legalCase) => !["draft", "delivered", "completed", "cancelled"].includes(legalCase.status)
  ).length;
  const humanReviews = cases.filter(
    (legalCase) => legalCase.status === "revisao_humana" || legalCase.status === "review"
  ).length;
  const dataSourceLabel = fallbackReason ? "Fallback mockado" : "API real";

  const metrics = [
    {
      bg: "bg-emerald-50 border-emerald-200",
      color: "text-brand-teal",
      detail: "Processando ou em revisão",
      icon: BriefcaseBusiness,
      label: "Casos em análise",
      value: casesInAnalysis
    },
    {
      bg: "bg-yellow-500/10 border-yellow-500/20",
      color: "text-amber-700",
      detail: "Aguardando analista",
      icon: ClipboardCheck,
      label: "Revisões humanas",
      value: humanReviews
    },
    {
      bg: "bg-emerald-50 border-emerald-200",
      color: "text-emerald-700",
      detail: "Metadados carregados",
      icon: FileText,
      label: "Documentos",
      value: documents.length
    },
    {
      bg: "bg-violet-500/10 border-violet-500/20",
      color: "text-violet-700",
      detail: "Clientes da organização",
      icon: UsersRound,
      label: "Clientes ativos",
      value: clients.length
    }
  ];

  return (
    <AuthGuard>
      <AppLayout>
        <PageTitle
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Button
                icon={<RefreshCw aria-hidden="true" size={15} />}
                loading={loading}
                onClick={() => void refreshDashboard()}
                variant="secondary"
              >
                Atualizar
              </Button>
              <Button href="/cases" icon={<Plus aria-hidden="true" size={15} />}>
                Novo caso
              </Button>
            </div>
          }
          description="Visão geral dos casos, documentos e atividade preparada para o backend."
          eyebrow="Dashboard"
          title="Painel operacional"
        />

        {fallbackReason && (
          <Notification title="Fallback local ativo" tone="warning">
            O backend não respondeu. Métricas e listas estão usando dados fictícios de desenvolvimento.
          </Notification>
        )}
        {error && !loading && (
          <Notification onDismiss={() => setError("")} title="Atenção" tone="error">
            {error}
          </Notification>
        )}

        {loading ? (
          <LoadingState
            description="Consolidando clientes, casos e documentos."
            label="Carregando dados operacionais"
            rows={4}
          />
        ) : error && cases.length === 0 && clients.length === 0 && documents.length === 0 ? (
          <ErrorState
            action={
              <Button icon={<RefreshCw size={15} />} onClick={() => void refreshDashboard()} variant="secondary">
                Tentar novamente
              </Button>
            }
            description="Não foi possível montar a visão geral. Erros de autorização e validação do backend não são substituídos por fallback."
            details={error}
          />
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-slate-500">
                Fonte atual:{" "}
                <span className={fallbackReason ? "font-semibold text-amber-700" : "font-semibold text-emerald-700"}>
                  {dataSourceLabel}
                </span>
              </p>
              <p className="text-xs text-slate-500">
                Atualizado nesta sessão local
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {metrics.map((metric) => {
                const Icon = metric.icon;
                return (
                  <Card className="group transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-card-hover" key={metric.label}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs text-slate-600">{metric.label}</p>
                        <p className={`mt-3 text-3xl font-bold ${metric.color}`}>{metric.value}</p>
                        <p className="mt-1 text-[11px] text-slate-500">{metric.detail}</p>
                      </div>
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${metric.bg}`}>
                        <Icon className={metric.color} size={18} />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.5fr]">
              <Card
                actions={
                  <Link
                    className="flex items-center gap-1.5 text-xs text-brand-teal transition hover:text-brand-teal"
                    href="/cases"
                  >
                    Ver todos
                    <ArrowRight size={13} />
                  </Link>
                }
                description="Casos mais recentes com status, prioridade e fonte integrável."
                title="Fila de casos"
              >
                {recentCases.length === 0 ? (
                  <EmptyState
                    action={
                      <Button href="/cases" icon={<Plus size={15} />}>
                        Criar caso
                      </Button>
                    }
                    description="Nenhum caso carregado. Crie clientes e casos fictícios para validar o fluxo."
                    icon={<BriefcaseBusiness size={20} />}
                    title="Fila vazia"
                    variant="compact"
                  />
                ) : (
                  <div className="divide-y divide-white/[0.06]">
                    {recentCases.map((legalCase) => (
                      <Link
                        className="-mx-2 flex flex-col gap-2 rounded-lg px-2 py-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                        href={`/cases/${legalCase.id}`}
                        key={legalCase.id}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-semibold text-brand-teal">
                              {legalCase.code}
                            </p>
                            <PriorityBadge priority={legalCase.priority} />
                          </div>
                          <p className="mt-0.5 truncate text-sm font-medium text-slate-900">
                            {caseDisplayTitle(legalCase)}
                          </p>
                          <p className="text-xs text-slate-600">{legalCase.clientName}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="hidden text-right sm:block">
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                              <FileText size={11} />
                              {legalCase.documentsCount} docs
                            </div>
                            <p className="text-[11px] text-slate-500">
                              {formatDate(legalCase.updatedAt)}
                            </p>
                          </div>
                          <StatusBadge status={legalCase.status} />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </Card>

              <div className="space-y-6">
                <Card title="Agentes ativos" description="Execuções mockadas até haver endpoint dedicado.">
                  {activeAgents.length === 0 ? (
                    <EmptyState
                      description="Nenhum worker de agente aparece como ativo nos dados mockados."
                      icon={<Bot size={20} />}
                      title="Sem agentes ativos"
                      variant="compact"
                    />
                  ) : (
                    <div className="space-y-3">
                      {activeAgents.map((agent) => (
                        <div
                          className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5"
                          key={agent.id}
                        >
                          <div className="h-2 w-2 animate-pulse rounded-full bg-brand-teal" />
                          <div className="min-w-0">
                            <p className="truncate text-xs font-medium text-slate-800">
                              {agent.agentName}
                            </p>
                            <p className="text-[10px] text-slate-500">Caso {agent.caseId}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                <Card title="Progresso dos casos" description="Distribuição por etapa.">
                  {cases.length === 0 ? (
                    <EmptyState
                      description="A distribuição será exibida após haver casos carregados."
                      icon={<CheckCircle2 size={20} />}
                      title="Sem métricas de fluxo"
                      variant="compact"
                    />
                  ) : (
                    <div className="space-y-3">
                      {[
                        { label: "Em análise", count: casesInAnalysis, color: "bg-violet-500" },
                        { label: "Revisão humana", count: humanReviews, color: "bg-yellow-500" },
                        { label: "Relatórios aprovados", count: reportsApproved, color: "bg-teal-500" },
                        { label: "Rascunho", count: cases.filter((legalCase) => legalCase.status === "draft").length, color: "bg-slate-500" }
                      ].map((item) => (
                        <div key={item.label}>
                          <div className="mb-1.5 flex items-center justify-between">
                            <p className="text-xs text-slate-600">{item.label}</p>
                            <p className="text-xs font-semibold text-slate-800">{item.count}</p>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={`h-1.5 rounded-full ${item.color}`}
                              style={{ width: `${cases.length ? (item.count / cases.length) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </>
        )}
      </AppLayout>
    </AuthGuard>
  );
}
