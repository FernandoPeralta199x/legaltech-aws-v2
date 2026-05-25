"use client";

import {
  AlertTriangle,
  BriefcaseBusiness,
  Mail,
  Phone,
  Plus,
  RefreshCw,
  Search
} from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { AppLayout } from "@/components/AppLayout";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { PageTitle } from "@/components/PageTitle";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate } from "@/lib/formatters";
import { ApiClientError } from "@/src/services/apiClient";
import { createClient, listClients } from "@/src/services/clients";
import type { Client, ClientCreate } from "@/types";

const riskConfig: Record<string, { label: string; className: string }> = {
  low: { label: "Risco baixo", className: "text-green-400 bg-green-500/10 border-green-500/20" },
  medium: { label: "Risco médio", className: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  high: { label: "Risco alto", className: "text-red-400 bg-red-500/10 border-red-500/20" }
};

const emptyForm: ClientCreate = {
  document: "",
  email: "",
  name: "",
  phone: ""
};

function errorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    return `${error.code}: ${error.message}`;
  }

  return error instanceof Error ? error.message : "Não foi possível carregar clientes.";
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [error, setError] = useState("");
  const [fallbackReason, setFallbackReason] = useState("");
  const [form, setForm] = useState<ClientCreate>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const refreshClients = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await listClients();
      setClients(result.data);
      setFallbackReason(result.source === "mock" ? result.fallbackReason ?? "" : "");
    } catch (err) {
      setError(errorMessage(err));
      setFallbackReason("");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refreshClients();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [refreshClients]);

  const filteredClients = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return clients;
    }

    return clients.filter((client) =>
      [client.name, client.email, client.phone]
        .join(" ")
        .toLowerCase()
        .includes(normalized)
    );
  }, [clients, query]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim()) {
      setError("Informe o nome do cliente.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const payload: ClientCreate = {
        document: form.document?.trim() || null,
        email: form.email?.trim() || null,
        metadata: { source: "frontend" },
        name: form.name.trim(),
        phone: form.phone?.trim() || null
      };
      const result = await createClient(payload);
      setClients((current) => [result.data, ...current]);
      setFallbackReason(result.source === "mock" ? result.fallbackReason ?? "" : "");
      setForm(emptyForm);
      setShowForm(false);
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
                onClick={() => void refreshClients()}
                variant="secondary"
              >
                Atualizar
              </Button>
              <Button
                icon={<Plus aria-hidden="true" size={15} />}
                onClick={() => setShowForm((current) => !current)}
              >
                Novo cliente
              </Button>
            </div>
          }
          description="Clientes cadastrados via backend FastAPI, com fallback local para desenvolvimento."
          eyebrow="Clientes"
          title="Base de clientes"
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
              <Field label="Nome do cliente">
                <input
                  className={inputClass}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Cliente fictício de desenvolvimento"
                  value={form.name}
                />
              </Field>
              <Field label="Documento">
                <input
                  className={inputClass}
                  onChange={(event) => setForm((current) => ({ ...current, document: event.target.value }))}
                  placeholder="00000000000"
                  value={form.document ?? ""}
                />
              </Field>
              <Field label="E-mail">
                <input
                  className={inputClass}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  placeholder="cliente.dev@example.test"
                  type="email"
                  value={form.email ?? ""}
                />
              </Field>
              <Field label="Telefone">
                <input
                  className={inputClass}
                  onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                  placeholder="+5500000000000"
                  value={form.phone ?? ""}
                />
              </Field>
            </div>
            <div className="mt-4 flex justify-end">
              <Button loading={submitting} type="submit">
                Criar cliente
              </Button>
            </div>
          </form>
        )}

        <div className="mb-6 relative max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
          <input
            className="h-9 w-full rounded-lg border border-white/[0.08] bg-white/[0.04] pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-500 outline-none transition focus:border-brand-blue/40"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar clientes..."
            type="search"
            value={query}
          />
        </div>

        {loading ? (
          <LoadingState label="Carregando clientes..." />
        ) : filteredClients.length === 0 ? (
          <EmptyState
            action={
              <Button icon={<Plus size={15} />} onClick={() => setShowForm(true)}>
                Criar cliente
              </Button>
            }
            description="Nenhum cliente encontrado para os filtros atuais."
            title="Sem clientes"
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {filteredClients.map((client) => {
              const risk = riskConfig[client.riskLevel];
              return (
                <div
                  className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5 transition-all hover:border-brand-blue/20 hover:bg-white/[0.05]"
                  key={client.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-sm font-bold text-white">
                        {client.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-100">{client.name}</p>
                        <p className="text-[11px] text-slate-500">{client.documentLabel}</p>
                      </div>
                    </div>
                    <StatusBadge status={client.status} />
                  </div>

                  <dl className="mt-4 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Mail size={12} className="shrink-0 text-slate-500" />
                      {client.email || "E-mail não informado"}
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Phone size={12} className="shrink-0 text-slate-500" />
                      {client.phone || "Telefone não informado"}
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <BriefcaseBusiness size={12} className="shrink-0 text-slate-500" />
                      {client.casesCount} caso{client.casesCount !== 1 ? "s" : ""}
                    </div>
                  </dl>

                  <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-4">
                    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold ${risk.className}`}>
                      {risk.label}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Desde {formatDate(client.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </AppLayout>
    </AuthGuard>
  );
}

const inputClass =
  "h-10 w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-slate-200 placeholder:text-slate-500 outline-none transition focus:border-brand-blue/40 focus:bg-white/[0.06]";

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
