"use client";

import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  FileText,
  MessageSquare,
  ThumbsDown,
  ThumbsUp,
  X
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { AppLayout } from "@/components/AppLayout";
import { AuthGuard } from "@/components/AuthGuard";
import { Card } from "@/components/Card";
import { PageTitle } from "@/components/PageTitle";
import { PriorityBadge } from "@/components/PriorityBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate } from "@/lib/formatters";
import { mockCases, mockReports, mockReviews } from "@/lib/mockData";

type ActionState = {
  type: "approve" | "reject" | "adjust" | null;
  reviewId: string | null;
};

export default function AnalystPage() {
  const [action, setAction] = useState<ActionState>({
    type: null,
    reviewId: null
  });
  const [observation, setObservation] = useState("");
  const [checklist, setChecklist] = useState(
    mockReviews[0]?.checklist ?? []
  );
  const [successMsg, setSuccessMsg] = useState("");

  const pendingCases = mockCases.filter(
    (c) => c.status === "revisao_humana" || c.status === "review"
  );
  const review = mockReviews[0];
  const reviewCase = review
    ? mockCases.find((c) => c.id === review.caseId)
    : null;
  const reviewReport = review
    ? mockReports.find((r) => r.id === review.reportId)
    : null;

  async function handleAction() {
    await new Promise((r) => setTimeout(r, 800));
    const msg =
      action.type === "approve"
        ? "Registro local de aprovação simulado no MVP. Nenhuma aprovação foi persistida no backend."
        : action.type === "reject"
        ? "Registro local de rejeição simulado no MVP. Nenhum status real foi alterado."
        : "Solicitação de ajuste registrada apenas neste painel local do MVP.";
    setSuccessMsg(msg);
    setAction({ type: null, reviewId: null });
    setObservation("");
  }

  function toggleChecklist(id: string) {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  }

  const checklistDone = checklist.filter((i) => i.checked).length;

  return (
    <AuthGuard>
      <AppLayout>
        <PageTitle
          actions={
            <>
              <Link
                className="inline-flex items-center gap-2 rounded-lg bg-brand-teal px-4 py-2.5 text-sm font-semibold text-white shadow-glow-teal transition hover:bg-brand-teal-dark"
                href="/cases/new"
              >
                <FileText size={15} />
                Novo Pedido
              </Link>
              <Link
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surf)] px-3.5 py-2.5 text-sm font-medium text-[var(--text)] transition hover:border-brand-teal/40"
                href="/cases"
              >
                Casos
              </Link>
              <Link
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surf)] px-3.5 py-2.5 text-sm font-medium text-[var(--text)] transition hover:border-brand-teal/40"
                href="/documents"
              >
                Documentos
              </Link>
              <Link
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surf)] px-3.5 py-2.5 text-sm font-medium text-[var(--text)] transition hover:border-brand-teal/40"
                href="/reports"
              >
                Relatórios
              </Link>
            </>
          }
          description="Triagem local e revisão conceitual para acompanhar casos, documentos e relatórios no MVP. Esta tela não executa IA/RAG real, fila real, atribuição real, aprovação persistida ou parecer jurídico final."
          eyebrow="Analista"
          title="Triagem e revisão operacional"
        />

        {successMsg && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-brand-teal/25 bg-brand-teal/10 px-5 py-4">
            <CheckCircle2 className="shrink-0 text-brand-teal" size={18} />
            <p className="text-sm font-medium text-[var(--text)]">{successMsg}</p>
            <button
              className="ml-auto text-[var(--text2)] transition hover:text-[var(--text)]"
              onClick={() => setSuccessMsg("")}
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-500/25 bg-amber-500/10 px-5 py-4">
          <AlertTriangle className="mt-0.5 shrink-0 text-amber-400" size={18} />
          <p className="text-sm leading-6 text-[var(--text2)]">
            Área de trabalho local para orientar a revisão operacional. Os dados
            abaixo vêm de mocks/fallback do MVP e não representam fila jurídica
            real, automação de análise, auditoria de revisão ou liberação final
            de relatório.
          </p>
        </div>

        {/* Summary */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          {[
            {
              label: "Itens locais em revisão",
              value: pendingCases.length,
              description: "Casos filtrados pelos status atuais de revisão."
            },
            {
              label: "Relatórios mockados",
              value: mockReports.length,
              description: "Base visual de relatórios do MVP local."
            },
            {
              label: "Checklist local",
              value: `${checklistDone}/${checklist.length}`,
              description: "Marcação visual; não persiste revisão real."
            }
          ].map((m) => (
            <div
              className="rounded-lg border border-[var(--border)] bg-[var(--surf)] p-5"
              key={m.label}
            >
              <p className="text-xs text-[var(--text2)]">{m.label}</p>
              <p className="mt-2 text-3xl font-bold text-[var(--text)]">
                {m.value}
              </p>
              <p className="mt-2 text-xs leading-5 text-[var(--text2)]">
                {m.description}
              </p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          {/* Cases queue */}
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-[var(--text)]">
                Triagem local de casos
              </h2>
              <p className="mt-1 text-xs leading-5 text-[var(--text2)]">
                Itens com status de revisão nos dados atuais. Use Casos para
                operação detalhada e Documentos para insumos.
              </p>
            </div>
            {pendingCases.length === 0 ? (
              <div className="flex flex-col items-center rounded-lg border border-dashed border-[var(--border)] py-16 text-center">
                <ClipboardCheck className="mb-3 text-[var(--text2)]" size={28} />
                <p className="text-sm font-medium text-[var(--text)]">
                  Nenhum caso local em revisão.
                </p>
                <p className="mt-2 max-w-md text-xs leading-5 text-[var(--text2)]">
                  Revise a área de Casos, envie Documentos quando houver insumos
                  ou inicie Novo Pedido para criar uma nova entrada do fluxo.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  <Link
                    className="rounded-lg bg-brand-teal px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-teal-dark"
                    href="/cases/new"
                  >
                    Novo Pedido
                  </Link>
                  <Link
                    className="rounded-lg border border-[var(--border)] px-4 py-2 text-xs font-medium text-[var(--text)] transition hover:border-brand-teal/40"
                    href="/cases"
                  >
                    Ver Casos
                  </Link>
                </div>
              </div>
            ) : (
              pendingCases.map((c) => (
                <div
                  className="rounded-lg border border-[var(--border)] bg-[var(--surf)] p-5"
                  key={c.id}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-[11px] font-semibold text-brand-teal-dark">
                          {c.code}
                        </span>
                        <StatusBadge status={c.status} />
                        <PriorityBadge priority={c.priority} />
                      </div>
                      <p className="text-sm font-semibold text-[var(--text)]">
                        {c.caseType}
                      </p>
                      <p className="text-xs text-[var(--text2)]">{c.clientName}</p>
                      <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[var(--text2)]">
                        <Clock size={11} />
                        Atualizado {formatDate(c.updatedAt)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surf2)] px-3 py-2 text-xs font-medium text-[var(--text)] transition hover:border-brand-teal/40"
                        href={`/cases/${c.id}`}
                      >
                        <FileText size={13} />
                        Abrir caso
                      </Link>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2 rounded-lg border border-[var(--border)] bg-[var(--surf2)] p-3 sm:grid-cols-3">
                    <div>
                      <p className="text-[11px] text-[var(--text2)]">Documentos</p>
                      <p className="mt-1 text-xs font-semibold text-[var(--text)]">
                        {c.documentsCount} na listagem
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[var(--text2)]">Responsável local</p>
                      <p className="mt-1 text-xs font-semibold text-[var(--text)]">
                        {c.assignedTo ?? "Não informado"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[var(--text2)]">Criado em</p>
                      <p className="mt-1 text-xs font-semibold text-[var(--text)]">
                        {formatDate(c.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Review panel */}
          <div>
            {review && reviewCase && reviewReport ? (
              <Card
                title="Revisão conceitual do MVP"
                description={`${reviewCase.code} - registro local`}
              >
                <div className="space-y-4">
                  {/* Report summary */}
                  <div className="rounded-lg border border-[var(--border)] bg-[var(--surf2)] p-4">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--text2)]">
                      Resumo mockado do relatório
                    </p>
                    <p className="text-xs leading-5 text-[var(--text2)] line-clamp-4">
                      {reviewReport.summary}
                    </p>
                  </div>

                  <div className="rounded-lg border border-brand-teal/20 bg-brand-teal/10 p-4">
                    <p className="text-xs leading-5 text-[var(--text2)]">
                      Use este painel para organizar uma leitura local. As ações
                      abaixo não alteram status no backend, não aprovam relatório
                      real e não geram parecer jurídico.
                    </p>
                  </div>

                  {/* Checklist */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-semibold text-[var(--text)]">
                        Checklist local de revisão
                      </p>
                      <span className="text-[11px] text-[var(--text2)]">
                        {checklistDone}/{checklist.length}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {checklist.map((item) => (
                        <label
                          className="flex cursor-pointer items-start gap-3 rounded-lg p-2 transition hover:bg-[var(--surf2)]"
                          key={item.id}
                        >
                          <input
                            checked={item.checked}
                            className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-teal-500"
                            onChange={() => toggleChecklist(item.id)}
                            type="checkbox"
                          />
                          <span
                            className={`text-xs ${
                              item.checked
                                ? "text-teal-400 line-through decoration-teal-600"
                                : "text-[var(--text2)]"
                            }`}
                          >
                            {item.label}
                          </span>
                        </label>
                      ))}
                    </div>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-1 rounded-full bg-teal-500 transition-all"
                        style={{
                          width: `${(checklistDone / checklist.length) * 100}%`
                        }}
                      />
                    </div>
                  </div>

                  {/* Observation */}
                  <div>
                    <label className="block mb-1.5 text-xs font-medium text-[var(--text2)]">
                      Observações locais do analista
                    </label>
                    <textarea
                      className="min-h-20 w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--surf2)] px-3 py-2.5 text-xs text-[var(--text)] placeholder:text-[var(--text2)] outline-none transition focus:border-brand-teal/40"
                      onChange={(e) => setObservation(e.target.value)}
                      placeholder="Registre observações locais; elas não são persistidas como revisão real."
                      value={observation}
                    />
                  </div>

                  {/* Action buttons */}
                  <div className="space-y-2 border-t border-[var(--border)] pt-4">
                    <button
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-teal py-3 text-sm font-semibold text-white shadow-glow-teal hover:bg-brand-teal-dark transition"
                      onClick={() => {
                        setAction({ type: "approve", reviewId: review.id });
                        handleAction();
                      }}
                      type="button"
                    >
                      <ThumbsUp size={15} />
                      Registrar aprovação local
                    </button>
                    <button
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 py-3 text-sm font-semibold text-amber-300 transition hover:bg-amber-500/15"
                      onClick={() => {
                        setAction({ type: "adjust", reviewId: review.id });
                        handleAction();
                      }}
                      type="button"
                    >
                      <MessageSquare size={15} />
                      Solicitar ajuste local
                    </button>
                    <button
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/15"
                      onClick={() => {
                        setAction({ type: "reject", reviewId: review.id });
                        handleAction();
                      }}
                      type="button"
                    >
                      <ThumbsDown size={15} />
                      Registrar rejeição local
                    </button>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="flex flex-col items-center rounded-lg border border-dashed border-[var(--border)] py-16 text-center">
                <ClipboardCheck className="mb-3 text-[var(--text2)]" size={28} />
                <p className="text-sm font-medium text-[var(--text)]">
                  Nenhuma revisão local selecionada.
                </p>
                <p className="mt-2 max-w-sm text-xs leading-5 text-[var(--text2)]">
                  Consulte Casos, Documentos e Relatórios para organizar a
                  próxima etapa operacional do MVP local.
                </p>
              </div>
            )}
          </div>
        </div>
      </AppLayout>
    </AuthGuard>
  );
}
