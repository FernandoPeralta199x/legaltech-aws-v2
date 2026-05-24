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
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 text-center shadow-panel">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-teal-50 text-registry">
          <LockKeyhole aria-hidden="true" size={22} />
        </span>
        <h1 className="mt-5 text-xl font-semibold text-ink">
          Sessao dev necessaria
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          As paginas internas usam uma verificacao local de token enquanto o
          Cognito real ainda nao foi integrado.
        </p>
        <Button className="mt-6" href="/login">
          Ir para login
        </Button>
      </section>
    </main>
  );
}
