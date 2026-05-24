"use client";

import { LockKeyhole } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect } from "react";

import { Button } from "@/components/Button";
import { useDevSession } from "@/src/lib/useDevSession";

type AuthGuardProps = {
  children: ReactNode;
};

export function AuthGuard({ children }: AuthGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const session = useDevSession();

  useEffect(() => {
    if (!session) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [pathname, router, session]);

  if (session) {
    return children;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-900 px-4 py-10">
      <section className="w-full max-w-md rounded-xl border border-white/[0.08] bg-white/[0.04] p-8 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-blue/10 border border-brand-blue/20 text-brand-blue-light">
          <LockKeyhole aria-hidden="true" size={22} />
        </span>
        <h1 className="mt-5 text-xl font-semibold text-white">
          Acesso restrito
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Faça login para acessar esta página.
        </p>
        <Button className="mt-6" href="/login">
          Ir para login
        </Button>
      </section>
    </main>
  );
}
