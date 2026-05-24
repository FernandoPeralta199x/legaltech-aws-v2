import { FileText } from "lucide-react";
import Link from "next/link";

import { AppLayout } from "@/components/AppLayout";
import { AuthGuard } from "@/components/AuthGuard";
import { Card } from "@/components/Card";
import { PageTitle } from "@/components/PageTitle";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate } from "@/lib/formatters";
import { mockDocuments } from "@/lib/mockData";

export default function DocumentsPage() {
  return (
    <AuthGuard>
      <AppLayout>
        <PageTitle
          description="Documentos enviados para os casos jurídicos, com status de processamento."
          eyebrow="Documentos"
          title="Documentos enviados"
        />

        <Card title="Arquivos recentes" description="Sem upload real — dados demonstrativos.">
          <div className="space-y-3">
            {mockDocuments.map((doc) => (
              <div
                className="flex flex-wrap items-center gap-4 rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3"
                key={doc.id}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.06]">
                    <FileText className="text-slate-400" size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-slate-100">
                      {doc.filename}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {doc.sizeLabel} · {doc.contentType.split("/")[1]?.toUpperCase()}
                    </p>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <p className="text-[11px] text-slate-500">Caso</p>
                  <Link
                    className="text-xs font-medium text-brand-blue-light hover:underline"
                    href={`/cases/${doc.caseId}`}
                  >
                    {doc.caseCode}
                  </Link>
                </div>
                <div className="hidden md:block">
                  <p className="text-[11px] text-slate-500">Upload</p>
                  <p className="text-xs text-slate-300">{formatDate(doc.uploadedAt)}</p>
                </div>
                <StatusBadge status={doc.status} />
              </div>
            ))}
          </div>
        </Card>
      </AppLayout>
    </AuthGuard>
  );
}
