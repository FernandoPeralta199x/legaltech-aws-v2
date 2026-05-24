import {
  BriefcaseBusiness,
  Calendar,
  FileText,
  Filter,
  Plus,
  Search
} from "lucide-react";
import Link from "next/link";

import { AppLayout } from "@/components/AppLayout";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { PageTitle } from "@/components/PageTitle";
import { PriorityBadge } from "@/components/PriorityBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate } from "@/lib/formatters";
import { mockCases } from "@/lib/mockData";

const caseTypeLabel: Record<string, string> = {
  compra_venda: "Compra e Venda",
  prestacao_servicos: "Prestação de Serviços",
  locacao: "Locação",
  parceria: "Parceria",
  confidencialidade: "Confidencialidade (NDA)",
  due_diligence: "Due Diligence",
  outro: "Outro"
};

export default function CasesPage() {
  return (
    <AuthGuard>
      <AppLayout>
        <PageTitle
          actions={
            <Button href="/cases/new" icon={<Plus aria-hidden="true" size={15} />}>
              Novo caso
            </Button>
          }
          description="Todos os casos jurídicos com acompanhamento de status e documentos."
          eyebrow="Casos"
          title="Fluxos jurídicos"
        />

        {/* Filters bar */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              size={14}
            />
            <input
              className="h-9 w-full rounded-lg border border-white/[0.08] bg-white/[0.04] pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-500 outline-none transition focus:border-brand-blue/40"
              placeholder="Buscar casos..."
              type="search"
            />
          </div>
          <button className="flex h-9 items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 text-xs font-medium text-slate-400 hover:bg-white/[0.07] transition">
            <Filter size={13} />
            Filtrar por status
          </button>
        </div>

        {mockCases.length === 0 ? (
          <EmptyState
            action={
              <Button href="/cases/new" icon={<Plus size={15} />}>
                Criar primeiro caso
              </Button>
            }
            description="Crie um novo caso para iniciar a análise jurídica."
            title="Nenhum caso encontrado"
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {mockCases.map((c) => (
              <Link
                className="group block rounded-xl border border-white/[0.08] bg-white/[0.03] p-5 transition-all hover:border-brand-blue/25 hover:bg-white/[0.05] hover:-translate-y-0.5 hover:shadow-card-hover"
                href={`/cases/${c.id}`}
                key={c.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] group-hover:border-brand-blue/20 group-hover:bg-brand-blue/5 transition">
                    <BriefcaseBusiness
                      className="text-slate-400 group-hover:text-brand-blue-light transition"
                      size={18}
                    />
                  </div>
                  <StatusBadge status={c.status} />
                </div>

                <p className="mt-4 text-[11px] font-semibold text-brand-blue-light">
                  {c.code}
                </p>
                <h2 className="mt-1 text-sm font-semibold text-slate-100">
                  {caseTypeLabel[c.caseType] ?? c.caseType}
                </h2>
                <p className="mt-1 text-xs text-slate-400">{c.clientName}</p>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] text-slate-500">Progresso</span>
                    <span className="text-[10px] font-semibold text-slate-300">
                      {c.progressPercent}%
                    </span>
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-white/[0.08]">
                    <div
                      className={`h-1 rounded-full transition-all ${
                        c.progressPercent === 100
                          ? "bg-teal-500"
                          : c.progressPercent > 60
                          ? "bg-brand-blue"
                          : "bg-violet-500"
                      }`}
                      style={{ width: `${c.progressPercent}%` }}
                    />
                  </div>
                </div>

                <dl className="mt-4 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <FileText size={11} />
                    {c.documentsCount} documentos
                  </div>
                  <PriorityBadge priority={c.priority} />
                </dl>

                <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500 border-t border-white/[0.06] pt-3">
                  <Calendar size={11} />
                  Atualizado em {formatDate(c.updatedAt)}
                </div>
              </Link>
            ))}
          </div>
        )}
      </AppLayout>
    </AuthGuard>
  );
}
