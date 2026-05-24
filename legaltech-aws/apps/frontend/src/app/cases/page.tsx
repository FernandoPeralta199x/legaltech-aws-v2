import { BriefcaseBusiness, Plus } from "lucide-react";

import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { PageTitle } from "@/components/PageTitle";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate } from "@/lib/formatters";
import { mockCases } from "@/lib/mockData";

const priorityLabels = {
  high: "Alta",
  low: "Baixa",
  normal: "Normal"
};

export default function CasesPage() {
  return (
    <AppLayout>
      <PageTitle
        actions={
          <Button
            disabled
            icon={<Plus aria-hidden="true" size={16} />}
            variant="secondary"
          >
            Novo caso
          </Button>
        }
        description="Listagem mockada para preparar GET /api/v1/cases e POST /api/v1/cases."
        eyebrow="Casos"
        title="Fluxos juridicos"
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {mockCases.map((legalCase) => (
          <Card className="flex flex-col" key={legalCase.id}>
            <div className="flex items-start justify-between gap-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                <BriefcaseBusiness aria-hidden="true" size={18} />
              </span>
              <StatusBadge status={legalCase.status} />
            </div>
            <p className="mt-5 text-sm font-semibold text-registry">
              {legalCase.code}
            </p>
            <h2 className="mt-2 text-lg font-semibold text-ink">
              {legalCase.caseType}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {legalCase.clientName}
            </p>
            <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-slate-500">Prioridade</dt>
                <dd className="mt-1 font-semibold text-ink">
                  {priorityLabels[legalCase.priority]}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Documentos</dt>
                <dd className="mt-1 font-semibold text-ink">
                  {legalCase.documentsCount}
                </dd>
              </div>
            </dl>
            <p className="mt-5 text-sm text-slate-500">
              Atualizado em {formatDate(legalCase.updatedAt)}
            </p>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}
