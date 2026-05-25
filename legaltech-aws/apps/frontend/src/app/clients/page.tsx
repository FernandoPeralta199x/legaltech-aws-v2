"use client";

import {
  BriefcaseBusiness,
  Mail,
  Phone,
  Plus,
  RefreshCw,
  Search,
  UsersRound
} from "lucide-react";
import type { FormEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { AppLayout } from "@/components/AppLayout";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { FormField, TextInput } from "@/components/FormField";
import { LoadingState } from "@/components/LoadingState";
import { Notification } from "@/components/Notification";
import { PageTitle } from "@/components/PageTitle";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate } from "@/lib/formatters";
import { ApiClientError } from "@/src/services/apiClient";
import { createClient, listClients } from "@/src/services/clients";
import { validateClientForm, type ValidationErrors } from "@/src/lib/validation";
import type { Client, ClientCreate } from "@/types";

const riskConfig: Record<string, { label: string; className: string }> = {
  high: { label: "Risco alto", className: "text-red-400 bg-red-500/10 border-red-500/20" },
  low: { label: "Risco baixo", className: "text-green-400 bg-green-500/10 border-green-500/20" },
  medium: { label: "Risco médio", className: "text-amber-400 bg-amber-500/10 border-amber-500/20" }
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
  const [formErrors, setFormErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const refreshClients = useCallback(async () => {
    setLoading(true);
    setError("");
    setSuccessMessage("");

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
      [client.name, client.email, client.phone, client.documentLabel]
        .join(" ")
        .toLowerCase()
        .includes(normalized)
    );
  }, [clients, query]);

  function updateForm<K extends keyof ClientCreate>(field: K, value: ClientCreate[K]) {
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

    const validation = validateClientForm(form);
    setFormErrors(validation.errors);
    if (!validation.valid) {
      setError("Revise os campos destacados antes de criar o cliente.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccessMessage("");

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
      setSuccessMessage(
        result.source === "mock"
          ? "Cliente criado no fallback local de desenvolvimento."
          : "Cliente criado com sucesso no backend."
      );
      setForm(emptyForm);
      setFormErrors({});
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
                loading={loading}
                onClick={() => void refreshClients()}
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
                Novo cliente
              </Button>
            </div>
          }
          description="Clientes cadastrados via backend FastAPI, com fallback local controlado para desenvolvimento."
          eyebrow="Clientes"
          title="Base de clientes"
        />

        {fallbackReason && (
          <Notification title="Fallback local ativo" tone="warning">
            A API não respondeu. Os dados exibidos são fictícios e servem apenas para desenvolvimento.
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
            className="mb-6 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 sm:p-5"
            onSubmit={handleSubmit}
          >
            <div className="mb-4 flex flex-col gap-1">
              <h2 className="text-sm font-semibold text-slate-100">Novo cliente</h2>
              <p className="text-xs leading-5 text-slate-500">
                Use apenas dados fictícios. A organização continua vindo do JWT/contexto do backend.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField error={formErrors.name} label="Nome do cliente" required>
                <TextInput
                  invalid={Boolean(formErrors.name)}
                  onChange={(event) => updateForm("name", event.target.value)}
                  placeholder="Cliente fictício de desenvolvimento"
                  value={form.name}
                />
              </FormField>
              <FormField
                error={formErrors.document}
                hint="Opcional. Use identificadores fictícios em ambiente local."
                label="Documento"
              >
                <TextInput
                  invalid={Boolean(formErrors.document)}
                  onChange={(event) => updateForm("document", event.target.value)}
                  placeholder="00000000000"
                  value={form.document ?? ""}
                />
              </FormField>
              <FormField error={formErrors.email} label="E-mail">
                <TextInput
                  invalid={Boolean(formErrors.email)}
                  onChange={(event) => updateForm("email", event.target.value)}
                  placeholder="cliente.dev@example.test"
                  type="email"
                  value={form.email ?? ""}
                />
              </FormField>
              <FormField label="Telefone">
                <TextInput
                  onChange={(event) => updateForm("phone", event.target.value)}
                  placeholder="+5500000000000"
                  value={form.phone ?? ""}
                />
              </FormField>
            </div>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button disabled={submitting} onClick={() => setShowForm(false)} variant="secondary">
                Cancelar
              </Button>
              <Button loading={submitting} type="submit">
                Criar cliente
              </Button>
            </div>
          </form>
        )}

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <input
              className="h-10 w-full rounded-lg border border-white/[0.08] bg-white/[0.04] pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-500 outline-none transition focus:border-brand-blue/40 focus:bg-white/[0.06]"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar clientes..."
              type="search"
              value={query}
            />
          </div>
          {!loading && (
            <p className="text-xs text-slate-500">
              {filteredClients.length} cliente{filteredClients.length !== 1 ? "s" : ""} exibido{filteredClients.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {loading ? (
          <LoadingState
            description="Consultando a API real ou fallback local configurado."
            label="Carregando clientes"
          />
        ) : error && clients.length === 0 ? (
          <ErrorState
            action={
              <Button icon={<RefreshCw size={15} />} onClick={() => void refreshClients()} variant="secondary">
                Tentar novamente
              </Button>
            }
            description="A listagem de clientes não pôde ser carregada. Erros de autorização e validação do backend são exibidos sem fallback."
            details={error}
          />
        ) : filteredClients.length === 0 ? (
          <EmptyState
            action={
              <Button icon={<Plus size={15} />} onClick={() => setShowForm(true)}>
                Criar cliente
              </Button>
            }
            description={query ? "Nenhum cliente corresponde à busca atual." : "Cadastre o primeiro cliente fictício para validar o fluxo integrado."}
            icon={<UsersRound size={20} />}
            title={query ? "Busca sem resultados" : "Sem clientes cadastrados"}
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {filteredClients.map((client) => {
              const risk = riskConfig[client.riskLevel] ?? riskConfig.low;
              return (
                <div
                  className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5 transition-all hover:-translate-y-0.5 hover:border-brand-blue/20 hover:bg-white/[0.05] hover:shadow-card-hover"
                  key={client.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-sm font-bold text-white">
                        {client.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-100">{client.name}</p>
                        <p className="truncate text-[11px] text-slate-500">{client.documentLabel}</p>
                      </div>
                    </div>
                    <StatusBadge status={client.status} />
                  </div>

                  <dl className="mt-4 space-y-2 text-xs">
                    <div className="flex min-w-0 items-center gap-2 text-slate-400">
                      <Mail size={12} className="shrink-0 text-slate-500" />
                      <span className="truncate">{client.email || "E-mail não informado"}</span>
                    </div>
                    <div className="flex min-w-0 items-center gap-2 text-slate-400">
                      <Phone size={12} className="shrink-0 text-slate-500" />
                      <span className="truncate">{client.phone || "Telefone não informado"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <BriefcaseBusiness size={12} className="shrink-0 text-slate-500" />
                      {client.casesCount} caso{client.casesCount !== 1 ? "s" : ""}
                    </div>
                  </dl>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-4">
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
