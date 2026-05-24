import { BriefcaseBusiness, Mail, Phone, Plus, Search } from "lucide-react";

import { AppLayout } from "@/components/AppLayout";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/Button";
import { PageTitle } from "@/components/PageTitle";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate } from "@/lib/formatters";
import { mockClients } from "@/lib/mockData";

const riskConfig: Record<string, { label: string; className: string }> = {
  low: { label: "Risco baixo", className: "text-green-400 bg-green-500/10 border-green-500/20" },
  medium: { label: "Risco médio", className: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  high: { label: "Risco alto", className: "text-red-400 bg-red-500/10 border-red-500/20" }
};

export default function ClientsPage() {
  return (
    <AuthGuard>
      <AppLayout>
        <PageTitle
          actions={
            <Button disabled icon={<Plus aria-hidden="true" size={15} />} variant="secondary">
              Novo cliente
            </Button>
          }
          description="Clientes cadastrados na plataforma com seus casos e nível de risco."
          eyebrow="Clientes"
          title="Base de clientes"
        />

        <div className="mb-6 relative max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
          <input
            className="h-9 w-full rounded-lg border border-white/[0.08] bg-white/[0.04] pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-500 outline-none transition focus:border-brand-blue/40"
            placeholder="Buscar clientes..."
            type="search"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {mockClients.map((client) => {
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
                    {client.email}
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Phone size={12} className="shrink-0 text-slate-500" />
                    {client.phone}
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
      </AppLayout>
    </AuthGuard>
  );
}
