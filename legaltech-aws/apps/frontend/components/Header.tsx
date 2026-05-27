"use client";

import { Bell, LogOut, Menu, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { cn } from "@/lib/cn";
import { clearStoredSession } from "@/src/lib/authStorage";
import { useDevSession } from "@/src/lib/useDevSession";

type HeaderProps = { onMenuClick?: () => void };

const roleMeta: Record<string, { label: string; cls: string }> = {
  admin:   { label: "Administrador", cls: "text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-200 dark:bg-blue-950/40 dark:border-blue-900" },
  analyst: { label: "Analista", cls: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900" },
  client:  { label: "Cliente",  cls: "text-slate-700 bg-slate-50 border-slate-200 dark:text-slate-200 dark:bg-slate-800 dark:border-slate-700" },
  owner:   { label: "Proprietário", cls: "text-purple-700 bg-purple-50 border-purple-200 dark:text-purple-200 dark:bg-purple-950/40 dark:border-purple-900" },
  support: { label: "Suporte",  cls: "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-200 dark:bg-amber-950/40 dark:border-amber-900" }
};

export function Header({ onMenuClick }: HeaderProps) {
  const router        = useRouter();
  const session       = useDevSession();
  const [query, setQuery]           = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  function handleLogout() {
    clearStoredSession();
    router.replace("/login");
  }

  const meta = session ? (roleMeta[session.role] ?? roleMeta.client) : null;
  const initials = session
    ? session.email.slice(0, 2).toUpperCase()
    : "??";

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/85">
      <div className="flex h-16 items-center gap-3 px-4 md:px-6">

        {/* Hamburger — mobile only */}
        {onMenuClick && (
          <button
            aria-label="Abrir menu"
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg lg:hidden",
              "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white",
              "transition-colors duration-fast"
            )}
            onClick={onMenuClick}
          >
            <Menu size={19} />
          </button>
        )}

        {/* Search — desktop always visible, mobile toggleable */}
        <div
          className={cn(
            "relative transition-all duration-base ease-smooth",
            searchOpen
              ? "flex-1"
              : "hidden w-56 flex-none md:flex md:w-64 lg:w-80"
          )}
        >
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-500"
            size={15}
          />
          <input
            autoFocus={searchOpen}
            className={cn(
              "h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 dark:border-slate-700 dark:bg-slate-900",
              "text-sm text-slate-900 placeholder:text-slate-500 dark:text-slate-100",
              "outline-none",
              "transition-all duration-base ease-smooth",
              "focus:border-brand-teal/40 focus:bg-white focus:shadow-glow-teal dark:focus:bg-slate-900"
            )}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar casos, clientes..."
            type="search"
            value={query}
          />
          {searchOpen && (
            <button
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 transition-colors duration-fast hover:text-slate-800 dark:hover:text-slate-200"
              onClick={() => { setSearchOpen(false); setQuery(""); }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Mobile search toggle */}
        {!searchOpen && (
          <button
            aria-label="Buscar"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-colors duration-fast hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white md:hidden"
            onClick={() => setSearchOpen(true)}
          >
            <Search size={18} />
          </button>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right cluster */}
        <div className="flex items-center gap-1.5">
          {/* Notifications */}
          <button
            aria-label="Notificações"
            className={cn(
              "relative flex h-9 w-9 items-center justify-center rounded-lg",
              "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white",
              "transition-colors duration-fast"
            )}
          >
            <Bell size={17} />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-brand-teal ring-2 ring-white dark:ring-slate-950" />
          </button>

          {session ? (
            <div className="flex items-center gap-2 pl-1">
              {/* Role + name — sm+ */}
              <div className="hidden text-right sm:block">
                <p className="text-[12px] font-semibold leading-tight text-slate-900 dark:text-slate-100">
                  {session.email.split("@")[0]}
                </p>
                {meta && (
                  <span
                    className={cn(
                      "inline-flex items-center rounded-md border px-1.5 py-px",
                      "text-[9px] font-bold uppercase tracking-wider",
                      meta.cls
                    )}
                  >
                    {meta.label}
                  </span>
                )}
              </div>

              {/* Avatar — acts as logout button */}
              <button
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full",
                  "bg-gradient-brand text-[11px] font-bold text-white",
                  "shadow-glow-teal ring-2 ring-white dark:ring-slate-950",
                  "transition-all duration-base hover:shadow-glow-teal-lg hover:scale-105",
                  "active:scale-95"
                )}
                onClick={handleLogout}
                title="Sair da sessão"
              >
                {initials}
              </button>
              <button
                className={cn(
                  "hidden h-8 items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700",
                  "bg-white px-2.5 text-[11px] font-semibold text-slate-600 dark:bg-slate-900 dark:text-slate-300",
                  "transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-200 md:flex"
                )}
                onClick={handleLogout}
                type="button"
              >
                <LogOut size={13} />
                Sair
              </button>
            </div>
          ) : (
            <a
              className={cn(
                "rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5",
                "text-[12px] font-semibold text-emerald-800",
                "transition-all duration-base hover:border-emerald-300 hover:bg-emerald-100"
              )}
              href="/login"
            >
              Entrar
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
