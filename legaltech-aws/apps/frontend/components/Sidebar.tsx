"use client";

import {
  BarChart3,
  BriefcaseBusiness,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  LogOut,
  Scale,
  Settings,
  Shield,
  UsersRound,
  X
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { cn } from "@/lib/cn";
import { clearStoredSession } from "@/src/lib/authStorage";

const navGroups = [
  {
    label: "Principal",
    items: [
      { href: "/dashboard", label: "Dashboard",   icon: LayoutDashboard },
      { href: "/cases",     label: "Casos",        icon: BriefcaseBusiness },
      { href: "/reports",   label: "Relatórios",   icon: FileText },
      { href: "/clients",   label: "Clientes",     icon: UsersRound }
    ]
  },
  {
    label: "Operação",
    items: [
      { href: "/analyst",   label: "Analista",      icon: ClipboardCheck },
      { href: "/admin",     label: "Administração", icon: Shield },
      { href: "/documents", label: "Documentos",    icon: BarChart3 }
    ]
  },
  {
    label: "Sistema",
    items: [{ href: "/settings", label: "Configurações", icon: Settings }]
  }
];

function NavItem({
  href,
  label,
  icon: Icon,
  active,
  onClick
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      className={cn(
        "group relative flex h-9 items-center gap-3 rounded-lg px-3 text-[13px] font-medium",
        "transition-all duration-base ease-smooth",
        active
          ? "bg-emerald-50 text-emerald-900 shadow-[inset_0_0_0_1px_rgba(5,150,105,0.14)] dark:bg-emerald-950/40 dark:text-emerald-100"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
      )}
      href={href}
      onClick={onClick}
    >
      {/* Active left bar */}
      {active && (
        <span className="absolute left-0 top-1.5 h-6 w-0.5 rounded-r-full bg-brand-teal shadow-glow-teal" />
      )}

      <Icon
        aria-hidden="true"
        className={cn(
          "shrink-0 transition-all duration-base",
          active
            ? "text-brand-teal"
            : "text-slate-500 group-hover:text-slate-700 dark:text-slate-500 dark:group-hover:text-slate-300"
        )}
        size={15}
      />

      <span className="flex-1 truncate">{label}</span>

      {active && (
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-teal opacity-80" />
      )}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white/95 dark:border-slate-800 dark:bg-slate-950/95 lg:flex">
      {/* Logo */}
      <div className="px-5 pt-6 pb-4">
        <Link className="group flex items-center gap-3" href="/">
          <span
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
              "bg-gradient-brand shadow-glow-teal",
              "transition-shadow duration-base group-hover:shadow-glow-teal-lg"
            )}
          >
            <Scale aria-hidden="true" className="text-white" size={18} />
          </span>
          <div>
            <span className="block text-[13px] font-bold tracking-tight text-slate-950 dark:text-slate-100">
              Contrato Visto
            </span>
            <span className="block text-[10px] text-slate-500 dark:text-slate-400">
              MVP local controlado
            </span>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 pb-2">
        {navGroups.map((group) => (
          <div className="mt-4" key={group.label}>
            <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-500">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavItem
                  active={isActive(item.href)}
                  href={item.href}
                  icon={item.icon}
                  key={item.href}
                  label={item.label}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Status pill */}
      <div className="border-t border-slate-200 px-4 py-4 dark:border-slate-800">
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-3 dark:border-emerald-900/60 dark:bg-emerald-950/30">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-teal opacity-40" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-teal" />
            </span>
            <p className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-200">
              Sistema ativo
            </p>
          </div>
          <p className="mt-1 text-[10px] leading-4 text-slate-600 dark:text-slate-400">
            API real com fallback local em desenvolvimento.
          </p>
        </div>
      </div>
    </aside>
  );
}

/* ── Mobile Sidebar ──────────────────────────────────────────────────────── */
type MobileSidebarProps = { open: boolean; onClose: () => void };

export function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href));

  function handleLogout() {
    clearStoredSession();
    onClose();
    router.replace("/login");
  }

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        className={cn(
          "fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-sm lg:hidden",
          "transition-opacity duration-slow ease-smooth",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 lg:hidden",
          "transition-transform duration-slow ease-smooth",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <Link
            className="flex items-center gap-3"
            href="/"
            onClick={onClose}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-brand">
              <Scale aria-hidden="true" className="text-white" size={18} />
            </span>
            <span className="text-[13px] font-bold text-slate-950 dark:text-slate-100">
              Contrato Visto
            </span>
          </Link>
          <button
            aria-label="Fechar menu"
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg",
              "text-slate-500 hover:bg-slate-100 hover:text-slate-950 dark:hover:bg-slate-800 dark:hover:text-slate-100",
              "transition-colors duration-fast"
            )}
            onClick={onClose}
          >
            <X size={17} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          {navGroups.map((group) => (
            <div className="mt-4" key={group.label}>
              <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-500">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavItem
                    active={isActive(item.href)}
                    href={item.href}
                    icon={item.icon}
                    key={item.href}
                    label={item.label}
                    onClick={onClose}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-slate-200 px-4 py-4 dark:border-slate-800">
          <button
            className={cn(
              "flex h-10 w-full items-center justify-center gap-2 rounded-lg border",
              "border-slate-200 bg-white text-xs font-semibold text-slate-700",
              "transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800",
              "dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200",
              "dark:hover:border-emerald-800 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-200"
            )}
            onClick={handleLogout}
            type="button"
          >
            <LogOut size={14} />
            Sair da sessão
          </button>
        </div>
      </aside>
    </>
  );
}
