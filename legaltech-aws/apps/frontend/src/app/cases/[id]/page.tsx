"use client";

import {
  AlertTriangle,
  ArrowLeft,
  Bot,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock,
  FileText,
  Shield,
  Users
} from "lucide-react";
import Link from "next/link";
import { use, useCallback, useEffect, useState } from "react";

import { AgentCard } from "@/components/AgentCard";
import { AppLayout } from "@/components/AppLayout";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { Notification } from "@/components/Notification";
import { PriorityBadge } from "@/components/PriorityBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { Timeline } from "@/components/Timeline";
import { formatDate } from "@/lib/formatters";
import { ApiClientError } from "@/src/services/apiClient";
import { getCase } from "@/src/services/cases";
import { listClients } from "@/src/services/clients";
import { listDocuments } from "@/src/services/documents";
import type { Case, Document } from "@/types";
import {
  mockAgentExecutions,
  mockReports,
  mockTimeline
} from "@/lib/mockData";

const TABS = [
  { id: "overview", label: "Visão geral", icon: ClipboardList },
  { id: "parties", label: "Partes", icon: Users },
  { id: "documents", label: "Documentos", icon: FileText },
  { id: "timeline", label: "Timeline", icon: Clock },
  { id: "agents", label: "Análise IA", icon: Bot },
  { id: "report", label: "Relatório", icon: Shield }
];

const caseTypeLabel: Record<string, string> = {
  compra_venda: "Compra e Venda",
  prestacao_servicos: "Prestação de Serviços",
  locacao: "Locação",
  parceria: "Parceria",
  confidencialidade: "Confidencialidade (NDA)",
  due_diligence: "Due Diligence",
  contract_analysis: "Análise Contratual",
  outro: "Outro"
};

type PageProps = { params: Promise<{ id: string }> };

function errorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    return `${error.code}: ${error.message}`;
  }

  return error instanceof Error ? error.message : "Não foi possível carregar o caso.";
}

function caseDisplayTitle(legalCase: Case): string {
  const title = legalCase.metadata?.title;
  return typeof title === "string" && title.trim()
    ? title
    : caseTypeLabel[legalCase.caseType] ?? legalCase.caseType;
}

export default function CaseDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState("overview");
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [caseDocuments, setCaseDocuments] = useState<Document[]>([]);
  const [error, setError] = useState("");
  const [fallbackReason, setFallbackReason] = useState("");
  const [loading, setLoading] = useState(true);

  const refreshCase = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const clientsResult = await listClients();
      const [caseResult, documentsResult] = await Promise.all([
        getCase(id, clientsResult.data),
        listDocuments({ caseId: id })
      ]);
      setCaseData({
        ...caseResult.data,
        documentsCount: documentsResult.data.length
      });
      setCaseDocuments(documentsResult.data);
      setFallbackReason(
        clientsResult.source === "mock" ||
          caseResult.source === "mock" ||
          documentsResult.source === "mock"
          ? clientsResult.fallbackReason ??
              caseResult.fallbackReason ??
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
  }, [id]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refreshCase();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [refreshCase]);

  if (loading) {
    return (
      <AuthGuard>
        <AppLayout>
          <LoadingState
            description="Consultando caso, cliente e documentos vinculados."
            label="Carregando caso"
            rows={4}
          />
        </AppLayout>
      </AuthGuard>
    );
  }

  if (!caseData) {
    return (
      <AuthGuard>
        <AppLayout>
          <ErrorState
            action={
              <Button href="/cases" variant="secondary">
                Voltar para casos
              </Button>
            }
            description="Não foi possível carregar o detalhe do caso. Verifique o token dev, permissões e se o backend está disponível."
            details={error || "Caso não encontrado."}
            title="Caso não encontrado"
          />
        </AppLayout>
      </AuthGuard>
    );
  }

  const caseTimeline = mockTimeline.filter((t) => t.caseId === caseData.id);
  const caseAgents = mockAgentExecutions.filter((e) => e.caseId === caseData.id);
  const caseReport = mockReports.find((r) => r.caseId === caseData.id);

  return (
    <AuthGuard>
      <AppLayout>
        {fallbackReason && (
          <Notification title="Fallback local ativo" tone="warning">
            Backend indisponível: detalhes carregados por fallback mockado local.
          </Notification>
        )}
        {error && (
          <Notification title="Atenção" tone="error">
            {error}
          </Notification>
        )}

        {/* Breadcrumb */}
        <Link
          className="mb-4 flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition"
          href="/cases"
        >
          <ArrowLeft size={14} />
          Todos os casos
        </Link>

        {/* Case header */}
        <div className="mb-6 rounded-xl border border-white/[0.08] bg-white/[0.03] p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-brand-blue-light">
                  {caseData.code}
                </span>
                <StatusBadge status={caseData.status} />
                <PriorityBadge priority={caseData.priority} />
              </div>
              <h1 className="text-xl font-bold text-white">
                {caseDisplayTitle(caseData)}
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                {caseData.clientName} · {caseTypeLabel[caseData.caseType] ?? caseData.caseType}
              </p>
              {caseData.notes && (
                <p className="mt-2 text-xs leading-5 text-slate-400">{caseData.notes}</p>
              )}
            </div>
            <div className="shrink-0 text-right">
              <div className="mb-3 text-right">
                <span className="text-2xl font-bold text-white">
                  {caseData.progressPercent}%
                </span>
                <p className="text-[11px] text-slate-400">Progresso geral</p>
              </div>
              <div className="w-32 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                <div
                  className="h-1.5 rounded-full bg-brand-blue"
                  style={{ width: `${caseData.progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          <dl className="mt-6 flex flex-wrap gap-6 border-t border-white/[0.06] pt-4 text-xs">
            {[
              {
                label: "Responsável",
                value: caseData.assignedTo ?? "Não atribuído"
              },
              { label: "Documentos", value: `${caseData.documentsCount}` },
              {
                label: "Criado em",
                value: formatDate(caseData.createdAt)
              },
              {
                label: "Atualizado",
                value: formatDate(caseData.updatedAt)
              }
            ].map((item) => (
              <div key={item.label}>
                <dt className="text-slate-500">{item.label}</dt>
                <dd className="mt-0.5 font-medium text-slate-200">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex overflow-x-auto border-b border-white/[0.06]">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-xs font-medium transition ${
                  active
                    ? "border-brand-blue text-brand-blue-light"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                type="button"
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab: Overview */}
        {activeTab === "overview" && (
          <div className="grid gap-6 lg:grid-cols-2 animate-in">
            <Card title="Status atual">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-4 border-brand-blue/30 bg-brand-blue/10">
                  <span className="text-sm font-bold text-brand-blue-light">
                    {caseData.progressPercent}%
                  </span>
                </div>
                <div>
                  <StatusBadge status={caseData.status} />
                  {caseData.assignedTo && (
                    <p className="mt-1.5 text-xs text-slate-400">
                      Responsável: {caseData.assignedTo}
                    </p>
                  )}
                </div>
              </div>
            </Card>

            <Card title="Estatísticas">
              <dl className="grid grid-cols-2 gap-4">
                {[
                  { label: "Documentos", value: caseData.documentsCount },
                  { label: "Partes", value: caseData.parties.length },
                  {
                    label: "Agentes",
                    value: caseAgents.filter((e) => e.status === "completed").length
                  },
                  {
                    label: "Progresso",
                    value: `${caseData.progressPercent}%`
                  }
                ].map((stat) => (
                  <div key={stat.label}>
                    <dt className="text-[11px] text-slate-500">{stat.label}</dt>
                    <dd className="mt-0.5 text-lg font-bold text-white">{stat.value}</dd>
                  </div>
                ))}
              </dl>
            </Card>

            {caseData.status === "revisao_humana" && (
              <div className="lg:col-span-2 rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-5">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="shrink-0 text-yellow-400" size={20} />
                  <div>
                    <p className="text-sm font-semibold text-yellow-300">
                      Aguardando revisão humana
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      Este caso está na etapa de revisão humana obrigatória. Um
                      analista jurídico precisa revisar e aprovar o relatório antes da
                      entrega ao cliente.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab: Parties */}
        {activeTab === "parties" && (
          <div className="animate-in">
            {caseData.parties.length === 0 ? (
              <EmptyState
                description="A aba de partes será preenchida quando o backend expuser cadastro detalhado de partes."
                icon={<Users size={20} />}
                title="Nenhuma parte cadastrada"
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {caseData.parties.map((party) => (
                  <Card key={party.id}>
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-blue/10 text-xs font-bold text-brand-blue-light border border-brand-blue/20">
                        {party.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-100">
                          {party.name}
                        </p>
                        <span className="inline-flex rounded-md bg-white/[0.06] px-2 py-0.5 text-[11px] text-slate-300 capitalize">
                          {party.type}
                        </span>
                      </div>
                    </div>
                    <dl className="mt-4 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <dt className="text-slate-500">Documento</dt>
                        <dd className="text-slate-300">{party.document}</dd>
                      </div>
                      <div className="flex items-center justify-between">
                        <dt className="text-slate-500">E-mail</dt>
                        <dd className="text-slate-300">{party.email}</dd>
                      </div>
                      <div className="flex items-center justify-between">
                        <dt className="text-slate-500">Telefone</dt>
                        <dd className="text-slate-300">{party.phone}</dd>
                      </div>
                    </dl>
                    {party.notes && (
                      <p className="mt-3 text-xs text-slate-400 border-t border-white/[0.06] pt-3">
                        {party.notes}
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Documents */}
        {activeTab === "documents" && (
          <div className="animate-in space-y-3">
            {caseDocuments.length === 0 ? (
              <EmptyState
                action={
                  <Button href="/documents" variant="secondary">
                    Abrir documentos
                  </Button>
                }
                description="Nenhum metadado de documento foi encontrado para este caso."
                icon={<FileText size={20} />}
                title="Sem documentos"
              />
            ) : (
              caseDocuments.map((doc) => (
                <div
                  className="flex items-center gap-4 rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-4"
                  key={doc.id}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06]">
                    <FileText className="text-slate-400" size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-100">
                      {doc.filename}
                    </p>
                    <p className="text-xs text-slate-500">
                      {doc.sizeLabel} · {formatDate(doc.uploadedAt)}
                    </p>
                  </div>
                  <StatusBadge status={doc.status} />
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab: Timeline */}
        {activeTab === "timeline" && (
          <div className="animate-in">
            <Card title="Histórico de eventos">
              <Timeline events={caseTimeline} />
            </Card>
          </div>
        )}

        {/* Tab: Agents */}
        {activeTab === "agents" && (
          <div className="animate-in">
            <div className="mb-4 flex items-center gap-2">
              <Bot className="text-brand-blue" size={18} />
              <h2 className="text-sm font-semibold text-slate-100">
                Execuções dos agentes de IA
              </h2>
            </div>
            {caseAgents.length === 0 ? (
              <EmptyState
                description="Execuções de agentes ainda são mockadas nesta tela até haver endpoint dedicado."
                icon={<Bot size={20} />}
                title="Nenhum agente executado"
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {caseAgents.map((exec) => (
                  <AgentCard execution={exec} key={exec.id} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Report */}
        {activeTab === "report" && (
          <div className="animate-in">
            {!caseReport ? (
              <EmptyState
                description="O relatório será disponibilizado após processamento e revisão humana. Não há IA real integrada nesta etapa."
                icon={<Shield size={20} />}
                title="Relatório não disponível"
              />
            ) : (
              <div className="space-y-6">
                <Card>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h2 className="text-sm font-bold text-slate-100">
                        {caseReport.title}
                      </h2>
                      <p className="mt-1 text-[11px] text-slate-500">
                        Versão {caseReport.version} ·{" "}
                        {formatDate(caseReport.generatedAt)}
                      </p>
                    </div>
                    <StatusBadge status={caseReport.status} />
                  </div>

                  {caseReport.status === "in_review" && (
                    <div className="mb-5 flex items-center gap-3 rounded-lg border border-yellow-500/30 bg-yellow-500/5 px-4 py-3">
                      <AlertTriangle className="shrink-0 text-yellow-400" size={16} />
                      <p className="text-xs text-yellow-200">
                        Este relatório está em revisão humana obrigatória. Aguarde
                        a aprovação de um analista antes da entrega ao cliente.
                      </p>
                    </div>
                  )}

                  <p className="text-sm leading-6 text-slate-300">
                    {caseReport.summary}
                  </p>
                </Card>

                {caseReport.risks.length > 0 && (
                  <Card title="Riscos identificados">
                    <div className="space-y-4">
                      {caseReport.risks.map((risk) => (
                        <div
                          className={`rounded-lg border p-4 ${
                            risk.level === "high"
                              ? "border-red-500/20 bg-red-500/5"
                              : risk.level === "medium"
                              ? "border-amber-500/20 bg-amber-500/5"
                              : "border-green-500/20 bg-green-500/5"
                          }`}
                          key={risk.id}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <StatusBadge status={risk.level} />
                            <p className="text-sm font-semibold text-slate-100">
                              {risk.title}
                            </p>
                          </div>
                          <p className="text-xs leading-5 text-slate-400">
                            {risk.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {caseReport.recommendations.length > 0 && (
                  <Card title="Recomendações">
                    <ul className="space-y-2">
                      {caseReport.recommendations.map((rec, i) => (
                        <li className="flex items-start gap-3" key={i}>
                          <CheckCircle2
                            className="mt-0.5 shrink-0 text-teal-400"
                            size={14}
                          />
                          <p className="text-xs leading-5 text-slate-300">{rec}</p>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
                  <FileText className="shrink-0 text-slate-500" size={16} />
                  <p className="text-xs text-slate-400">
                    Download do relatório em PDF disponível somente após aprovação
                    do analista.
                  </p>
                  <button
                    className="ml-auto shrink-0 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-400 cursor-not-allowed opacity-50"
                    disabled
                    type="button"
                  >
                    Baixar PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </AppLayout>
    </AuthGuard>
  );
}
