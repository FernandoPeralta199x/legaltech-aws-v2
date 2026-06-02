import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Lock,
  Scale
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { AppLayout } from "@/components/AppLayout";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { PageTitle } from "@/components/PageTitle";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate } from "@/lib/formatters";
import { mockCases, mockReports } from "@/lib/mockData";

const statusIcon: Record<string, ReactNode> = {
  draft: <Clock className="text-[var(--text2)]" size={16} />,
  in_review: <AlertTriangle className="text-amber-700" size={16} />,
  approved: <CheckCircle2 className="text-[var(--teal)]" size={16} />,
  delivered: <CheckCircle2 className="text-emerald-500" size={16} />,
  rejected: <AlertTriangle className="text-red-700" size={16} />
};

const statusMeta: Record<
  string,
  { delivery: string; exportLabel: string; exportTitle: string }
> = {
  approved: {
    delivery: "Aprovado para entrega futura",
    exportLabel: "Exportação futura",
    exportTitle: "Exportação real ainda não implementada no MVP local."
  },
  delivered: {
    delivery: "Entrega simulada no MVP local",
    exportLabel: "PDF planejado",
    exportTitle: "Download real de PDF ainda não existe nesta versão."
  },
  draft: {
    delivery: "Rascunho de análise",
    exportLabel: "PDF bloqueado",
    exportTitle: "PDF bloqueado até aprovação e implementação de exportação real."
  },
  in_review: {
    delivery: "Em revisão humana simulada",
    exportLabel: "PDF bloqueado",
    exportTitle: "PDF bloqueado enquanto o relatório está em revisão."
  },
  rejected: {
    delivery: "Ajuste necessário",
    exportLabel: "PDF bloqueado",
    exportTitle: "PDF bloqueado para relatório rejeitado."
  }
};

export default function ReportsPage() {
  const approved = mockReports.filter(
    (r) => r.status === "approved" || r.status === "delivered"
  ).length;
  const pending = mockReports.filter((r) => r.status === "in_review").length;
  const blocked = mockReports.filter(
    (r) => r.status !== "approved" && r.status !== "delivered"
  ).length;

  return (
    <AuthGuard>
      <AppLayout>
        <PageTitle
          description="Área de entrega e revisão do MVP local. Os relatórios abaixo usam dados mockados e representam o valor esperado do fluxo Novo Pedido, Caso, Análise, Revisão e Relatório."
          eyebrow="Relatórios"
          title="Entrega e revisão"
        />

        <div className="mb-6 grid gap-3 sm:grid-cols-4">
          {[
            {
              label: "Relatórios mockados",
              value: mockReports.length,
              tone: "border-[rgba(32,201,151,0.22)] bg-[var(--teal-dim)] text-[var(--teal)]"
            },
            {
              label: "Em revisão",
              value: pending,
              tone: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300"
            },
            {
              label: "Aprovados/entregues",
              value: approved,
              tone: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
            },
            {
              label: "PDF bloqueado",
              value: blocked,
              tone: "border-[var(--bd)] bg-[var(--surf2)] text-[var(--text2)]"
            }
          ].map((m) => (
            <div className={`rounded-lg border p-4 ${m.tone}`} key={m.label}>
              <p className="text-xs font-medium">{m.label}</p>
              <p className="mt-2 text-2xl font-bold">{m.value}</p>
            </div>
          ))}
        </div>

        <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-500/25 bg-amber-500/10 px-5 py-4">
          <Lock className="shrink-0 text-amber-700" size={18} />
          <p className="text-xs leading-5 text-[var(--text2)]">
            <span className="font-semibold text-amber-700 dark:text-amber-300">
              MVP local:
            </span>{" "}
            relatórios, revisão humana, IA/RAG e exportação PDF real ainda não
            estão integrados. Esta tela organiza a entrega esperada sem acionar
            backend ou download real.
          </p>
        </div>

        {mockReports.length === 0 ? (
          <EmptyState
            action={
              <Button href="/cases" variant="secondary">
                Ver casos
              </Button>
            }
            description="Quando houver relatórios mockados no MVP local, eles aparecerão aqui como etapa de entrega e revisão."
            icon={<FileText size={20} />}
            secondaryAction={<Button href="/cases/new">Novo Pedido</Button>}
            title="Nenhum relatório disponível"
          />
        ) : (
          <div className="space-y-4">
            {mockReports.map((report) => {
              const relatedCase = mockCases.find((item) => item.id === report.caseId);
              const meta = statusMeta[report.status] ?? {
                delivery: "Status em acompanhamento",
                exportLabel: "PDF planejado",
                exportTitle: "Exportação real ainda não implementada."
              };

              return (
                <div className="cv-card p-5" key={report.id}>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--bd)] bg-[var(--surf2)]">
                        {statusIcon[report.status] ?? <FileText size={18} />}
                      </div>
                      <div className="min-w-0">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-semibold text-[var(--teal)]">
                            {report.caseCode}
                          </span>
                          <span className="text-[11px] text-[var(--text3)]">
                            v{report.version}
                          </span>
                          <StatusBadge status={report.status} />
                          <span className="cv-badge cv-badge-muted">
                            {meta.delivery}
                          </span>
                        </div>
                        <h2 className="text-sm font-semibold text-[var(--text)]">
                          {report.title}
                        </h2>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--text2)]">
                          {report.summary}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <Link
                        className="cv-btn cv-btn-secondary min-h-11 px-3 text-xs font-semibold"
                        href={`/cases/${report.caseId}`}
                      >
                        Ver caso
                        <ArrowRight size={13} />
                      </Link>
                      <Link
                        className="cv-btn cv-btn-ghost min-h-11 px-3 text-xs font-semibold"
                        href="/documents"
                        title="Abre a área geral de documentos; não há filtro por caso nesta rota."
                      >
                        Documentos
                      </Link>
                      <button
                        className="cv-btn cv-btn-secondary min-h-11 cursor-not-allowed px-3 text-xs font-semibold opacity-60"
                        disabled
                        title={meta.exportTitle}
                        type="button"
                      >
                        <Download size={13} />
                        {meta.exportLabel}
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 border-t border-[var(--bd)] pt-4 text-xs sm:grid-cols-3">
                    <div>
                      <p className="text-[var(--text3)]">Cliente</p>
                      <p className="mt-0.5 truncate font-medium text-[var(--text2)]">
                        {relatedCase?.clientName ?? "Cliente no detalhe do caso"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[var(--text3)]">Documentos do caso</p>
                      <p className="mt-0.5 font-medium text-[var(--text2)]">
                        {relatedCase ? `${relatedCase.documentsCount} na listagem` : "Ver em Documentos"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[var(--text3)]">Gerado em</p>
                      <p className="mt-0.5 font-medium text-[var(--text2)]">
                        {formatDate(report.generatedAt)}
                        {report.approvedBy ? ` · ${report.approvedBy}` : ""}
                      </p>
                    </div>
                  </div>

                  {report.risks.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {report.risks.map((risk) => (
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                            risk.level === "high"
                              ? "border border-red-500/25 bg-red-500/10 text-red-700 dark:text-red-300"
                              : risk.level === "medium"
                                ? "border border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                                : "border border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                          }`}
                          key={risk.id}
                        >
                          <Scale size={11} />
                          {risk.title}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </AppLayout>
    </AuthGuard>
  );
}
