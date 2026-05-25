"use client";

import { ArrowRight, Lock, Scale, Shield, User, Users } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";

import { saveDevSession } from "@/src/services/auth";
import { DEV_ROLES, type DevRole } from "@/src/types/auth";

const roleConfig: Record<DevRole, { label: string; desc: string; icon: typeof User; color: string; bg: string; border: string }> = {
  admin: {
    label: "Administrador",
    desc: "Gestão completa da plataforma",
    icon: Shield,
    color: "text-brand-blue-light",
    bg: "bg-brand-blue/10",
    border: "border-brand-blue/30"
  },
  analyst: {
    label: "Analista",
    desc: "Revisão e aprovação de relatórios",
    icon: Users,
    color: "text-brand-teal-light",
    bg: "bg-brand-teal/10",
    border: "border-brand-teal/30"
  },
  client: {
    label: "Cliente",
    desc: "Criação e acompanhamento de casos",
    icon: User,
    color: "text-violet-300",
    bg: "bg-violet-500/10",
    border: "border-violet-500/30"
  },
  owner: {
    label: "Proprietário",
    desc: "Acesso total ao sistema",
    icon: Shield,
    color: "text-amber-300",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30"
  },
  support: {
    label: "Suporte",
    desc: "Monitoramento e atendimento",
    icon: Users,
    color: "text-slate-300",
    bg: "bg-slate-500/10",
    border: "border-slate-500/30"
  }
};

const demoRoles: DevRole[] = [...DEV_ROLES];

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/dashboard";
  const [role, setRole] = useState<DevRole>("admin");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (token.trim() && token.trim().split(".").length !== 3) {
      setError("Cole um JWT dev válido com três partes ou deixe o campo vazio para usar apenas a sessão visual local.");
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    saveDevSession({ role, token: token.trim() || undefined });
    router.replace(nextPath.startsWith("/") ? nextPath : "/dashboard");
  }

  return (
    <main className="flex min-h-screen bg-surface-900">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-surface-800 border-r border-white/[0.06] p-12">
        <Link className="flex items-center gap-3" href="/">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand shadow-glow-teal">
            <Scale className="text-white" size={20} />
          </span>
          <span className="text-sm font-bold text-white">Contrato Visto</span>
        </Link>

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-teal mb-3">
            Plataforma LegalTech
          </p>
          <h2 className="text-3xl font-bold text-white leading-snug">
            Análise jurídica inteligente
            <br />
            para contratos, partes
            <br />e documentos.
          </h2>
          <p className="mt-4 text-sm leading-6 text-slate-400">
            Agilize a análise contratual, organize casos e entregue relatórios
            jurídicos com mais clareza e segurança.
          </p>
        </div>

        <div className="space-y-3">
          {[
            "IA analisa cláusulas e riscos automaticamente",
            "Revisão humana obrigatória antes da entrega",
            "Auditoria completa de todas as ações",
            "LGPD compliance por design"
          ].map((item) => (
            <div className="flex items-center gap-2" key={item}>
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-teal/20">
                <div className="h-1.5 w-1.5 rounded-full bg-brand-teal" />
              </div>
              <span className="text-xs text-slate-300">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Link className="mb-8 flex items-center gap-3 lg:hidden" href="/">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand">
              <Scale className="text-white" size={18} />
            </span>
            <span className="text-sm font-bold text-white">Contrato Visto</span>
          </Link>

          <h1 className="text-2xl font-bold text-white">Entrar na plataforma</h1>
          <p className="mt-2 text-sm text-slate-400">
            Selecione um perfil demo para explorar a plataforma.
          </p>

          {/* Role selector */}
          <div className="mt-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Perfil de acesso (demonstração)
            </p>
            <div className="space-y-2">
              {demoRoles.map((r) => {
                const cfg = roleConfig[r];
                const Icon = cfg.icon;
                const active = role === r;
                return (
                  <button
                    className={`w-full flex items-center gap-4 rounded-xl border px-4 py-3.5 text-left transition-all ${
                      active
                        ? `${cfg.border} ${cfg.bg}`
                        : "border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04]"
                    }`}
                    key={r}
                    onClick={() => setRole(r)}
                    type="button"
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${
                        active ? `${cfg.border} ${cfg.bg}` : "border-white/[0.08] bg-white/[0.04]"
                      }`}
                    >
                      <Icon
                        className={active ? cfg.color : "text-slate-500"}
                        size={16}
                      />
                    </div>
                    <div className="flex-1">
                      <p
                        className={`text-sm font-semibold ${
                          active ? cfg.color : "text-slate-300"
                        }`}
                      >
                        {cfg.label}
                      </p>
                      <p className="text-xs text-slate-500">{cfg.desc}</p>
                    </div>
                    {active && (
                      <div className={`h-2 w-2 rounded-full ${cfg.bg.replace("bg-", "bg-").replace("/10", "")} animate-pulse`}>
                        <div className="h-2 w-2 rounded-full bg-current" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                E-mail
              </label>
              <input
                className="h-10 w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-slate-200 placeholder:text-slate-500 outline-none transition focus:border-brand-blue/40 focus:bg-white/[0.06]"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com (qualquer valor)"
                type="email"
                value={email}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-400">Senha</label>
                <button
                  className="text-xs text-brand-blue-light hover:underline"
                  type="button"
                >
                  Recuperar senha
                </button>
              </div>
              <input
                className="h-10 w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-slate-200 placeholder:text-slate-500 outline-none transition focus:border-brand-blue/40 focus:bg-white/[0.06]"
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••  (qualquer valor)"
                type="password"
                value={password}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                JWT dev do backend
              </label>
              <textarea
                className="min-h-24 w-full resize-y rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 outline-none transition focus:border-brand-blue/40 focus:bg-white/[0.06]"
                onChange={(event) => setToken(event.target.value)}
                placeholder="Cole aqui o token gerado por python -m src.modules.admin.dev_jwt. Deixe vazio para navegar apenas com fallback/mock local."
                value={token}
              />
              {error && <p className="mt-1.5 text-xs text-red-300">{error}</p>}
            </div>

            <button
              className={`mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-blue py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-brand-blue-dark ${
                loading ? "opacity-70 cursor-wait" : ""
              }`}
              disabled={loading}
              type="submit"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Entrando...
                </>
              ) : (
                <>
                  Entrar como {roleConfig[role].label}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3">
            <Lock className="shrink-0 text-slate-500" size={14} />
            <p className="text-[11px] leading-4 text-slate-500">
              Este é um ambiente de demonstração. Nenhum dado real é processado.
              Não insira informações confidenciais.
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
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-blue/30 border-t-brand-blue" />
        </main>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
