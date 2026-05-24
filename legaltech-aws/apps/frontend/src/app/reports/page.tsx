import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Lock
} from "lucide-react";
import Link from "next/link";

import { AppLayout } from "@/components/AppLayout";
import { AuthGuard } from "@/components/AuthGuard";
import { Card } from "@/components/Card";
import { PageTitle } from "@/components/PageTitle";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate } from "@/lib/formatters";
import { mockReports } from "@/lib/mockData";

const statusIcon: Record<string, React.ReactNode> = {
  draft: <Clock className="text-slate-400" size={16} />,
  in_review: <AlertTriangle className="text-yellow-400" size={16} />,
  approved: <CheckCircle2 className="text-teal-400" size={16} />,
  delivered: <CheckCircle2 className="text-emerald-400" size={16} />,
  rejected: <AlertTriangle className="text-red-400" size={16} />
};

export default function ReportsPage() {
  const approved = mockReports.filter(
    (r) => r.status === "approved" || r.status === "delivered"
  ).length;
  const pending = mockReports.filter((r) => r.status === "in_review").length;

  return (
    <AuthGuard>
      <AppLayout>
        <PageTitle
          description="Relatórios gerados pela plataforma. O relatório final só é disponibilizado após revisão humana obrigatória."
          eyebrow="Relatórios"
          title="Relatórios jurídicos"
        />

        {/* Summary cards */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          {[
            {
              label: "Total de relatórios",
              value: mockReports.length,
              color: "text-brand-blue-light",
              bg: "bg-brand-blue/10 border-brand-blue/20"
            },
            {
              label: "Em revisão humana",
              value: pending,
              color: "text-yellow-400",
              bg: "bg-yellow-500/10 border-yellow-500/20"
            },
            {
              label: "Aprovados/entregues",
              value: approved,
              color: "text-teal-400",
              bg: "bg-teal-500/10 border-teal-500/20"
            }
          ].map((m) => (
            <div
              className={`rounded-xl border ${m.bg} p-5`}
              key={m.label}
            >
              <p className="text-xs text-slate-400">{m.label}</p>
              <p className={`mt-2 text-3xl font-bold ${m.color}`}>{m.value}</p>
            </div>
          ))}
        </div>

        {/* Human review notice */}
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-5 py-4">
          <Lock className="shrink-0 text-yellow-400" size={18} />
          <p className="text-xs leading-5 text-slate-300">
            <span className="font-semibold text-yellow-300">
              Revisão humana obrigatória:
            </span>{" "}
            Nenhum relatório é entregue ao cliente sem aprovação de um analista
            jurídico especializado. Esta é uma garantia de qualidade e
            responsabilidade da plataforma.
          </p>
        </div>

        {/* Reports list */}
        <div className="space-y-4">
          {mockReports.map((report) => (
            <div
              className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6"
              key={report.id}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04]">
                    {statusIcon[report.status] ?? <FileText size={18} />}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-[11px] font-semibold text-brand-blue-light">
                        {report.caseCode}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        v{report.version}
                      </span>
                      <StatusBadge status={report.status} />
                    </div>
                    <h2 className="text-sm font-semibold text-slate-100">
                      {report.title}
                    </h2>
                    <p className="mt-1 text-xs leading-5 text-slate-400 line-clamp-2">
                      {report.summary}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-[11px] text-slate-500">Gerado em</p>
                    <p className="text-xs font-medium text-slate-300">
                      {formatDate(report.generatedAt)}
                    </p>
                    {report.approvedBy && (
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        por {report.approvedBy}
                      </p>
                    )}
                  </div>
                  <Link
                    className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs font-medium text-slate-300 hover:bg-white/[0.07] transition"
                    href={`/cases/${report.caseId}`}
                  >
                    Ver caso
                  </Link>
                  <button
                    className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs font-medium text-slate-500 cursor-not-allowed opacity-50"
                    disabled={
                      report.status !== "approved" && report.status !== "delivered"
                    }
                    type="button"
                    title={
                      report.status !== "approved" && report.status !== "delivered"
                        ? "Disponível apenas após aprovação"
                        : "Baixar PDF"
                    }
                  >
                    <Download size={13} />
                    PDF
                  </button>
                </div>
              </div>

              {/* Risks summary */}
              {report.risks.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2 border-t border-white/[0.06] pt-4">
                  {report.risks.map((risk) => (
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                        risk.level === "high"
                          ? "bg-red-500/10 text-red-300"
                          : risk.level === "medium"
                          ? "bg-amber-500/10 text-amber-300"
                          : "bg-green-500/10 text-green-300"
                      }`}
                      key={risk.id}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          risk.level === "high"
                            ? "bg-red-400"
                            : risk.level === "medium"
                            ? "bg-amber-400"
                            : "bg-green-400"
                        }`}
                      />
                      {risk.title}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </AppLayout>
    </AuthGuard>
  );
}
