"use client";

import { Bell, LogOut, Menu, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { cn } from "@/lib/cn";
import { clearStoredSession } from "@/src/lib/authStorage";
import { useDevSession } from "@/src/lib/useDevSession";

type HeaderProps = { onMenuClick?: () => void };

const roleMeta: Record<string, { label: string; cls: string }> = {
  admin:   { label: "Admin",    cls: "text-brand-blue-light  bg-brand-blue/12  border-brand-blue/20" },
  analyst: { label: "Analista", cls: "text-brand-teal-light  bg-brand-teal/12  border-brand-teal/20" },
  client:  { label: "Cliente",  cls: "text-slate-300         bg-white/[0.06]   border-white/[0.1]"  },
  owner:   { label: "Owner",    cls: "text-purple-300        bg-purple-500/10  border-purple-500/20" },
  support: { label: "Suporte",  cls: "text-amber-300         bg-amber-500/10   border-amber-500/20"  }
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
    <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-surface-900/90 backdrop-blur-md">
      <div className="flex h-14 items-center gap-3 px-4 md:px-6">

        {/* Hamburger — mobile only */}
        {onMenuClick && (
          <button
            aria-label="Abrir menu"
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-xl lg:hidden",
              "text-slate-400 hover:bg-white/[0.06] hover:text-white",
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
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            size={15}
          />
          <input
            autoFocus={searchOpen}
            className={cn(
              "h-9 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] pl-9 pr-3",
              "text-sm text-slate-200 placeholder:text-slate-500",
              "outline-none",
              "transition-all duration-base ease-smooth",
              "focus:border-brand-blue/35 focus:bg-white/[0.06] focus:shadow-glow"
            )}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar casos, clientes..."
            type="search"
            value={query}
          />
          {searchOpen && (
            <button
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors duration-fast"
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
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-white/[0.06] hover:text-white transition-colors duration-fast md:hidden"
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
              "relative flex h-9 w-9 items-center justify-center rounded-xl",
              "text-slate-400 hover:bg-white/[0.06] hover:text-white",
              "transition-colors duration-fast"
            )}
          >
            <Bell size={17} />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-brand-blue ring-2 ring-surface-900" />
          </button>

          {session ? (
            <div className="flex items-center gap-2 pl-1">
              {/* Role + name — sm+ */}
              <div className="hidden text-right sm:block">
                <p className="text-[12px] font-semibold leading-tight text-slate-200 tracking-tight">
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
                  "shadow-glow-teal ring-2 ring-surface-800",
                  "transition-all duration-base hover:shadow-glow-teal-lg hover:scale-105",
                  "active:scale-95"
                )}
                onClick={handleLogout}
                title="Sair da sessão"
              >
                {initials}
              </button>
            </div>
          ) : (
            <a
              className={cn(
                "rounded-xl border border-brand-blue/25 bg-brand-blue/10 px-3 py-1.5",
                "text-[12px] font-semibold text-brand-blue-light",
                "transition-all duration-base hover:bg-brand-blue/18 hover:border-brand-blue/40"
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
