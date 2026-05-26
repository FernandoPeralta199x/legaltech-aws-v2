"use client";

import { ArrowRight, KeyRound, Lock, LogOut, Scale, Shield, User, Users } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";

import { Button } from "@/components/Button";
import { FormField, TextArea, TextInput } from "@/components/FormField";
import { Notification } from "@/components/Notification";
import { saveDevSession, logoutDevSession } from "@/src/services/auth";
import { useDevSession } from "@/src/lib/useDevSession";
import { validateDevJwtForm } from "@/src/lib/validation";
import { DEV_ROLES, type DevRole } from "@/src/types/auth";

const roleConfig: Record<DevRole, { label: string; desc: string; icon: typeof User; color: string; bg: string; border: string }> = {
  admin: {
    bg: "bg-emerald-50",
    border: "border-emerald-300",
    color: "text-brand-teal",
    desc: "Gestão completa da plataforma",
    icon: Shield,
    label: "Administrador"
  },
  analyst: {
    bg: "bg-emerald-50",
    border: "border-emerald-300",
    color: "text-emerald-700",
    desc: "Revisão e aprovação de relatórios",
    icon: Users,
    label: "Analista"
  },
  client: {
    bg: "bg-violet-50",
    border: "border-violet-200",
    color: "text-violet-700",
    desc: "Criação e acompanhamento de casos",
    icon: User,
    label: "Cliente"
  },
  owner: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    color: "text-amber-700",
    desc: "Acesso total ao sistema",
    icon: Shield,
    label: "Proprietário"
  },
  support: {
    bg: "bg-slate-100",
    border: "border-slate-200",
    color: "text-slate-700",
    desc: "Monitoramento e atendimento",
    icon: Users,
    label: "Suporte"
  }
};

const demoRoles: DevRole[] = [...DEV_ROLES];

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/dashboard";
  const session = useDevSession();
  const [role, setRole] = useState<DevRole>(session?.role ?? "admin");
  const [email, setEmail] = useState(session?.email ?? "");
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) {
      return;
    }

    setError("");
    const validation = validateDevJwtForm(token);
    if (!validation.valid) {
      setError(validation.errors.token ?? "Token dev inválido.");
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 350));
    saveDevSession({ role, token: token.trim() || undefined });
    router.replace(nextPath.startsWith("/") ? nextPath : "/dashboard");
  }

  function handleLogout() {
    logoutDevSession();
    setToken("");
    setPassword("");
    setError("");
  }

  return (
    <main className="flex min-h-screen bg-surface-900">
      <div className="hidden border-r border-slate-200 bg-white p-12 lg:flex lg:w-1/2 lg:flex-col lg:justify-between">
        <Link className="flex items-center gap-3" href="/">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-brand shadow-glow-teal">
            <Scale className="text-white" size={20} />
          </span>
          <span className="text-sm font-bold text-slate-950">Contrato Visto</span>
        </Link>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-teal">
            Plataforma LegalTech
          </p>
          <h2 className="text-3xl font-bold leading-snug text-slate-950">
            Ambiente local para validar
            <br />
            casos, clientes e documentos
            <br />
            com segurança.
          </h2>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Use JWT dev para testar rotas protegidas do backend. Não insira dados reais,
            segredos ou informações confidenciais nesta etapa.
          </p>
        </div>

        <div className="space-y-3">
          {[
            "JWT dev apenas para desenvolvimento local",
            "Tenant continua vindo do token/contexto interno",
            "Fallback mockado é indicado visualmente",
            "Cognito real ainda não está implementado"
          ].map((item) => (
            <div className="flex items-center gap-2" key={item}>
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-teal/20">
                <div className="h-1.5 w-1.5 rounded-full bg-brand-teal" />
              </div>
              <span className="text-xs text-slate-700">{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:px-6 sm:py-12">
        <div className="w-full max-w-md">
          <Link className="mb-8 flex items-center gap-3 lg:hidden" href="/">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-brand">
              <Scale className="text-white" size={18} />
            </span>
            <span className="text-sm font-bold text-slate-950">Contrato Visto</span>
          </Link>

          <h1 className="text-2xl font-bold text-slate-950">Entrar na plataforma</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Selecione um perfil dev e cole o JWT gerado pelo backend local. Sem token colado,
            a UI cria uma sessão visual local para fallback/mock.
          </p>

          <Notification className="mt-5" title="Fluxo apenas para desenvolvimento local" tone="warning">
            Não é autenticação de produção. Não há Cognito real, refresh token real ou segredo no frontend.
          </Notification>

          {session && (
            <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-emerald-200 bg-white text-emerald-700">
                  <KeyRound size={17} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-emerald-900">Sessão dev ativa</p>
                  <p className="mt-1 break-words text-xs leading-5 text-emerald-800">
                    {session.email} · {roleConfig[session.role].label} ·{" "}
                    {session.source === "pasted" ? "JWT colado" : "token visual local"}
                  </p>
                </div>
                <Button icon={<LogOut size={14} />} onClick={handleLogout} size="sm" variant="secondary">
                  Sair
                </Button>
              </div>
            </div>
          )}

          <div className="mt-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-600">
              Perfil de acesso dev
            </p>
            <div className="space-y-2">
              {demoRoles.map((candidateRole) => {
                const cfg = roleConfig[candidateRole];
                const Icon = cfg.icon;
                const active = role === candidateRole;
                return (
                  <button
                    className={`flex w-full items-center gap-4 rounded-lg border px-4 py-3.5 text-left transition-all ${
                      active
                        ? `${cfg.border} ${cfg.bg}`
                        : "border-slate-200 bg-slate-50 hover:bg-slate-50"
                    }`}
                    key={candidateRole}
                    onClick={() => {
                      setRole(candidateRole);
                      setError("");
                    }}
                    type="button"
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${
                        active ? `${cfg.border} ${cfg.bg}` : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <Icon className={active ? cfg.color : "text-slate-500"} size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-semibold ${active ? cfg.color : "text-slate-700"}`}>
                        {cfg.label}
                      </p>
                      <p className="text-xs text-slate-500">{cfg.desc}</p>
                    </div>
                    {active && <div className="h-2 w-2 rounded-full bg-current text-brand-teal" />}
                  </button>
                );
              })}
            </div>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <FormField label="E-mail">
              <TextInput
                onChange={(event) => setEmail(event.target.value)}
                placeholder="dev.admin@example.test"
                type="email"
                value={email}
              />
            </FormField>

            <FormField
              hint="Campo visual para desenvolvimento. Não use senha real."
              label="Senha"
            >
              <TextInput
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Qualquer valor fictício"
                type="password"
                value={password}
              />
            </FormField>

            <FormField
              error={error}
              hint="Gere no backend local e cole aqui. Deixe vazio apenas para navegar com fallback/mock."
              label="JWT dev do backend"
            >
              <TextArea
                invalid={Boolean(error)}
                onChange={(event) => {
                  setToken(event.target.value);
                  setError("");
                }}
                placeholder="Cole aqui o token gerado pelo comando interno do backend. Exemplo: python -m src.modules.admin.dev_jwt --role admin"
                value={token}
              />
            </FormField>

            <Button
              fullWidth
              iconRight={<ArrowRight size={16} />}
              loading={loading}
              type="submit"
            >
              Entrar como {roleConfig[role].label}
            </Button>
          </form>

          <div className="mt-6 flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <Lock className="mt-0.5 shrink-0 text-slate-500" size={14} />
            <p className="text-[11px] leading-5 text-slate-500">
              Use dados fictícios. O frontend nunca deve receber segredos, credenciais AWS,
              chaves de API ou dados jurídicos reais.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-surface-900">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-300 border-t-brand-blue" />
        </main>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
