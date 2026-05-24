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
        ? "Relatório aprovado com sucesso!"
        : action.type === "reject"
        ? "Análise rejeitada. Caso retornado para revisão."
        : "Ajuste solicitado ao sistema.";
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
          description="Casos aguardando sua revisão, aprovação e liberação do relatório final."
          eyebrow="Analista"
          title="Painel do analista"
        />

        {successMsg && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-teal-500/30 bg-teal-500/10 px-5 py-4">
            <CheckCircle2 className="shrink-0 text-teal-400" size={18} />
            <p className="text-sm font-medium text-teal-300">{successMsg}</p>
            <button
              className="ml-auto text-teal-500 hover:text-teal-300"
              onClick={() => setSuccessMsg("")}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Summary */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          {[
            {
              label: "Pendentes de revisão",
              value: pendingCases.length,
              color: "text-yellow-400",
              bg: "bg-yellow-500/10 border-yellow-500/20"
            },
            {
              label: "Revisados hoje",
              value: 2,
              color: "text-teal-400",
              bg: "bg-teal-500/10 border-teal-500/20"
            },
            {
              label: "SLA médio",
              value: "4h",
              color: "text-brand-blue-light",
              bg: "bg-brand-blue/10 border-brand-blue/20"
            }
          ].map((m) => (
            <div className={`rounded-xl border ${m.bg} p-5`} key={m.label}>
              <p className="text-xs text-slate-400">{m.label}</p>
              <p className={`mt-2 text-3xl font-bold ${m.color}`}>{m.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          {/* Cases queue */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-300">
              Casos aguardando revisão
            </h2>
            {pendingCases.length === 0 ? (
              <div className="flex flex-col items-center rounded-xl border border-dashed border-white/[0.08] py-16 text-center">
                <ClipboardCheck className="mb-3 text-slate-600" size={28} />
                <p className="text-sm text-slate-400">
                  Nenhum caso pendente de revisão.
                </p>
              </div>
            ) : (
              pendingCases.map((c) => (
                <div
                  className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-5"
                  key={c.id}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-[11px] font-semibold text-brand-blue-light">
                          {c.code}
                        </span>
                        <StatusBadge status={c.status} />
                        <PriorityBadge priority={c.priority} />
                      </div>
                      <p className="text-sm font-semibold text-slate-100">
                        {c.caseType}
                      </p>
                      <p className="text-xs text-slate-400">{c.clientName}</p>
                      <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
                        <Clock size={11} />
                        Atualizado {formatDate(c.updatedAt)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs font-medium text-slate-300 hover:bg-white/[0.07] transition"
                        href={`/cases/${c.id}`}
                      >
                        <FileText size={13} />
                      </Link>
                    </div>
                  </div>

                  {/* SLA bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1.5 text-[11px]">
                      <span className="text-slate-500">SLA</span>
                      <span className="font-semibold text-yellow-400">
                        6h restantes
                      </span>
                    </div>
                    <div className="h-1 overflow-hidden rounded-full bg-white/[0.08]">
                      <div className="h-1 w-1/3 rounded-full bg-yellow-500" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Review panel */}
          <div>
            {review && reviewCase && reviewReport ? (
              <Card title="Painel de revisão" description={reviewCase.code}>
                <div className="space-y-4">
                  {/* Report summary */}
                  <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-4">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Resumo do relatório
                    </p>
                    <p className="text-xs leading-5 text-slate-300 line-clamp-4">
                      {reviewReport.summary}
                    </p>
                  </div>

                  {/* Checklist */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-semibold text-slate-300">
                        Checklist de revisão
                      </p>
                      <span className="text-[11px] text-slate-500">
                        {checklistDone}/{checklist.length}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {checklist.map((item) => (
                        <label
                          className="flex cursor-pointer items-start gap-3 rounded-lg p-2 hover:bg-white/[0.03] transition"
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
                                : "text-slate-300"
                            }`}
                          >
                            {item.label}
                          </span>
                        </label>
                      ))}
                    </div>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.08]">
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
                    <label className="block mb-1.5 text-xs font-medium text-slate-400">
                      Observações do analista
                    </label>
                    <textarea
                      className="min-h-20 w-full resize-y rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-xs text-slate-200 placeholder:text-slate-500 outline-none focus:border-brand-blue/40 transition"
                      onChange={(e) => setObservation(e.target.value)}
                      placeholder="Adicione observações, ressalvas ou instruções de ajuste..."
                      value={observation}
                    />
                  </div>

                  {/* Action buttons */}
                  <div className="space-y-2 border-t border-white/[0.06] pt-4">
                    <button
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-teal py-3 text-sm font-semibold text-white shadow-glow-teal hover:bg-brand-teal-dark transition"
                      onClick={() => {
                        setAction({ type: "approve", reviewId: review.id });
                        handleAction();
                      }}
                      type="button"
                    >
                      <ThumbsUp size={15} />
                      Aprovar relatório
                    </button>
                    <button
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 py-3 text-sm font-semibold text-amber-300 hover:bg-amber-500/20 transition"
                      onClick={() => {
                        setAction({ type: "adjust", reviewId: review.id });
                        handleAction();
                      }}
                      type="button"
                    >
                      <MessageSquare size={15} />
                      Solicitar ajuste
                    </button>
                    <button
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 py-3 text-sm font-semibold text-red-300 hover:bg-red-500/20 transition"
                      onClick={() => {
                        setAction({ type: "reject", reviewId: review.id });
                        handleAction();
                      }}
                      type="button"
                    >
                      <ThumbsDown size={15} />
                      Rejeitar análise
                    </button>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="flex flex-col items-center rounded-xl border border-dashed border-white/[0.08] py-16 text-center">
                <ClipboardCheck className="mb-3 text-slate-600" size={28} />
                <p className="text-sm text-slate-400">
                  Selecione um caso para iniciar a revisão.
                </p>
              </div>
            )}
          </div>
        </div>
      </AppLayout>
    </AuthGuard>
  );
}
