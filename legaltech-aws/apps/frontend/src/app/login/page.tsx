"use client";

import {
  ArrowRight,
  Eye,
  EyeOff,
  Headphones,
  KeyRound,
  Lock,
  LogOut,
  Mail,
  Scale,
  Shield,
  ShieldCheck,
  Sparkles,
  User,
  Users
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useMemo, useState } from "react";

import { Button } from "@/components/Button";
import { cn } from "@/lib/cn";
import { logoutDevSession, saveDevSession } from "@/src/services/auth";
import { useDevSession } from "@/src/lib/useDevSession";
import { validateDevJwtForm } from "@/src/lib/validation";
import { DEV_ROLES, type DevRole } from "@/src/types/auth";

type RoleConfig = {
  desc: string;
  icon: typeof Shield;
  label: string;
};

const roleConfig: Record<DevRole, RoleConfig> = {
  admin: {
    desc: "Gestão completa da plataforma",
    icon: ShieldCheck,
    label: "Administrador"
  },
  analyst: {
    desc: "Revisão e aprovação de relatórios",
    icon: Users,
    label: "Analista"
  },
  client: {
    desc: "Criação e acompanhamento de casos",
    icon: User,
    label: "Cliente"
  },
  owner: {
    desc: "Acesso total ao sistema",
    icon: Shield,
    label: "Proprietário"
  },
  support: {
    desc: "Monitoramento e atendimento",
    icon: Headphones,
    label: "Suporte"
  }
};

const demoRoles: DevRole[] = [...DEV_ROLES];

type ToastState = {
  message: string;
  tone: "error" | "success" | "warning";
} | null;

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/dashboard";
  const session = useDevSession();
  const [role, setRole] = useState<DevRole>(session?.role ?? "owner");
  const [email, setEmail] = useState(session?.email ?? "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");
  const [toast, setToast] = useState<ToastState>(null);

  const selectedRole = roleConfig[role];
  const emailIsInvalid = useMemo(() => {
    const trimmedEmail = email.trim();
    return trimmedEmail.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
  }, [email]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) {
      return;
    }

    if (emailIsInvalid) {
      setToast({
        message: "Informe um e-mail válido ou deixe o campo vazio nesta etapa dev.",
        tone: "error"
      });
      return;
    }

    const validation = validateDevJwtForm(token);
    if (!validation.valid) {
      setToast({
        message: validation.errors.token ?? "Token dev inválido.",
        tone: "error"
      });
      return;
    }

    setLoading(true);
    saveDevSession({ role, token: token.trim() || undefined });
    setToast({
      message: token.trim()
        ? "JWT dev aceito. Redirecionando para a plataforma..."
        : "Sem JWT colado. Entrando com sessão visual local para fallback/mock...",
      tone: token.trim() ? "success" : "warning"
    });
    await new Promise((resolve) => setTimeout(resolve, 450));
    router.replace(nextPath.startsWith("/") ? nextPath : "/dashboard");
  }

  function handleLogout() {
    logoutDevSession();
    setToken("");
    setPassword("");
    setToast({
      message: "Sessão local encerrada.",
      tone: "success"
    });
  }

  return (
    <main className="relative flex min-h-screen items-start justify-center overflow-hidden bg-[linear-gradient(148deg,#2f656f_0%,#04363d_48%,#02272b_100%)] px-3 pb-10 pt-20 text-slate-100 sm:px-6 sm:pt-24">
      <div className="pointer-events-none absolute inset-0 opacity-45 noise" />
      <Link
        className="absolute left-5 top-5 z-10 flex items-center gap-2 text-xs font-semibold text-white/80 transition hover:text-white"
        href="/"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15">
          <Scale size={16} />
        </span>
        Contrato Visto
      </Link>

      <section
        aria-label="Login de desenvolvimento"
        className="relative z-10 w-full max-w-md animate-slide-up rounded-[14px] border border-white/15 bg-white/[0.055] px-4 pb-8 pt-14 shadow-[0_24px_64px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl sm:px-10 sm:pb-12 sm:pt-16"
      >
        <div aria-hidden="true" className="absolute -top-11 left-1/2 h-[88px] w-[88px] -translate-x-1/2">
          <div className="absolute -inset-3 animate-pulse rounded-full bg-[radial-gradient(circle,rgba(95,200,152,0.24)_0%,transparent_68%)]" />
          <div className="absolute -inset-[3px] animate-spin-slow rounded-full bg-[conic-gradient(from_0deg,transparent_0%,transparent_28%,rgba(95,200,152,.12)_40%,rgba(95,200,152,.88)_53%,rgba(190,255,225,1)_57%,rgba(95,200,152,.88)_61%,rgba(95,200,152,.12)_72%,transparent_84%,transparent_100%)]" />
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-[linear-gradient(148deg,#2a6068,#021f23)] text-emerald-100 shadow-[0_0_20px_rgba(95,200,152,.15),0_8px_28px_rgba(0,0,0,.52)]">
            <ShieldCheck size={34} />
          </div>
        </div>

        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[10px] font-bold uppercase text-white/45">
            Perfil de acesso dev
          </p>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/25 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-200">
            <Sparkles size={12} />
            Ambiente local
          </span>
        </div>

        <div className="mb-5 space-y-1.5" role="radiogroup" aria-label="Selecionar perfil visual">
          {demoRoles.map((candidateRole) => {
            const cfg = roleConfig[candidateRole];
            const Icon = cfg.icon;
            const active = role === candidateRole;

            return (
              <button
                aria-checked={active}
                className={cn(
                  "flex min-h-12 w-full items-center gap-3 rounded-md border px-3 py-2.5 text-left transition active:scale-[0.983]",
                  active
                    ? "border-emerald-300/50 bg-emerald-500/15"
                    : "border-white/15 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.07]"
                )}
                key={candidateRole}
                onClick={() => {
                  setRole(candidateRole);
                  setToast(null);
                }}
                role="radio"
                type="button"
              >
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-md border transition",
                    active
                      ? "border-emerald-300/40 bg-emerald-500/20 text-emerald-200"
                      : "border-white/10 bg-white/[0.06] text-white/45"
                  )}
                >
                  <Icon size={16} />
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block truncate text-[13.5px] font-semibold",
                      active ? "text-emerald-200" : "text-slate-100"
                    )}
                  >
                    {cfg.label}
                  </span>
                  <span className="block truncate text-[11px] text-white/45">
                    {cfg.desc}
                  </span>
                </span>
                <span
                  className={cn(
                    "h-2 w-2 shrink-0 rounded-full bg-emerald-300 transition",
                    active ? "scale-100 opacity-100" : "scale-0 opacity-0"
                  )}
                />
              </button>
            );
          })}
        </div>

        <div className="my-5 border-t border-white/10" />

        {session && (
          <div className="mb-5 rounded-md border border-emerald-300/25 bg-emerald-400/10 px-3 py-3">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-emerald-300/25 bg-white/10 text-emerald-200">
                <KeyRound size={17} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-emerald-100">Sessão dev ativa</p>
                <p className="mt-1 break-words text-[11px] leading-5 text-emerald-100/75">
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

        <form className="space-y-4" onSubmit={handleSubmit}>
          <LoginField icon={<Mail size={17} />} label="E-mail">
            <input
              autoComplete="email"
              className={loginInputClass}
              inputMode="email"
              onChange={(event) => {
                setEmail(event.target.value);
                if (toast?.tone === "error") {
                  setToast(null);
                }
              }}
              placeholder="seu@email.com"
              spellCheck={false}
              type="email"
              value={email}
            />
          </LoginField>

          <LoginField
            hint="Campo visual para desenvolvimento. Não use senha real."
            icon={<Lock size={17} />}
            label="Senha"
          >
            <input
              autoComplete="current-password"
              className={cn(loginInputClass, "pr-12")}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              type={showPassword ? "text" : "password"}
              value={password}
            />
            <button
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              className="absolute right-2.5 flex h-9 w-9 items-center justify-center rounded-md text-white/35 transition hover:bg-white/10 hover:text-white"
              onClick={() => setShowPassword((current) => !current)}
              type="button"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </LoginField>

          <div>
            <label className="mb-2 block text-[10px] font-bold uppercase text-emerald-200/85">
              JWT dev do backend
            </label>
            <textarea
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              className="min-h-24 w-full resize-y rounded-md border border-white/15 bg-white/[0.065] px-3 py-3 text-sm leading-6 text-slate-100 outline-none transition placeholder:text-white/25 focus:border-emerald-300/55 focus:bg-white/[0.09] focus:shadow-[0_0_0_3px_rgba(95,200,152,0.12)]"
              onChange={(event) => {
                setToken(event.target.value);
                if (toast?.tone === "error") {
                  setToast(null);
                }
              }}
              placeholder={"Cole o token gerado pelo backend.\nEx: python -m src.modules.admin.dev_jwt --role admin"}
              spellCheck={false}
              value={token}
            />
            <p className="mt-1.5 text-[11px] leading-5 text-white/45">
              Gere no backend local e cole aqui. Deixe vazio para usar a sessão visual
              local/fallback já existente.
            </p>
          </div>

          <button
            className="group relative mt-2 flex min-h-[52px] w-full items-center justify-center gap-2 overflow-hidden rounded-md bg-[linear-gradient(135deg,#2e8b65,#1a5e45)] px-4 text-xs font-bold uppercase text-white shadow-[0_4px_22px_rgba(28,110,74,0.42),inset_0_1px_0_rgba(255,255,255,0.1)] transition hover:shadow-[0_6px_28px_rgba(28,110,74,0.55),inset_0_1px_0_rgba(255,255,255,0.1)] active:scale-[0.975] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
            type="submit"
          >
            <span className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
            <span className="relative">
              {loading ? "Entrando..." : `Entrar como ${selectedRole.label}`}
            </span>
            <ArrowRight className="relative transition group-hover:translate-x-1" size={18} />
          </button>
        </form>

        {toast && (
          <div
            className={cn(
              "mt-4 rounded-md border px-4 py-3 text-center text-xs leading-5",
              toast.tone === "success" &&
                "border-emerald-300/30 bg-emerald-400/15 text-emerald-200",
              toast.tone === "warning" &&
                "border-amber-300/30 bg-amber-400/15 text-amber-100",
              toast.tone === "error" && "border-red-300/30 bg-red-400/15 text-red-200"
            )}
            role="alert"
          >
            {toast.message}
          </div>
        )}

        <div className="mt-5 space-y-2 rounded-md border border-white/10 bg-white/[0.035] px-3 py-3">
          <p className="text-[11px] leading-5 text-white/50">
            Ambiente local de desenvolvimento. Cognito real ainda não está ativo.
          </p>
          <p className="text-[11px] leading-5 text-white/50">
            O perfil selecionado é apenas visual/dev; a autorização real continua vindo
            do JWT/backend e do RBAC da API.
          </p>
        </div>
      </section>
    </main>
  );
}

function LoginField({
  children,
  hint,
  icon,
  label
}: {
  children: React.ReactNode;
  hint?: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-bold uppercase text-white/45">
        {label}
      </span>
      <span className="relative flex items-center">
        <span className="pointer-events-none absolute left-3 z-10 text-white/35">
          {icon}
        </span>
        {children}
      </span>
      {hint && <span className="mt-1.5 block text-[11px] leading-5 text-white/45">{hint}</span>}
    </label>
  );
}

const loginInputClass =
  "h-12 w-full rounded-md border border-white/15 bg-white/[0.065] pl-10 pr-3 text-base text-slate-100 outline-none transition placeholder:text-white/25 focus:border-emerald-300/55 focus:bg-white/[0.09] focus:shadow-[0_0_0_3px_rgba(95,200,152,0.12)]";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#02272b]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-200/40 border-t-emerald-200" />
        </main>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
