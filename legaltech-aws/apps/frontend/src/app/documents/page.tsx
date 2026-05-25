"use client";

import {
  Download,
  FileText,
  Plus,
  RefreshCw,
  Send
} from "lucide-react";
import Link from "next/link";
import type { FormEvent, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { AppLayout } from "@/components/AppLayout";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { FormField, SelectInput, TextInput } from "@/components/FormField";
import { LoadingState } from "@/components/LoadingState";
import { Notification } from "@/components/Notification";
import { PageTitle } from "@/components/PageTitle";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate } from "@/lib/formatters";
import { ApiClientError } from "@/src/services/apiClient";
import { listCases } from "@/src/services/cases";
import {
  createDocument,
  enqueueDocumentProcessing,
  getDocumentDownloadUrl,
  listDocuments
} from "@/src/services/documents";
import { validateDocumentForm, type ValidationErrors } from "@/src/lib/validation";
import type { Case, Document, DocumentCreate, DocumentStatus } from "@/types";

type DocumentForm = {
  caseId: string;
  contentType: string;
  filename: string;
  notes: string;
  sizeBytes: string;
  status: DocumentStatus;
};

const emptyDocumentForm: DocumentForm = {
  caseId: "",
  contentType: "application/pdf",
  filename: "",
  notes: "",
  sizeBytes: "1024",
  status: "pending_upload"
};

function errorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    return `${error.code}: ${error.message}`;
  }

  return error instanceof Error ? error.message : "Não foi possível carregar documentos.";
}

export default function DocumentsPage() {
  const [actionMessage, setActionMessage] = useState("");
  const [actionBusyId, setActionBusyId] = useState("");
  const [cases, setCases] = useState<Case[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [error, setError] = useState("");
  const [fallbackReason, setFallbackReason] = useState("");
  const [form, setForm] = useState<DocumentForm>(emptyDocumentForm);
  const [formErrors, setFormErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(true);
  const [pendingEnqueue, setPendingEnqueue] = useState<Document | null>(null);
  const [selectedCase, setSelectedCase] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const refreshDocuments = useCallback(async () => {
    setLoading(true);
    setError("");
    setActionMessage("");

    try {
      const [casesResult, documentsResult] = await Promise.all([
        listCases(),
        listDocuments()
      ]);
      setCases(casesResult.data);
      setDocuments(documentsResult.data);
      setForm((current) => ({
        ...current,
        caseId: current.caseId || casesResult.data[0]?.id || ""
      }));
      setFallbackReason(
        casesResult.source === "mock" || documentsResult.source === "mock"
          ? casesResult.fallbackReason ?? documentsResult.fallbackReason ?? ""
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
      void refreshDocuments();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [refreshDocuments]);

  const visibleDocuments = useMemo(() => {
    return selectedCase
      ? documents.filter((document) => document.caseId === selectedCase)
      : documents;
  }, [documents, selectedCase]);

  function updateForm<K extends keyof DocumentForm>(field: K, value: DocumentForm[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setFormErrors((current) => ({ ...current, [field]: "" }));
    setError("");
    setActionMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) {
      return;
    }

    const validation = validateDocumentForm(form);
    setFormErrors(validation.errors);
    if (!validation.valid) {
      setError("Revise os campos destacados antes de criar o metadado do documento.");
      return;
    }

    const sizeBytes = Number(form.sizeBytes);
    setSubmitting(true);
    setError("");
    setActionMessage("");

    try {
      const payload: DocumentCreate = {
        case_id: form.caseId,
        content_type: form.contentType,
        filename: form.filename.trim(),
        metadata: {
          notes: form.notes.trim(),
          source: "frontend_metadata_only"
        },
        size_bytes: sizeBytes,
        status: form.status
      };
      const result = await createDocument(payload);
      setDocuments((current) => [result.data, ...current]);
      setFallbackReason(result.source === "mock" ? result.fallbackReason ?? "" : "");
      setActionMessage(
        result.source === "mock"
          ? "Metadado criado no fallback local. Nenhum arquivo real foi enviado."
          : "Metadado do documento criado com sucesso no backend. Upload real não faz parte desta tela."
      );
      setShowForm(false);
      setForm((current) => ({ ...emptyDocumentForm, caseId: current.caseId }));
      setFormErrors({});
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDownloadUrl(documentId: string) {
    setActionMessage("");
    setError("");
    setActionBusyId(`download-${documentId}`);

    try {
      const result = await getDocumentDownloadUrl(documentId);
      setFallbackReason(result.source === "mock" ? result.fallbackReason ?? fallbackReason : fallbackReason);
      setActionMessage(
        result.source === "mock"
          ? "Backend indisponível: URL temporária simulada para desenvolvimento."
          : `URL temporária gerada. Expiração: ${result.data.expires_in_seconds}s.`
      );
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setActionBusyId("");
    }
  }

  async function confirmEnqueue() {
    if (!pendingEnqueue) {
      return;
    }

    const documentId = pendingEnqueue.id;
    setActionMessage("");
    setError("");
    setActionBusyId(`enqueue-${documentId}`);

    try {
      const result = await enqueueDocumentProcessing(documentId);
      setActionMessage(`Processamento enfileirado: ${result.data.job_id}.`);
      setPendingEnqueue(null);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setActionBusyId("");
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
                onClick={() => void refreshDocuments()}
                variant="secondary"
              >
                Atualizar
              </Button>
              <Button
                icon={<Plus aria-hidden="true" size={15} />}
                onClick={() => {
                  setShowForm((current) => !current);
                  setError("");
                  setActionMessage("");
                }}
              >
                Novo metadado
              </Button>
            </div>
          }
          description="Metadados de documentos vinculados a casos. Upload real, S3 e OCR continuam fora desta tela."
          eyebrow="Documentos"
          title="Documentos enviados"
        />

        {fallbackReason && (
          <Notification title="Fallback local ativo" tone="warning">
            A API não respondeu. Estes documentos são mockados ou simulados para desenvolvimento.
          </Notification>
        )}
        {error && !loading && (
          <Notification onDismiss={() => setError("")} title="Atenção" tone="error">
            {error}
          </Notification>
        )}
        {actionMessage && (
          <Notification onDismiss={() => setActionMessage("")} title="Operação concluída" tone="success">
            {actionMessage}
          </Notification>
        )}

        {showForm && (
          <form
            className="mb-6 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 sm:p-5"
            onSubmit={handleSubmit}
          >
            <div className="mb-4 flex flex-col gap-1">
              <h2 className="text-sm font-semibold text-slate-100">Novo metadado de documento</h2>
              <p className="text-xs leading-5 text-slate-500">
                Esta tela cria apenas metadata. Nenhum upload real, S3, OCR ou IA é executado aqui.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField error={formErrors.caseId} label="Caso vinculado" required>
                <SelectInput
                  disabled={cases.length === 0}
                  invalid={Boolean(formErrors.caseId)}
                  onChange={(event) => updateForm("caseId", event.target.value)}
                  value={form.caseId}
                >
                  {cases.length === 0 ? (
                    <option value="">Nenhum caso disponível</option>
                  ) : (
                    cases.map((legalCase) => (
                      <option key={legalCase.id} value={legalCase.id}>
                        {legalCase.code} · {legalCase.clientName}
                      </option>
                    ))
                  )}
                </SelectInput>
              </FormField>
              <FormField error={formErrors.filename} label="Nome do documento" required>
                <TextInput
                  invalid={Boolean(formErrors.filename)}
                  onChange={(event) => updateForm("filename", event.target.value)}
                  placeholder="contrato-exemplo.pdf"
                  value={form.filename}
                />
              </FormField>
              <FormField error={formErrors.contentType} label="Tipo do arquivo" required>
                <SelectInput
                  invalid={Boolean(formErrors.contentType)}
                  onChange={(event) => updateForm("contentType", event.target.value)}
                  value={form.contentType}
                >
                  <option value="application/pdf">PDF</option>
                  <option value="application/vnd.openxmlformats-officedocument.wordprocessingml.document">DOCX</option>
                  <option value="text/plain">TXT</option>
                </SelectInput>
              </FormField>
              <FormField error={formErrors.sizeBytes} label="Tamanho em bytes" required>
                <TextInput
                  invalid={Boolean(formErrors.sizeBytes)}
                  min={1}
                  onChange={(event) => updateForm("sizeBytes", event.target.value)}
                  type="number"
                  value={form.sizeBytes}
                />
              </FormField>
              <FormField error={formErrors.status} label="Status" required>
                <SelectInput
                  invalid={Boolean(formErrors.status)}
                  onChange={(event) => updateForm("status", event.target.value as DocumentStatus)}
                  value={form.status}
                >
                  <option value="pending_upload">Aguardando upload</option>
                  <option value="uploaded">Enviado</option>
                  <option value="processing">Processando</option>
                  <option value="processed">Processado</option>
                </SelectInput>
              </FormField>
              <FormField label="Observação">
                <TextInput
                  onChange={(event) => updateForm("notes", event.target.value)}
                  placeholder="Metadado fictício de desenvolvimento"
                  value={form.notes}
                />
              </FormField>
            </div>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button disabled={submitting} onClick={() => setShowForm(false)} variant="secondary">
                Cancelar
              </Button>
              <Button loading={submitting} type="submit">
                Criar metadado
              </Button>
            </div>
          </form>
        )}

        <div className="mb-6 max-w-sm">
          <FormField label="Filtrar por caso">
            <SelectInput
              onChange={(event) => setSelectedCase(event.target.value)}
              value={selectedCase}
            >
              <option value="">Todos os casos</option>
              {cases.map((legalCase) => (
                <option key={legalCase.id} value={legalCase.id}>
                  {legalCase.code}
                </option>
              ))}
            </SelectInput>
          </FormField>
        </div>

        <Card
          title="Arquivos recentes"
          description="Metadata real quando o backend está disponível; fallback local em desenvolvimento."
        >
          {loading ? (
            <LoadingState
              description="Carregando casos e documentos vinculados."
              label="Carregando documentos"
              rows={4}
            />
          ) : error && documents.length === 0 ? (
            <ErrorState
              action={
                <Button icon={<RefreshCw size={15} />} onClick={() => void refreshDocuments()} variant="secondary">
                  Tentar novamente
                </Button>
              }
              description="A listagem de documentos não pôde ser carregada. Erros do backend são exibidos sem fallback indevido."
              details={error}
            />
          ) : visibleDocuments.length === 0 ? (
            <EmptyState
              action={
                <Button icon={<Plus size={15} />} onClick={() => setShowForm(true)}>
                  Criar metadado
                </Button>
              }
              description={selectedCase ? "Nenhum documento encontrado para o caso selecionado." : "Crie metadata para validar o vínculo documento-caso sem upload real."}
              icon={<FileText size={20} />}
              title="Sem documentos"
              variant="compact"
            />
          ) : (
            <div className="space-y-3">
              {visibleDocuments.map((doc) => (
                <div
                  className="flex flex-col gap-4 rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3 md:flex-row md:items-center"
                  key={doc.id}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.06]">
                      <FileText className="text-slate-400" size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-slate-100">
                        {doc.filename}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {doc.sizeLabel} · {doc.contentType.split("/")[1]?.toUpperCase()}
                      </p>
                      <span className="mt-1 inline-flex rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-slate-400">
                        Metadata apenas
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3 md:flex md:items-center md:gap-5">
                    <div>
                      <p className="text-[11px] text-slate-500">Caso</p>
                      <Link
                        className="font-medium text-brand-blue-light hover:underline"
                        href={`/cases/${doc.caseId}`}
                      >
                        {doc.caseCode}
                      </Link>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-500">Upload</p>
                      <p className="text-slate-300">{formatDate(doc.uploadedAt)}</p>
                    </div>
                    <div className="self-center">
                      <StatusBadge status={doc.status} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 md:ml-auto">
                    <IconButton
                      disabled={Boolean(actionBusyId)}
                      label="Gerar URL temporária"
                      loading={actionBusyId === `download-${doc.id}`}
                      onClick={() => void handleDownloadUrl(doc.id)}
                    >
                      <Download size={13} />
                    </IconButton>
                    <IconButton
                      disabled={Boolean(actionBusyId)}
                      label="Enfileirar processamento"
                      loading={actionBusyId === `enqueue-${doc.id}`}
                      onClick={() => setPendingEnqueue(doc)}
                    >
                      <Send size={13} />
                    </IconButton>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <ConfirmDialog
          confirmLabel="Enfileirar"
          description="A API vai validar RBAC, tenant, case e document antes de publicar o job. O payload envia apenas IDs e metadados mínimos."
          loading={Boolean(actionBusyId)}
          onCancel={() => setPendingEnqueue(null)}
          onConfirm={() => void confirmEnqueue()}
          open={Boolean(pendingEnqueue)}
          title={`Enfileirar processamento de ${pendingEnqueue?.filename ?? "documento"}?`}
        />
      </AppLayout>
    </AuthGuard>
  );
}

function IconButton({
  children,
  disabled = false,
  label,
  loading = false,
  onClick
}: {
  children: ReactNode;
  disabled?: boolean;
  label: string;
  loading?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-slate-400 transition hover:bg-white/[0.08] hover:text-slate-100 disabled:cursor-not-allowed disabled:opacity-45"
      disabled={disabled || loading}
      onClick={onClick}
      title={label}
      type="button"
    >
      {loading ? (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current/30 border-t-current" />
      ) : (
        children
      )}
    </button>
  );
}
