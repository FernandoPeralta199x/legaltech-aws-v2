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
  Mail,
  Pencil,
  Phone,
  Plus,
  Shield,
  Users
} from "lucide-react";
import type { FormEvent } from "react";
import Link from "next/link";
import { use, useCallback, useEffect, useState } from "react";

import { AgentCard } from "@/components/AgentCard";
import { AppLayout } from "@/components/AppLayout";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { FormField, SelectInput, TextArea, TextInput } from "@/components/FormField";
import { LoadingState } from "@/components/LoadingState";
import { Notification } from "@/components/Notification";
import { PriorityBadge } from "@/components/PriorityBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { Timeline } from "@/components/Timeline";
import { formatDate } from "@/lib/formatters";
import { ApiClientError } from "@/src/services/apiClient";
import {
  createCaseParty,
  listCaseParties,
  updateCaseParty
} from "@/src/services/caseParties";
import { getCase } from "@/src/services/cases";
import { listClients } from "@/src/services/clients";
import { listDocuments } from "@/src/services/documents";
import type { Case, CaseParty, CasePartyCreate, CasePartyUpdate, Document } from "@/types";
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

const partyTypeOptions = [
  { label: "Cliente", value: "cliente" },
  { label: "Contraparte", value: "contraparte" },
  { label: "Testemunha", value: "testemunha" },
  { label: "Responsável", value: "responsavel" },
  { label: "Outro", value: "outro" }
];

const partyTypeLabel: Record<string, string> = {
  avalista: "Avalista",
  cliente: "Cliente",
  contraparte: "Contraparte",
  contratada: "Contratada",
  contratante: "Contratante",
  fiador: "Fiador",
  outro: "Outro",
  responsavel: "Responsável",
  testemunha: "Testemunha"
};

const emptyPartyForm: CasePartyCreate = {
  document: "",
  email: "",
  name: "",
  notes: "",
  party_type: "cliente",
  phone: ""
};

type PageProps = { params: Promise<{ id: string }> };
type PartyFormErrors = Partial<Record<keyof CasePartyCreate, string>>;

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

function validatePartyForm(form: CasePartyCreate): PartyFormErrors {
  const errors: PartyFormErrors = {};
  const document = form.document?.trim() ?? "";
  const email = form.email?.trim() ?? "";

  if (!form.name.trim()) {
    errors.name = "Informe o nome da parte.";
  }

  if (!form.party_type.trim()) {
    errors.party_type = "Selecione o papel da parte.";
  }

  if (document && !/^[A-Za-z0-9./-]+$/.test(document)) {
    errors.document = "Use apenas números, letras, pontos, barras ou hífens.";
  }

  if (email && !email.includes("@")) {
    errors.email = "Informe um e-mail válido ou deixe o campo vazio.";
  }

  return errors;
}

function buildPartyPayload(form: CasePartyCreate): CasePartyCreate {
  return {
    document: form.document?.trim() || null,
    email: form.email?.trim() || null,
    name: form.name.trim(),
    notes: form.notes?.trim() || null,
    party_type: form.party_type,
    phone: form.phone?.trim() || null
  };
}

function partyFormFromParty(party: CaseParty): CasePartyCreate {
  return {
    document: party.document ?? "",
    email: party.email ?? "",
    name: party.name,
    notes: party.notes ?? "",
    party_type: party.type,
    phone: party.phone ?? ""
  };
}

export default function CaseDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState("overview");
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [caseDocuments, setCaseDocuments] = useState<Document[]>([]);
  const [caseParties, setCaseParties] = useState<CaseParty[]>([]);
  const [editingParty, setEditingParty] = useState<CaseParty | null>(null);
  const [error, setError] = useState("");
  const [fallbackReason, setFallbackReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [partyError, setPartyError] = useState("");
  const [partyForm, setPartyForm] = useState<CasePartyCreate>(emptyPartyForm);
  const [partyFormErrors, setPartyFormErrors] = useState<PartyFormErrors>({});
  const [partySubmitting, setPartySubmitting] = useState(false);
  const [partySuccessMessage, setPartySuccessMessage] = useState("");
  const [showPartyForm, setShowPartyForm] = useState(false);

  const refreshCase = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const clientsResult = await listClients();
      const [caseResult, documentsResult, partiesResult] = await Promise.all([
        getCase(id, clientsResult.data),
        listDocuments({ caseId: id }),
        listCaseParties(id)
      ]);
      setCaseData({
        ...caseResult.data,
        documentsCount: documentsResult.data.length,
        parties: partiesResult.data
      });
      setCaseDocuments(documentsResult.data);
      setCaseParties(partiesResult.data);
      setFallbackReason(
        clientsResult.source === "mock" ||
          caseResult.source === "mock" ||
          documentsResult.source === "mock" ||
          partiesResult.source === "mock"
          ? clientsResult.fallbackReason ??
              caseResult.fallbackReason ??
              documentsResult.fallbackReason ??
              partiesResult.fallbackReason ??
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

  function syncCaseParties(updater: (current: CaseParty[]) => CaseParty[]) {
    setCaseParties((current) => {
      const next = updater(current);
      setCaseData((currentCase) =>
        currentCase ? { ...currentCase, parties: next } : currentCase
      );
      return next;
    });
  }

  function resetPartyForm() {
    setEditingParty(null);
    setPartyForm(emptyPartyForm);
    setPartyFormErrors({});
    setPartyError("");
    setShowPartyForm(false);
  }

  function startCreateParty() {
    setEditingParty(null);
    setPartyForm(emptyPartyForm);
    setPartyFormErrors({});
    setPartyError("");
    setPartySuccessMessage("");
    setShowPartyForm(true);
  }

  function startEditParty(party: CaseParty) {
    setEditingParty(party);
    setPartyForm(partyFormFromParty(party));
    setPartyFormErrors({});
    setPartyError("");
    setPartySuccessMessage("");
    setShowPartyForm(true);
  }

  function updatePartyForm<K extends keyof CasePartyCreate>(
    field: K,
    value: CasePartyCreate[K]
  ) {
    setPartyForm((current) => ({ ...current, [field]: value }));
    setPartyFormErrors((current) => ({ ...current, [field]: "" }));
    setPartyError("");
    setPartySuccessMessage("");
  }

  async function handlePartySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (partySubmitting) {
      return;
    }

    const validationErrors = validatePartyForm(partyForm);
    setPartyFormErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      setPartyError("Revise os campos destacados antes de salvar a parte.");
      return;
    }

    setPartySubmitting(true);
    setPartyError("");
    setPartySuccessMessage("");

    try {
      const payload = buildPartyPayload(partyForm);
      const result = editingParty
        ? await updateCaseParty(id, editingParty.id, payload as CasePartyUpdate)
        : await createCaseParty(id, payload);

      syncCaseParties((current) =>
        editingParty
          ? current.map((party) =>
              party.id === result.data.id ? result.data : party
            )
          : [result.data, ...current]
      );
      setFallbackReason(result.source === "mock" ? result.fallbackReason ?? "" : "");
      setPartySuccessMessage(
        result.source === "mock"
          ? editingParty
            ? "Parte atualizada no fallback local de desenvolvimento."
            : "Parte criada no fallback local de desenvolvimento."
          : editingParty
            ? "Parte atualizada com sucesso no backend."
            : "Parte criada com sucesso no backend."
      );
      resetPartyForm();
    } catch (err) {
      setPartyError(errorMessage(err));
    } finally {
      setPartySubmitting(false);
    }
  }

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
        {partySuccessMessage && (
          <Notification
            onDismiss={() => setPartySuccessMessage("")}
            title="Partes atualizadas"
            tone="success"
          >
            {partySuccessMessage}
          </Notification>
        )}
        {partyError && (
          <Notification onDismiss={() => setPartyError("")} title="Atenção" tone="error">
            {partyError}
          </Notification>
        )}

        {/* Breadcrumb */}
        <Link
          className="mb-4 flex items-center gap-1.5 text-xs text-[var(--text2)] transition hover:text-[var(--teal)]"
          href="/cases"
        >
          <ArrowLeft size={14} />
          Todos os casos
        </Link>

        {/* Case header */}
        <div className="cv-card mb-6 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-brand-teal">
                  {caseData.code}
                </span>
                <StatusBadge status={caseData.status} />
                <PriorityBadge priority={caseData.priority} />
              </div>
              <h1 className="text-xl font-bold text-[var(--text)]">
                {caseDisplayTitle(caseData)}
              </h1>
              <p className="mt-1 text-sm text-[var(--text2)]">
                {caseData.clientName} · {caseTypeLabel[caseData.caseType] ?? caseData.caseType}
              </p>
              {caseData.notes && (
                <p className="mt-2 text-xs leading-5 text-[var(--text2)]">{caseData.notes}</p>
              )}
            </div>
            <div className="shrink-0 text-left sm:text-right">
              <div className="mb-3 text-left sm:text-right">
                <span className="text-2xl font-bold text-[var(--text)]">
                  {caseData.progressPercent}%
                </span>
                <p className="text-[11px] text-[var(--text2)]">Progresso geral</p>
              </div>
              <div className="h-1.5 w-32 overflow-hidden rounded-full bg-[var(--surf3)]">
                <div
                  className="h-1.5 rounded-full bg-[var(--teal)]"
                  style={{ width: `${caseData.progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          <dl className="mt-6 flex flex-wrap gap-6 border-t border-[var(--bd)] pt-4 text-xs">
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
                <dt className="text-[var(--text3)]">{item.label}</dt>
                <dd className="mt-0.5 font-medium text-[var(--text2)]">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex overflow-x-auto border-b border-[var(--bd)]">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-xs font-medium transition ${
                  active
                    ? "border-[var(--teal)] text-[var(--teal)]"
                    : "border-transparent text-[var(--text2)] hover:text-[var(--text)]"
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
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-4 border-emerald-300 bg-emerald-50">
                  <span className="text-sm font-bold text-brand-teal">
                    {caseData.progressPercent}%
                  </span>
                </div>
                <div>
                  <StatusBadge status={caseData.status} />
                  {caseData.assignedTo && (
                    <p className="mt-1.5 text-xs text-slate-600">
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
                  { label: "Partes", value: caseParties.length },
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
                    <dd className="mt-0.5 text-lg font-bold text-slate-950">{stat.value}</dd>
                  </div>
                ))}
              </dl>
            </Card>

            {caseData.status === "revisao_humana" && (
              <div className="lg:col-span-2 rounded-lg border border-amber-200 bg-amber-50 p-5">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="shrink-0 text-amber-700" size={20} />
                  <div>
                      <p className="text-sm font-semibold text-amber-900">
                      Aguardando revisão humana
                    </p>
                    <p className="mt-0.5 text-xs text-slate-600">
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
            <div className="mb-4 flex justify-end">
              <Button icon={<Plus aria-hidden="true" size={15} />} onClick={startCreateParty}>
                Adicionar parte
              </Button>
            </div>
            {caseParties.length === 0 ? (
              <EmptyState
                action={
                  <Button icon={<Plus size={15} />} onClick={startCreateParty}>
                    Adicionar parte
                  </Button>
                }
                description="Cadastre partes fictícias vinculadas a este caso para validar o fluxo local."
                icon={<Users size={20} />}
                title="Nenhuma parte cadastrada"
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {caseParties.map((party) => (
                  <Card key={party.id}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--bd)] bg-[var(--surf2)] text-xs font-bold text-[var(--teal)]">
                          {party.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[var(--text)]">
                            {party.name}
                          </p>
                          <span className="inline-flex rounded-md bg-[var(--surf3)] px-2 py-0.5 text-[11px] text-[var(--text2)]">
                            {partyTypeLabel[party.type] ?? party.type}
                          </span>
                        </div>
                      </div>
                      <Button
                        aria-label={`Editar parte ${party.name}`}
                        icon={<Pencil aria-hidden="true" size={14} />}
                        onClick={() => startEditParty(party)}
                        size="sm"
                        variant="secondary"
                      >
                        Editar
                      </Button>
                    </div>
                    <dl className="mt-4 space-y-2 text-xs">
                      <div className="flex min-w-0 items-center gap-2 text-[var(--text2)]">
                        <FileText size={12} className="shrink-0 text-[var(--text3)]" />
                        <span className="truncate">{party.document || "Documento não informado"}</span>
                      </div>
                      <div className="flex min-w-0 items-center gap-2 text-[var(--text2)]">
                        <Mail size={12} className="shrink-0 text-[var(--text3)]" />
                        <span className="truncate">{party.email || "E-mail não informado"}</span>
                      </div>
                      <div className="flex min-w-0 items-center gap-2 text-[var(--text2)]">
                        <Phone size={12} className="shrink-0 text-[var(--text3)]" />
                        <span className="truncate">{party.phone || "Telefone não informado"}</span>
                      </div>
                    </dl>
                    {party.notes && (
                      <p className="mt-3 border-t border-[var(--bd)] pt-3 text-xs leading-5 text-[var(--text2)]">
                        {party.notes}
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            )}
            {showPartyForm && (
              <div
                aria-modal="true"
                className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-8 backdrop-blur-sm"
                role="dialog"
              >
                <form
                  className="cv-card max-h-[calc(100vh-4rem)] w-full max-w-2xl overflow-y-auto p-5 shadow-2xl"
                  onSubmit={handlePartySubmit}
                >
                  <div className="mb-5">
                    <h2 className="text-sm font-semibold text-[var(--text)]">
                      {editingParty ? "Editar parte" : "Adicionar parte"}
                    </h2>
                    <p className="mt-1 text-xs leading-5 text-[var(--text2)]">
                      Use apenas dados fictícios. O vínculo com organização e caso é validado pelo backend.
                    </p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField error={partyFormErrors.name} label="Nome da parte" required>
                      <TextInput
                        invalid={Boolean(partyFormErrors.name)}
                        onChange={(event) => updatePartyForm("name", event.target.value)}
                        placeholder="Parte fictícia"
                        value={partyForm.name}
                      />
                    </FormField>
                    <FormField error={partyFormErrors.party_type} label="Papel" required>
                      <SelectInput
                        invalid={Boolean(partyFormErrors.party_type)}
                        onChange={(event) => updatePartyForm("party_type", event.target.value)}
                        value={partyForm.party_type}
                      >
                        {partyTypeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </SelectInput>
                    </FormField>
                    <FormField
                      error={partyFormErrors.document}
                      hint="Opcional. Use identificadores fictícios em ambiente local."
                      label="Documento"
                    >
                      <TextInput
                        invalid={Boolean(partyFormErrors.document)}
                        onChange={(event) => updatePartyForm("document", event.target.value)}
                        placeholder="00000000000"
                        value={partyForm.document ?? ""}
                      />
                    </FormField>
                    <FormField error={partyFormErrors.email} label="E-mail">
                      <TextInput
                        invalid={Boolean(partyFormErrors.email)}
                        onChange={(event) => updatePartyForm("email", event.target.value)}
                        placeholder="parte@example.test"
                        type="email"
                        value={partyForm.email ?? ""}
                      />
                    </FormField>
                    <FormField label="Telefone">
                      <TextInput
                        onChange={(event) => updatePartyForm("phone", event.target.value)}
                        placeholder="+5500000000000"
                        value={partyForm.phone ?? ""}
                      />
                    </FormField>
                    <FormField label="Observações">
                      <TextArea
                        onChange={(event) => updatePartyForm("notes", event.target.value)}
                        placeholder="Observações fictícias sobre a parte"
                        value={partyForm.notes ?? ""}
                      />
                    </FormField>
                  </div>
                  <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <Button disabled={partySubmitting} onClick={resetPartyForm} variant="secondary">
                      Cancelar
                    </Button>
                    <Button loading={partySubmitting} type="submit">
                      {editingParty ? "Salvar alterações" : "Adicionar parte"}
                    </Button>
                  </div>
                </form>
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
                  className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:gap-4"
                  key={doc.id}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                    <FileText className="text-slate-600" size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {doc.filename}
                    </p>
                    <p className="text-xs text-slate-500">
                      {doc.sizeLabel} · {formatDate(doc.uploadedAt)}
                    </p>
                  </div>
                  <div className="self-start sm:self-center">
                    <StatusBadge status={doc.status} />
                  </div>
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
              <Bot className="text-brand-teal" size={18} />
              <h2 className="text-sm font-semibold text-slate-900">
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
                      <h2 className="text-sm font-bold text-slate-900">
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
                    <div className="mb-5 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                      <AlertTriangle className="shrink-0 text-amber-700" size={16} />
                      <p className="text-xs text-amber-800">
                        Este relatório está em revisão humana obrigatória. Aguarde
                        a aprovação de um analista antes da entrega ao cliente.
                      </p>
                    </div>
                  )}

                  <p className="text-sm leading-6 text-slate-700">
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
                            <p className="text-sm font-semibold text-slate-900">
                              {risk.title}
                            </p>
                          </div>
                          <p className="text-xs leading-5 text-slate-600">
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
                            className="mt-0.5 shrink-0 text-emerald-600"
                            size={14}
                          />
                          <p className="text-xs leading-5 text-slate-700">{rec}</p>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4">
                  <FileText className="shrink-0 text-slate-500" size={16} />
                  <p className="text-xs text-slate-600">
                    Download do relatório em PDF disponível somente após aprovação
                    do analista.
                  </p>
                  <button
                    className="ml-auto shrink-0 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 cursor-not-allowed opacity-50"
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
