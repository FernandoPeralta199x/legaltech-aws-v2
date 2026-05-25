"use client";

import {
  AlertTriangle,
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

  const metrics = [
    {
      label: "Casos em análise",
      value: casesInAnalysis,
      detail: "Processando ou em revisão",
      icon: BriefcaseBusiness,
      color: "text-brand-blue-light",
      bg: "bg-brand-blue/10 border-brand-blue/20"
    },
    {
      label: "Revisões humanas",
      value: humanReviews,
      detail: "Aguardando analista",
      icon: ClipboardCheck,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10 border-yellow-500/20"
    },
    {
      label: "Documentos",
      value: documents.length,
      detail: "Metadados carregados",
      icon: FileText,
      color: "text-teal-400",
      bg: "bg-teal-500/10 border-teal-500/20"
    },
    {
      label: "Clientes ativos",
      value: clients.length,
      detail: "Fonte integrável",
      icon: UsersRound,
      color: "text-violet-400",
      bg: "bg-violet-500/10 border-violet-500/20"
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
          <StatusNotice message="Backend indisponível: dashboard usando fallback mockado local." />
        )}
        {error && <StatusNotice message={error} tone="error" />}

        {loading ? (
          <div className="flex min-h-64 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.02] text-sm text-slate-400">
            Carregando dados operacionais...
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {metrics.map((metric) => {
                const Icon = metric.icon;
                return (
                  <Card className="group hover:border-white/[0.14] transition-all" key={metric.label}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs text-slate-400">{metric.label}</p>
                        <p className={`mt-3 text-3xl font-bold ${metric.color}`}>{metric.value}</p>
                        <p className="mt-1 text-[11px] text-slate-500">{metric.detail}</p>
                      </div>
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${metric.bg}`}>
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
                {recentCases.length === 0 ? (
                  <p className="py-6 text-center text-xs text-slate-400">
                    Nenhum caso carregado.
                  </p>
                ) : (
                  <div className="divide-y divide-white/[0.06]">
                    {recentCases.map((legalCase) => (
                      <Link
                        className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between hover:bg-white/[0.02] -mx-2 px-2 rounded-lg transition group"
                        href={`/cases/${legalCase.id}`}
                        key={legalCase.id}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-semibold text-brand-blue-light">
                              {legalCase.code}
                            </p>
                            <PriorityBadge priority={legalCase.priority} />
                          </div>
                          <p className="mt-0.5 truncate text-sm font-medium text-slate-100">
                            {legalCase.caseType}
                          </p>
                          <p className="text-xs text-slate-400">{legalCase.clientName}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="hidden sm:block text-right">
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

                <Card title="Progresso dos casos" description="Distribuição por etapa.">
                  <div className="space-y-3">
                    {[
                      { label: "Em análise", count: casesInAnalysis, color: "bg-violet-500" },
                      { label: "Revisão humana", count: humanReviews, color: "bg-yellow-500" },
                      { label: "Relatórios aprovados", count: reportsApproved, color: "bg-teal-500" },
                      { label: "Rascunho", count: cases.filter((legalCase) => legalCase.status === "draft").length, color: "bg-slate-500" }
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-xs text-slate-400">{item.label}</p>
                          <p className="text-xs font-semibold text-slate-200">{item.count}</p>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                          <div
                            className={`h-1.5 rounded-full ${item.color}`}
                            style={{ width: `${cases.length ? (item.count / cases.length) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </>
        )}
      </AppLayout>
    </AuthGuard>
  );
}

function StatusNotice({
  message,
  tone = "warning"
}: {
  message: string;
  tone?: "error" | "warning";
}) {
  const isError = tone === "error";
  return (
    <div
      className={`mb-4 flex items-center gap-2 rounded-xl border px-4 py-3 text-xs ${
        isError
          ? "border-red-500/25 bg-red-500/10 text-red-200"
          : "border-amber-500/25 bg-amber-500/10 text-amber-200"
      }`}
    >
      <AlertTriangle size={14} />
      {message}
    </div>
  );
}
