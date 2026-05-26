import {
  Activity,
  Building2,
  Lock,
  Settings,
  Shield,
  TrendingUp,
  User,
  Users
} from "lucide-react";

import { AppLayout } from "@/components/AppLayout";
import { AuthGuard } from "@/components/AuthGuard";
import { Card } from "@/components/Card";
import { PageTitle } from "@/components/PageTitle";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate, formatDateTime } from "@/lib/formatters";
import {
  mockAuditLogs,
  mockCases,
  mockOrganizations,
  mockUsers
} from "@/lib/mockData";

const roleColors: Record<string, string> = {
  admin: "bg-brand-teal/10 text-brand-teal-dark border-brand-teal/20",
  analyst: "bg-brand-teal/10 text-brand-teal-light border-brand-teal/20",
  client: "bg-slate-100 text-slate-700 border-slate-200",
  viewer: "bg-slate-600/10 text-slate-600 border-slate-600/20",
  owner: "bg-purple-500/10 text-purple-300 border-purple-500/20",
  support: "bg-amber-50 text-amber-700 border-amber-500/20"
};

const roleLabels: Record<string, string> = {
  admin: "Admin",
  analyst: "Analista",
  client: "Cliente",
  viewer: "Viewer",
  owner: "Owner",
  support: "Suporte"
};

const auditActionLabel: Record<string, string> = {
  case_created: "Caso criado",
  case_submitted: "Caso enviado",
  document_uploaded: "Documento enviado",
  document_processed: "Documento processado",
  agent_started: "Agente iniciado",
  agent_completed: "Agente concluído",
  report_generated: "Relatório gerado",
  review_approved: "Revisão aprovada",
  review_rejected: "Revisão rejeitada",
  review_adjustment: "Ajuste solicitado",
  status_changed: "Status alterado",
  user_login: "Login",
  user_logout: "Logout"
};

export default function AdminPage() {
  const statusCounts = [
    {
      label: "Em análise",
      count: mockCases.filter((c) =>
        ["processing", "analise_contratual", "compliance", "minuta_relatorio"].includes(c.status)
      ).length,
      color: "text-violet-700"
    },
    {
      label: "Revisão humana",
      count: mockCases.filter((c) => c.status === "revisao_humana").length,
      color: "text-amber-700"
    },
    {
      label: "Entregues",
      count: mockCases.filter((c) => c.status === "delivered").length,
      color: "text-teal-400"
    },
    {
      label: "Rascunho",
      count: mockCases.filter((c) => c.status === "draft").length,
      color: "text-slate-600"
    }
  ];

  return (
    <AuthGuard>
      <AppLayout>
        <PageTitle
          description="Visão administrativa completa da plataforma — usuários, empresas, permissões e logs."
          eyebrow="Administração"
          title="Painel administrativo"
        />

        {/* System overview */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Usuários ativos",
              value: mockUsers.filter((u) => u.status === "active").length,
              icon: Users,
              color: "text-brand-teal-dark",
              bg: "bg-brand-teal/10 border-brand-teal/20"
            },
            {
              label: "Organizações",
              value: mockOrganizations.length,
              icon: Building2,
              color: "text-brand-teal-light",
              bg: "bg-brand-teal/10 border-brand-teal/20"
            },
            {
              label: "Casos totais",
              value: mockCases.length,
              icon: Activity,
              color: "text-violet-700",
              bg: "bg-violet-500/10 border-violet-500/20"
            },
            {
              label: "Logs de auditoria",
              value: mockAuditLogs.length,
              icon: Shield,
              color: "text-amber-400",
              bg: "bg-amber-50 border-amber-500/20"
            }
          ].map((m) => {
            const Icon = m.icon;
            return (
              <Card key={m.label}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-slate-600">{m.label}</p>
                    <p className={`mt-2 text-3xl font-bold ${m.color}`}>
                      {m.value}
                    </p>
                  </div>
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${m.bg}`}
                  >
                    <Icon className={m.color} size={18} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          {/* Users */}
          <Card title="Usuários da plataforma" description="Contas ativas por papel.">
            <div className="divide-y divide-white/[0.06]">
              {mockUsers.map((user) => (
                <div className="flex items-center gap-4 py-3" key={user.id}>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-xs font-bold text-white">
                    {user.avatarInitials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-900">
                      {user.name}
                    </p>
                    <p className="truncate text-[11px] text-slate-600">
                      {user.email}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-semibold ${
                        roleColors[user.role] ?? "bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {roleLabels[user.role] ?? user.role}
                    </span>
                    <StatusBadge status={user.status} className="text-[10px]" />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Organizations */}
          <Card title="Organizações / Tenants" description="Planos e uso por empresa.">
            <div className="space-y-4">
              {mockOrganizations.map((org) => (
                <div
                  className="rounded-lg border border-slate-200 bg-white p-4"
                  key={org.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-teal/10 border border-brand-teal/20">
                        <Building2 className="text-brand-teal-dark" size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-900">
                          {org.name}
                        </p>
                        <p className="text-[11px] text-slate-500">{org.cnpj}</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-brand-teal/10 px-2 py-0.5 text-[10px] font-semibold text-brand-teal-light capitalize">
                      {org.plan}
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1.5 text-[11px]">
                      <span className="text-slate-500">Casos usados</span>
                      <span className="font-semibold text-slate-700">
                        {org.casesUsed}/{org.casesLimit}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-1.5 rounded-full bg-brand-blue transition-all"
                        style={{
                          width: `${(org.casesUsed / org.casesLimit) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Cases by status */}
          <Card title="Casos por status" description="Distribuição atual na plataforma.">
            <div className="space-y-3">
              {statusCounts.map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs text-slate-600">{item.label}</p>
                    <p className={`text-sm font-bold ${item.color}`}>
                      {item.count}
                    </p>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`h-1.5 rounded-full ${
                        item.color.replace("text-", "bg-")
                      }`}
                      style={{
                        width: `${(item.count / mockCases.length) * 100}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Audit logs */}
          <Card title="Log de auditoria" description="Últimas ações registradas no sistema.">
            <div className="space-y-3">
              {mockAuditLogs.map((log) => (
                <div
                  className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3"
                  key={log.id}
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-teal/10 border border-brand-teal/20">
                    <Shield className="text-brand-teal" size={12} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] font-semibold text-slate-800">
                        {auditActionLabel[log.action] ?? log.action}
                      </p>
                      <span className="shrink-0 text-[10px] text-slate-500">
                        {formatDate(log.createdAt)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">{log.description}</p>
                    <p className="text-[10px] text-slate-600">{log.userName}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Roles & permissions reference */}
        <div className="mt-6">
          <Card title="Roles e permissões" description="Definição dos papéis disponíveis na plataforma.">
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  role: "admin",
                  desc: "Acesso total: gerencia usuários, empresas, logs e configurações."
                },
                {
                  role: "analyst",
                  desc: "Revisa, aprova e rejeita análises e relatórios gerados pela IA."
                },
                {
                  role: "client",
                  desc: "Cria casos, envia documentos e acompanha o status e relatórios aprovados."
                },
                {
                  role: "viewer",
                  desc: "Acesso somente leitura para acompanhar casos e relatórios."
                }
              ].map((item) => (
                <div
                  className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4"
                  key={item.role}
                >
                  <span
                    className={`inline-flex items-center rounded border px-2.5 py-1 text-xs font-semibold shrink-0 ${
                      roleColors[item.role] ?? "bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    {roleLabels[item.role]}
                  </span>
                  <p className="text-xs leading-5 text-slate-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </AppLayout>
    </AuthGuard>
  );
}
