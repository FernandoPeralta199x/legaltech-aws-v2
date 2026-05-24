import { LogIn, Search } from "lucide-react";

import { Button } from "@/components/Button";

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur md:px-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-md">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-registry focus:bg-white"
            placeholder="Buscar clientes, casos ou documentos"
            type="search"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-ink">Demo local</p>
            <p className="text-xs text-slate-500">Sem autenticacao real</p>
          </div>
          <Button href="/login" icon={<LogIn aria-hidden="true" size={16} />} variant="secondary">
            Login
          </Button>
        </div>
      </div>
    </header>
  );
}
