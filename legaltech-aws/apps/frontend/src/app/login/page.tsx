"use client";

import { LogIn, Scale } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";

import { Button } from "@/components/Button";
import { decodeDevJwt, saveDevSession } from "@/src/services/auth";
import { DEV_ROLES, type DevRole } from "@/src/types/auth";

const roleLabels: Record<DevRole, string> = {
  admin: "Admin",
  analyst: "Analyst",
  client: "Client",
  owner: "Owner",
  support: "Support"
};

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/dashboard";
  const [role, setRole] = useState<DevRole>("admin");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const trimmedToken = token.trim();
    if (trimmedToken && !decodeDevJwt(trimmedToken)) {
      setError(
        "Cole um JWT dev valido com tres partes ou deixe o campo vazio para uma sessao visual local."
      );
      return;
    }

    saveDevSession({ role, token: trimmedToken || undefined });
    router.replace(nextPath.startsWith("/") ? nextPath : "/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <section className="w-full max-w-xl rounded-lg border border-slate-200 bg-white p-8 shadow-panel">
        <Link className="flex items-center gap-3" href="/">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink text-white">
            <Scale aria-hidden="true" size={22} />
          </span>
          <span>
            <span className="block text-sm font-semibold text-ink">
              LegalTech AWS
            </span>
            <span className="block text-xs text-slate-500">
              Login dev local
            </span>
          </span>
        </Link>

        <div className="mt-8">
          <h1 className="text-2xl font-semibold text-ink">Entrar no ambiente dev</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Se voce colar um JWT dev gerado pelo backend, ele sera salvo localmente e
            enviado como Bearer token pelo apiClient. Sem token colado, a UI cria
            apenas uma sessao visual local para navegacao.
          </p>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <fieldset>
            <legend className="text-sm font-medium text-slate-700">
              Papel de desenvolvimento
            </legend>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5">
              {DEV_ROLES.map((item) => (
                <button
                  className={
                    item === role
                      ? "h-10 rounded-lg border border-registry bg-teal-50 text-sm font-semibold text-registry"
                      : "h-10 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:border-registry hover:text-registry"
                  }
                  key={item}
                  onClick={() => setRole(item)}
                  type="button"
                >
                  {roleLabels[item]}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              JWT dev do backend
            </span>
            <textarea
              className="mt-2 min-h-28 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-registry"
              onChange={(event) => setToken(event.target.value)}
              placeholder="Opcional. Cole aqui o token gerado por python -m src.modules.admin.dev_jwt"
              value={token}
            />
          </label>

          {error && (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          )}

          <Button
            className="w-full"
            icon={<LogIn aria-hidden="true" size={16} />}
            type="submit"
          >
            Entrar em modo dev
          </Button>
        </form>

        <p className="mt-5 text-xs leading-5 text-slate-500">
          Este fluxo existe somente para desenvolvimento local. Nao use em producao,
          nao cole tokens reais e nao armazene segredos no frontend.
        </p>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
          <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 text-center shadow-panel">
            <p className="text-sm font-semibold text-ink">Carregando login dev</p>
          </section>
        </main>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
