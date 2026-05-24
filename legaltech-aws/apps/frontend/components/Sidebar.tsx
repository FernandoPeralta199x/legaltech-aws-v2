"use client";

import {
  BarChart3,
  BriefcaseBusiness,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  Scale,
  Settings,
  Shield,
  UsersRound,
  X
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";

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
        "group relative flex h-9 items-center gap-3 rounded-xl px-3 text-[13px] font-medium",
        "transition-all duration-base ease-smooth",
        active
          ? "bg-brand-blue/12 text-white"
          : "text-slate-400 hover:bg-white/[0.045] hover:text-slate-100"
      )}
      href={href}
      onClick={onClick}
    >
      {/* Active left bar */}
      {active && (
        <span className="absolute left-0 top-1.5 h-6 w-0.5 rounded-r-full bg-brand-blue shadow-glow" />
      )}

      <Icon
        aria-hidden="true"
        className={cn(
          "shrink-0 transition-all duration-base",
          active
            ? "text-brand-blue"
            : "text-slate-500 group-hover:text-slate-300"
        )}
        size={15}
      />

      <span className="flex-1 truncate">{label}</span>

      {active && (
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-blue opacity-70" />
      )}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-white/[0.06] bg-surface-800 lg:flex">
      {/* Logo */}
      <div className="px-5 pt-6 pb-4">
        <Link className="group flex items-center gap-3" href="/">
          <span
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
              "bg-gradient-brand shadow-glow-teal",
              "transition-shadow duration-base group-hover:shadow-glow-teal-lg"
            )}
          >
            <Scale aria-hidden="true" className="text-white" size={18} />
          </span>
          <div>
            <span className="block text-[13px] font-bold tracking-tight text-white">
              Contrato Visto
            </span>
            <span className="block text-[10px] tracking-wide text-slate-500">
              Análise jurídica IA
            </span>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 pb-2">
        {navGroups.map((group) => (
          <div className="mt-4" key={group.label}>
            <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
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
      <div className="border-t border-white/[0.05] px-4 py-4">
        <div className="rounded-xl border border-brand-teal/15 bg-brand-teal/8 px-3 py-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-teal opacity-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-teal" />
            </span>
            <p className="text-[11px] font-semibold text-brand-teal-light">
              Sistema ativo
            </p>
          </div>
          <p className="mt-1 text-[10px] leading-4 text-slate-500">
            Dados mockados — pronto para API real.
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

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden",
          "transition-opacity duration-slow ease-smooth",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-white/[0.06] bg-surface-800 lg:hidden",
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
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand">
              <Scale aria-hidden="true" className="text-white" size={18} />
            </span>
            <span className="text-[13px] font-bold text-white">
              Contrato Visto
            </span>
          </Link>
          <button
            aria-label="Fechar menu"
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg",
              "text-slate-400 hover:bg-white/[0.06] hover:text-white",
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
              <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
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
      </aside>
    </>
  );
}
