"use client";

import {
  AlertTriangle,
  BriefcaseBusiness,
  Calendar,
  FileText,
  Filter,
  Plus,
  RefreshCw,
  Search
} from "lucide-react";
import Link from "next/link";
import type { FormEvent, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { AppLayout } from "@/components/AppLayout";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { PageTitle } from "@/components/PageTitle";
import { PriorityBadge } from "@/components/PriorityBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate } from "@/lib/formatters";
import { ApiClientError } from "@/src/services/apiClient";
import { createCase, listCases } from "@/src/services/cases";
import { listClients } from "@/src/services/clients";
import type { Case, CaseCreate, Client, Priority, ProductType } from "@/types";

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

const contractTypes = [
  { id: "contract_analysis", label: "Análise Contratual" },
  { id: "compra_venda", label: "Compra e Venda" },
  { id: "prestacao_servicos", label: "Prestação de Serviços" },
  { id: "locacao", label: "Locação" },
  { id: "confidencialidade", label: "Confidencialidade (NDA)" },
  { id: "due_diligence", label: "Due Diligence" },
  { id: "outro", label: "Outro" }
];

const productOptions: Array<{ id: ProductType; label: string }> = [
  { id: "analise_contratual", label: "Análise contratual" },
  { id: "dados_partes", label: "Dados das partes" },
  { id: "consulta_objeto", label: "Consulta do objeto" },
  { id: "reuniao_equipe", label: "Reunião com equipe" }
];

type CaseForm = {
  caseType: string;
  clientId: string;
  notes: string;
  priority: Priority;
  product: ProductType;
};

function errorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    return `${error.code}: ${error.message}`;
  }

  return error instanceof Error ? error.message : "Não foi possível carregar casos.";
}

export default function CasesPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [error, setError] = useState("");
  const [fallbackReason, setFallbackReason] = useState("");
  const [filter, setFilter] = useState("");
  const [form, setForm] = useState<CaseForm>({
    caseType: "contract_analysis",
    clientId: "",
    notes: "",
    priority: "normal",
    product: "analise_contratual"
  });
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const refreshCases = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const clientsResult = await listClients();
      const casesResult = await listCases(clientsResult.data);
      setClients(clientsResult.data);
      setCases(casesResult.data);
      setForm((current) => ({
        ...current,
        clientId: current.clientId || clientsResult.data[0]?.id || ""
      }));
      setFallbackReason(
        clientsResult.source === "mock" || casesResult.source === "mock"
          ? clientsResult.fallbackReason ?? casesResult.fallbackReason ?? ""
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
      void refreshCases();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [refreshCases]);

  const filteredCases = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return cases.filter((legalCase) => {
      const matchesStatus = filter ? legalCase.status === filter : true;
      const matchesQuery = normalized
        ? [legalCase.code, legalCase.clientName, legalCase.caseType]
            .join(" ")
            .toLowerCase()
            .includes(normalized)
        : true;
      return matchesStatus && matchesQuery;
    });
  }, [cases, filter, query]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.clientId) {
      setError("Crie ou carregue um cliente antes de criar um caso.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const payload: CaseCreate = {
        case_type: form.caseType,
        client_id: form.clientId,
        metadata: {
          notes: form.notes.trim(),
          product: form.product,
          source: "frontend"
        },
        priority: form.priority
      };
      const result = await createCase(payload, clients);
      setCases((current) => [result.data, ...current]);
      setFallbackReason(result.source === "mock" ? result.fallbackReason ?? "" : "");
      setShowForm(false);
      setForm((current) => ({ ...current, notes: "" }));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthGuard>
      <AppLayout>
        <PageTitle
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Button
                icon={<RefreshCw aria-hidden="true" size={15} />}
                onClick={() => void refreshCases()}
                variant="secondary"
              >
                Atualizar
              </Button>
              <Button
                icon={<Plus aria-hidden="true" size={15} />}
                onClick={() => setShowForm((current) => !current)}
              >
                Novo caso
              </Button>
            </div>
          }
          description="Casos jurídicos carregados do backend FastAPI, vinculados a clientes da organização autenticada."
          eyebrow="Casos"
          title="Fluxos jurídicos"
        />

        {fallbackReason && (
          <StatusNotice
            message="Backend indisponível: exibindo dados mockados locais."
            tone="warning"
          />
        )}
        {error && <StatusNotice message={error} tone="error" />}

        {showForm && (
          <form
            className="mb-6 rounded-xl border border-white/[0.08] bg-white/[0.03] p-5"
            onSubmit={handleSubmit}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Cliente vinculado">
                <select
                  className={inputClass}
                  onChange={(event) => setForm((current) => ({ ...current, clientId: event.target.value }))}
                  value={form.clientId}
                >
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Tipo de caso">
                <select
                  className={inputClass}
                  onChange={(event) => setForm((current) => ({ ...current, caseType: event.target.value }))}
                  value={form.caseType}
                >
                  {contractTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Produto">
                <select
                  className={inputClass}
                  onChange={(event) => setForm((current) => ({ ...current, product: event.target.value as ProductType }))}
                  value={form.product}
                >
                  {productOptions.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Prioridade">
                <select
                  className={inputClass}
                  onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value as Priority }))}
                  value={form.priority}
                >
                  <option value="low">Baixa</option>
                  <option value="normal">Normal</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </Field>
              <div className="md:col-span-2">
                <Field label="Observações">
                  <textarea
                    className={`${inputClass} min-h-24 resize-y py-2`}
                    onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                    placeholder="Observação fictícia de desenvolvimento"
                    value={form.notes}
                  />
                </Field>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button loading={submitting} type="submit">
                Criar caso
              </Button>
            </div>
          </form>
        )}

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              size={14}
            />
            <input
              className="h-9 w-full rounded-lg border border-white/[0.08] bg-white/[0.04] pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-500 outline-none transition focus:border-brand-blue/40"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar casos..."
              type="search"
              value={query}
            />
          </div>
          <div className="relative">
            <Filter
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              size={13}
            />
            <select
              className="h-9 rounded-lg border border-white/[0.08] bg-white/[0.04] pl-9 pr-3 text-xs font-medium text-slate-300 outline-none transition focus:border-brand-blue/40 [&_option]:bg-surface-800"
              onChange={(event) => setFilter(event.target.value)}
              value={filter}
            >
              <option value="">Todos os status</option>
              <option value="draft">Rascunho</option>
              <option value="submitted">Enviado</option>
              <option value="processing">Processando</option>
              <option value="review">Revisão</option>
              <option value="approved">Aprovado</option>
              <option value="delivered">Entregue</option>
              <option value="failed">Falha</option>
            </select>
          </div>
        </div>

        {loading ? (
          <LoadingState label="Carregando casos..." />
        ) : filteredCases.length === 0 ? (
          <EmptyState
            action={
              <Button icon={<Plus size={15} />} onClick={() => setShowForm(true)}>
                Criar caso
              </Button>
            }
            description="Crie um novo caso para iniciar a análise jurídica."
            title="Nenhum caso encontrado"
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {filteredCases.map((c) => (
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

const inputClass =
  "h-10 w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-slate-200 placeholder:text-slate-500 outline-none transition focus:border-brand-blue/40 focus:bg-white/[0.06] [&_option]:bg-surface-800";

function Field({ children, label }: { children: ReactNode; label: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-400">{label}</span>
      {children}
    </label>
  );
}

function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex min-h-48 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.02] text-sm text-slate-400">
      {label}
    </div>
  );
}

function StatusNotice({ message, tone }: { message: string; tone: "error" | "warning" }) {
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
