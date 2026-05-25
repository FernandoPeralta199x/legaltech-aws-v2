"use client";

import {
  AlertTriangle,
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
import type { Case, Document, DocumentCreate, DocumentStatus } from "@/types";

type DocumentForm = {
  caseId: string;
  contentType: string;
  filename: string;
  notes: string;
  sizeBytes: string;
  status: DocumentStatus;
};

function errorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    return `${error.code}: ${error.message}`;
  }

  return error instanceof Error ? error.message : "Não foi possível carregar documentos.";
}

export default function DocumentsPage() {
  const [actionMessage, setActionMessage] = useState("");
  const [cases, setCases] = useState<Case[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [error, setError] = useState("");
  const [fallbackReason, setFallbackReason] = useState("");
  const [form, setForm] = useState<DocumentForm>({
    caseId: "",
    contentType: "application/pdf",
    filename: "",
    notes: "",
    sizeBytes: "1024",
    status: "pending_upload"
  });
  const [loading, setLoading] = useState(true);
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.caseId || !form.filename.trim()) {
      setError("Informe o caso e o nome do documento.");
      return;
    }

    const sizeBytes = Number(form.sizeBytes);
    if (!Number.isFinite(sizeBytes) || sizeBytes <= 0) {
      setError("Informe um tamanho válido para o documento.");
      return;
    }

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
      setShowForm(false);
      setForm((current) => ({ ...current, filename: "", notes: "", sizeBytes: "1024" }));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDownloadUrl(documentId: string) {
    setActionMessage("");
    setError("");

    try {
      const result = await getDocumentDownloadUrl(documentId);
      setActionMessage(
        result.source === "mock"
          ? "Backend indisponível: link temporário simulado para desenvolvimento."
          : `URL temporária gerada. Expiração: ${result.data.expires_in_seconds}s.`
      );
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function handleEnqueue(documentId: string) {
    setActionMessage("");
    setError("");

    try {
      const result = await enqueueDocumentProcessing(documentId);
      setActionMessage(`Processamento enfileirado: ${result.data.job_id}.`);
    } catch (err) {
      setError(errorMessage(err));
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
                onClick={() => void refreshDocuments()}
                variant="secondary"
              >
                Atualizar
              </Button>
              <Button
                icon={<Plus aria-hidden="true" size={15} />}
                onClick={() => setShowForm((current) => !current)}
              >
                Novo metadado
              </Button>
            </div>
          }
          description="Metadados de documentos vinculados a casos, consumindo o backend FastAPI quando disponível."
          eyebrow="Documentos"
          title="Documentos enviados"
        />

        {fallbackReason && (
          <StatusNotice
            message="Backend indisponível: exibindo dados mockados locais."
            tone="warning"
          />
        )}
        {error && <StatusNotice message={error} tone="error" />}
        {actionMessage && <StatusNotice message={actionMessage} tone="success" />}

        {showForm && (
          <form
            className="mb-6 rounded-xl border border-white/[0.08] bg-white/[0.03] p-5"
            onSubmit={handleSubmit}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Caso vinculado">
                <select
                  className={inputClass}
                  onChange={(event) => setForm((current) => ({ ...current, caseId: event.target.value }))}
                  value={form.caseId}
                >
                  {cases.map((legalCase) => (
                    <option key={legalCase.id} value={legalCase.id}>
                      {legalCase.code} · {legalCase.clientName}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Nome do arquivo">
                <input
                  className={inputClass}
                  onChange={(event) => setForm((current) => ({ ...current, filename: event.target.value }))}
                  placeholder="contrato-exemplo.pdf"
                  value={form.filename}
                />
              </Field>
              <Field label="Tipo MIME">
                <select
                  className={inputClass}
                  onChange={(event) => setForm((current) => ({ ...current, contentType: event.target.value }))}
                  value={form.contentType}
                >
                  <option value="application/pdf">PDF</option>
                  <option value="application/vnd.openxmlformats-officedocument.wordprocessingml.document">DOCX</option>
                  <option value="text/plain">TXT</option>
                </select>
              </Field>
              <Field label="Tamanho em bytes">
                <input
                  className={inputClass}
                  min={1}
                  onChange={(event) => setForm((current) => ({ ...current, sizeBytes: event.target.value }))}
                  type="number"
                  value={form.sizeBytes}
                />
              </Field>
              <Field label="Status">
                <select
                  className={inputClass}
                  onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as DocumentStatus }))}
                  value={form.status}
                >
                  <option value="pending_upload">Aguardando upload</option>
                  <option value="uploaded">Enviado</option>
                  <option value="processing">Processando</option>
                  <option value="processed">Processado</option>
                </select>
              </Field>
              <Field label="Observação">
                <input
                  className={inputClass}
                  onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                  placeholder="Metadado fictício de desenvolvimento"
                  value={form.notes}
                />
              </Field>
            </div>
            <div className="mt-4 flex justify-end">
              <Button loading={submitting} type="submit">
                Criar metadado
              </Button>
            </div>
          </form>
        )}

        <div className="mb-6 max-w-sm">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-400">
              Filtrar por caso
            </span>
            <select
              className={inputClass}
              onChange={(event) => setSelectedCase(event.target.value)}
              value={selectedCase}
            >
              <option value="">Todos os casos</option>
              {cases.map((legalCase) => (
                <option key={legalCase.id} value={legalCase.id}>
                  {legalCase.code}
                </option>
              ))}
            </select>
          </label>
        </div>

        <Card
          title="Arquivos recentes"
          description="Metadata real quando o backend está disponível; fallback local em desenvolvimento."
        >
          {loading ? (
            <LoadingState label="Carregando documentos..." />
          ) : visibleDocuments.length === 0 ? (
            <div className="flex min-h-40 flex-col items-center justify-center text-center">
              <p className="text-sm font-semibold text-slate-200">Sem documentos</p>
              <p className="mt-2 max-w-md text-xs leading-5 text-slate-400">
                Nenhum documento encontrado para os filtros atuais.
              </p>
              <div className="mt-5">
                <Button icon={<Plus size={15} />} onClick={() => setShowForm(true)}>
                  Criar metadado
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {visibleDocuments.map((doc) => (
                <div
                  className="flex flex-wrap items-center gap-4 rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3"
                  key={doc.id}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
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
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-[11px] text-slate-500">Caso</p>
                    <Link
                      className="text-xs font-medium text-brand-blue-light hover:underline"
                      href={`/cases/${doc.caseId}`}
                    >
                      {doc.caseCode}
                    </Link>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-[11px] text-slate-500">Upload</p>
                    <p className="text-xs text-slate-300">{formatDate(doc.uploadedAt)}</p>
                  </div>
                  <StatusBadge status={doc.status} />
                  <div className="flex items-center gap-2">
                    <IconButton
                      label="Gerar URL temporária"
                      onClick={() => void handleDownloadUrl(doc.id)}
                    >
                      <Download size={13} />
                    </IconButton>
                    <IconButton
                      label="Enfileirar processamento"
                      onClick={() => void handleEnqueue(doc.id)}
                    >
                      <Send size={13} />
                    </IconButton>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
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

function IconButton({
  children,
  label,
  onClick
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-slate-400 transition hover:bg-white/[0.08] hover:text-slate-100"
      onClick={onClick}
      title={label}
      type="button"
    >
      {children}
    </button>
  );
}

function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex min-h-40 items-center justify-center text-sm text-slate-400">
      {label}
    </div>
  );
}

function StatusNotice({
  message,
  tone
}: {
  message: string;
  tone: "error" | "success" | "warning";
}) {
  const classes = {
    error: "border-red-500/25 bg-red-500/10 text-red-200",
    success: "border-teal-500/25 bg-teal-500/10 text-teal-200",
    warning: "border-amber-500/25 bg-amber-500/10 text-amber-200"
  };

  return (
    <div className={`mb-4 flex items-center gap-2 rounded-xl border px-4 py-3 text-xs ${classes[tone]}`}>
      <AlertTriangle size={14} />
      {message}
    </div>
  );
}
