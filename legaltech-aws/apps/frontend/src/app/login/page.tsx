import { LogIn, Scale } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/Button";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-panel">
        <Link className="flex items-center gap-3" href="/">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink text-white">
            <Scale aria-hidden="true" size={22} />
          </span>
          <span>
            <span className="block text-sm font-semibold text-ink">
              LegalTech AWS
            </span>
            <span className="block text-xs text-slate-500">
              Autenticacao futura
            </span>
          </span>
        </Link>

        <div className="mt-8">
          <h1 className="text-2xl font-semibold text-ink">Entrar no sistema</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Tela placeholder. Cognito, JWT e sessao real serao conectados em uma
            etapa futura.
          </p>
        </div>

        <form className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-registry"
              placeholder="usuario@example.test"
              type="email"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Senha</span>
            <input
              className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-registry"
              placeholder="Ainda nao habilitado"
              type="password"
            />
          </label>
          <Button
            className="w-full"
            disabled
            icon={<LogIn aria-hidden="true" size={16} />}
          >
            Login indisponivel
          </Button>
        </form>

        <Button className="mt-4 w-full" href="/" variant="ghost">
          Voltar para inicio
        </Button>
      </section>
    </main>
  );
}
