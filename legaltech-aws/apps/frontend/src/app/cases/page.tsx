"use client";

import {
  BriefcaseBusiness,
  Calendar,
  FileText,
  Filter,
  Plus,
  RefreshCw,
  Search
} from "lucide-react";
import Link from "next/link";
import type { FormEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { AppLayout } from "@/components/AppLayout";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { FormField, SelectInput, TextArea, TextInput } from "@/components/FormField";
import { LoadingState } from "@/components/LoadingState";
import { Notification } from "@/components/Notification";
import { PageTitle } from "@/components/PageTitle";
import { PriorityBadge } from "@/components/PriorityBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate } from "@/lib/formatters";
import { ApiClientError } from "@/src/services/apiClient";
import { createCase, listCases } from "@/src/services/cases";
import { listClients } from "@/src/services/clients";
import { validateCaseForm, type ValidationErrors } from "@/src/lib/validation";
import type { Case, CaseCreate, Client, Priority, ProductType } from "@/types";

const caseTypeLabel: Record<string, string> = {
  compra_venda: "Compra e Venda",
  confidencialidade: "Confidencialidade (NDA)",
  contract_analysis: "Análise Contratual",
  due_diligence: "Due Diligence",
  locacao: "Locação",
  outro: "Outro",
  parceria: "Parceria",
  prestacao_servicos: "Prestação de Serviços"
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
  title: string;
};

const emptyCaseForm: CaseForm = {
  caseType: "contract_analysis",
  clientId: "",
  notes: "",
  priority: "normal",
  product: "analise_contratual",
  title: ""
};

function errorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    return `${error.code}: ${error.message}`;
  }

  return error instanceof Error ? error.message : "Não foi possível carregar casos.";
}

function caseDisplayTitle(legalCase: Case): string {
  const title = legalCase.metadata?.title;
  return typeof title === "string" && title.trim()
    ? title
    : caseTypeLabel[legalCase.caseType] ?? legalCase.caseType;
}

export default function CasesPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [error, setError] = useState("");
  const [fallbackReason, setFallbackReason] = useState("");
  const [filter, setFilter] = useState("");
  const [form, setForm] = useState<CaseForm>(emptyCaseForm);
  const [formErrors, setFormErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const refreshCases = useCallback(async () => {
    setLoading(true);
    setError("");
    setSuccessMessage("");

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
        ? [
            legalCase.code,
            legalCase.clientName,
            legalCase.caseType,
            caseDisplayTitle(legalCase)
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalized)
        : true;
      return matchesStatus && matchesQuery;
    });
  }, [cases, filter, query]);

  function updateForm<K extends keyof CaseForm>(field: K, value: CaseForm[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setFormErrors((current) => ({ ...current, [field]: "" }));
    setError("");
    setSuccessMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) {
      return;
    }

    const validation = validateCaseForm(form);
    setFormErrors(validation.errors);
    if (!validation.valid) {
      setError("Revise os campos destacados antes de criar o caso.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      const payload: CaseCreate = {
        case_type: form.caseType,
        client_id: form.clientId,
        metadata: {
          notes: form.notes.trim(),
          product: form.product,
          source: "frontend",
          title: form.title.trim()
        },
        priority: form.priority
      };
      const result = await createCase(payload, clients);
      setCases((current) => [result.data, ...current]);
      setFallbackReason(result.source === "mock" ? result.fallbackReason ?? "" : "");
      setSuccessMessage(
        result.source === "mock"
          ? "Caso criado no fallback local de desenvolvimento."
          : "Caso criado com sucesso no backend."
      );
      setShowForm(false);
      setForm((current) => ({
        ...emptyCaseForm,
        clientId: current.clientId || clients[0]?.id || ""
      }));
      setFormErrors({});
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
                loading={loading}
                onClick={() => void refreshCases()}
                variant="secondary"
              >
                Atualizar
              </Button>
              <Button
                icon={<Plus aria-hidden="true" size={15} />}
                onClick={() => {
                  setShowForm((current) => !current);
                  setError("");
                  setSuccessMessage("");
                }}
              >
                Novo caso
              </Button>
            </div>
          }
          description="Casos jurídicos carregados do backend FastAPI e vinculados a clientes da organização autenticada."
          eyebrow="Casos"
          title="Fluxos jurídicos"
        />

        {fallbackReason && (
          <Notification title="Fallback local ativo" tone="warning">
            A API não respondeu. A lista usa dados fictícios e não substitui validação com PostgreSQL local.
          </Notification>
        )}
        {successMessage && (
          <Notification onDismiss={() => setSuccessMessage("")} title="Operação concluída" tone="success">
            {successMessage}
          </Notification>
        )}
        {error && !loading && (
          <Notification onDismiss={() => setError("")} title="Atenção" tone="error">
            {error}
          </Notification>
        )}

        {showForm && (
          <form
            className="cv-form-card mb-6 p-4 sm:p-5"
            onSubmit={handleSubmit}
          >
            <div className="mb-4 flex flex-col gap-1">
              <h2 className="text-sm font-semibold text-[var(--text)]">Novo caso</h2>
              <p className="text-xs leading-5 text-[var(--text2)]">
                O tenant vem do JWT dev. Selecione apenas cliente e metadados do fluxo jurídico.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <FormField error={formErrors.title} label="Título do caso" required>
                  <TextInput
                    invalid={Boolean(formErrors.title)}
                    onChange={(event) => updateForm("title", event.target.value)}
                    placeholder="Análise contratual fictícia"
                    value={form.title}
                  />
                </FormField>
              </div>
              <FormField error={formErrors.clientId} label="Cliente vinculado" required>
                <SelectInput
                  disabled={clients.length === 0}
                  invalid={Boolean(formErrors.clientId)}
                  onChange={(event) => updateForm("clientId", event.target.value)}
                  value={form.clientId}
                >
                  {clients.length === 0 ? (
                    <option value="">Nenhum cliente disponível</option>
                  ) : (
                    clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))
                  )}
                </SelectInput>
              </FormField>
              <FormField error={formErrors.caseType} label="Tipo de caso" required>
                <SelectInput
                  invalid={Boolean(formErrors.caseType)}
                  onChange={(event) => updateForm("caseType", event.target.value)}
                  value={form.caseType}
                >
                  {contractTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.label}
                    </option>
                  ))}
                </SelectInput>
              </FormField>
              <FormField label="Produto">
                <SelectInput
                  onChange={(event) => updateForm("product", event.target.value as ProductType)}
                  value={form.product}
                >
                  {productOptions.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.label}
                    </option>
                  ))}
                </SelectInput>
              </FormField>
              <FormField error={formErrors.priority} label="Prioridade" required>
                <SelectInput
                  invalid={Boolean(formErrors.priority)}
                  onChange={(event) => updateForm("priority", event.target.value as Priority)}
                  value={form.priority}
                >
                  <option value="low">Baixa</option>
                  <option value="normal">Normal</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </SelectInput>
              </FormField>
              <div className="md:col-span-2">
                <FormField label="Observações">
                  <TextArea
                    onChange={(event) => updateForm("notes", event.target.value)}
                    placeholder="Observação fictícia de desenvolvimento"
                    value={form.notes}
                  />
                </FormField>
              </div>
            </div>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button disabled={submitting} onClick={() => setShowForm(false)} variant="secondary">
                Cancelar
              </Button>
              <Button loading={submitting} type="submit">
                Criar caso
              </Button>
            </div>
          </form>
        )}

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full max-w-sm sm:w-80">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text3)]"
                size={14}
              />
              <input
                className="cv-input w-full pl-9 pr-3 text-sm"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar casos..."
                type="search"
                value={query}
              />
            </div>
            <div className="relative w-full sm:w-auto">
              <Filter
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text3)]"
                size={13}
              />
              <select
                className="cv-input w-full pl-9 pr-3 text-xs font-medium [&_option]:bg-[var(--surf)]"
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
          {!loading && (
            <p className="text-xs text-[var(--text2)]">
              {filteredCases.length} caso{filteredCases.length !== 1 ? "s" : ""} exibido{filteredCases.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {loading ? (
          <LoadingState
            description="Carregando clientes e casos da API real ou fallback local."
            label="Carregando casos"
          />
        ) : error && cases.length === 0 ? (
          <ErrorState
            action={
              <Button icon={<RefreshCw size={15} />} onClick={() => void refreshCases()} variant="secondary">
                Tentar novamente
              </Button>
            }
            description="A listagem de casos não pôde ser carregada. Se for 401/403, gere um JWT dev com permissões adequadas."
            details={error}
          />
        ) : filteredCases.length === 0 ? (
          <EmptyState
            action={
              <Button icon={<Plus size={15} />} onClick={() => setShowForm(true)}>
                Criar caso
              </Button>
            }
            description={clients.length === 0 ? "Cadastre um cliente antes de criar casos." : "Crie um caso fictício para validar o fluxo integrado com backend."}
            icon={<BriefcaseBusiness size={20} />}
            title={query || filter ? "Nenhum caso corresponde aos filtros" : "Nenhum caso encontrado"}
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {filteredCases.map((c) => (
              <Link
                className="cv-card cv-card-hover group block p-5"
                href={`/cases/${c.id}`}
                key={c.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--bd)] bg-[var(--surf2)] transition group-hover:border-[rgba(32,201,151,0.25)] group-hover:bg-[var(--teal-dim)]">
                    <BriefcaseBusiness
                      className="text-[var(--text2)] transition group-hover:text-[var(--teal)]"
                      size={18}
                    />
                  </div>
                  <StatusBadge status={c.status} />
                </div>

                <p className="mt-4 text-[11px] font-semibold text-brand-teal">
                  {c.code}
                </p>
                <h2 className="mt-1 line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-[var(--text)]">
                  {caseDisplayTitle(c)}
                </h2>
                <p className="mt-1 truncate text-xs text-[var(--text2)]">{c.clientName}</p>
                <p className="mt-1 text-[11px] text-[var(--text3)]">
                  {caseTypeLabel[c.caseType] ?? c.caseType}
                </p>

                <div className="mt-4">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-[10px] text-[var(--text3)]">Progresso</span>
                    <span className="text-[10px] font-semibold text-[var(--text2)]">
                      {c.progressPercent}%
                    </span>
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-[var(--surf3)]">
                    <div
                      className={`h-1 rounded-full transition-all ${
                        c.progressPercent === 100
                          ? "bg-teal-500"
                          : c.progressPercent > 60
                            ? "bg-brand-teal"
                            : "bg-violet-500"
                      }`}
                      style={{ width: `${c.progressPercent}%` }}
                    />
                  </div>
                </div>

                <dl className="mt-4 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-[var(--text2)]">
                    <FileText size={11} />
                    {c.documentsCount} documentos
                  </div>
                  <PriorityBadge priority={c.priority} />
                </dl>

                <div className="mt-3 flex items-center gap-1.5 border-t border-[var(--bd)] pt-3 text-[11px] text-[var(--text3)]">
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
