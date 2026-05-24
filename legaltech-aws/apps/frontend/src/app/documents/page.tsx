import { FileText, Upload } from "lucide-react";

import { AppLayout } from "@/components/AppLayout";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/Button";
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
          actions={
            <Button
              disabled
              icon={<Upload aria-hidden="true" size={16} />}
              variant="secondary"
            >
              Upload futuro
            </Button>
          }
          description="Listagem mockada para preparar metadata, upload local/mock e URLs temporarias sem expor storage interno."
          eyebrow="Documentos"
          title="Documentos do MVP"
        />

        <Card
          description="Sem upload real nesta tarefa. Os nomes abaixo sao ficticios e usados apenas para UI."
          title="Arquivos recentes"
        >
          <div className="divide-y divide-slate-100">
            {mockDocuments.map((document) => (
              <div
                className="grid gap-4 py-4 md:grid-cols-[1.4fr_0.8fr_0.8fr_0.6fr]"
                key={document.id}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700">
                    <FileText aria-hidden="true" size={18} />
                  </span>
                  <div>
                    <p className="font-semibold text-ink">{document.filename}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {document.contentType}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">
                    Caso
                  </p>
                  <p className="mt-1 text-sm text-slate-700">{document.caseCode}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">
                    Upload
                  </p>
                  <p className="mt-1 text-sm text-slate-700">
                    {formatDate(document.uploadedAt)} · {document.sizeLabel}
                  </p>
                </div>
                <div className="flex items-center md:justify-end">
                  <StatusBadge status={document.status} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </AppLayout>
    </AuthGuard>
  );
}
