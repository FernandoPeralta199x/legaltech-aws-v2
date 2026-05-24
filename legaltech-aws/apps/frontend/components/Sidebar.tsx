"use client";

import {
  BriefcaseBusiness,
  FileText,
  LayoutDashboard,
  Scale,
  UsersRound
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";

const navItems = [
  { href: "/", label: "Inicio", icon: LayoutDashboard },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clients", label: "Clientes", icon: UsersRound },
  { href: "/cases", label: "Casos", icon: BriefcaseBusiness },
  { href: "/documents", label: "Documentos", icon: FileText }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-slate-200 bg-white px-5 py-6 lg:block">
      <Link className="flex items-center gap-3" href="/">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink text-white">
          <Scale aria-hidden="true" size={22} />
        </span>
        <span>
          <span className="block text-sm font-semibold text-ink">LegalTech AWS</span>
          <span className="block text-xs text-slate-500">MVP operacional</span>
        </span>
      </Link>

      <nav className="mt-8 space-y-1">
        {navItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              className={cn(
                "flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-slate-700 transition",
                active
                  ? "bg-teal-50 text-registry"
                  : "hover:bg-slate-100 hover:text-ink"
              )}
              href={item.href}
              key={item.href}
            >
              <Icon aria-hidden="true" size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 rounded-lg border border-slate-200 bg-parchment p-4">
        <p className="text-sm font-semibold text-ink">Ambiente local</p>
        <p className="mt-2 text-xs leading-5 text-slate-600">
          UI com dados mockados e preparada para consumir a API FastAPI via
          NEXT_PUBLIC_API_BASE_URL.
        </p>
      </div>
    </aside>
  );
}
