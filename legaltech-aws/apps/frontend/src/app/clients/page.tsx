import { Plus, UsersRound } from "lucide-react";

import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { PageTitle } from "@/components/PageTitle";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate } from "@/lib/formatters";
import { mockClients } from "@/lib/mockData";

export default function ClientsPage() {
  return (
    <AppLayout>
      <PageTitle
        actions={
          <Button
            disabled
            icon={<Plus aria-hidden="true" size={16} />}
            variant="secondary"
          >
            Novo cliente
          </Button>
        }
        description="Listagem mockada para preparar a futura integracao com GET /api/v1/clients."
        eyebrow="Clientes"
        title="Base de clientes"
      />

      <Card
        description="Dados ficticios. O frontend nunca deve enviar organization_id como fonte de autoridade."
        title="Clientes cadastrados"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="py-3 pr-4 font-semibold">Cliente</th>
                <th className="px-4 py-3 font-semibold">Contato</th>
                <th className="px-4 py-3 font-semibold">Casos</th>
                <th className="px-4 py-3 font-semibold">Risco</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="py-3 pl-4 font-semibold">Criado em</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockClients.map((client) => (
                <tr key={client.id}>
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-registry">
                        <UsersRound aria-hidden="true" size={17} />
                      </span>
                      <div>
                        <p className="font-semibold text-ink">{client.name}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {client.documentLabel}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    <p>{client.email}</p>
                    <p className="mt-1 text-xs text-slate-500">{client.phone}</p>
                  </td>
                  <td className="px-4 py-4 text-slate-700">{client.casesCount}</td>
                  <td className="px-4 py-4">
                    <StatusBadge status={client.riskLevel} tone="risk" />
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={client.status} />
                  </td>
                  <td className="py-4 pl-4 text-slate-600">
                    {formatDate(client.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppLayout>
  );
}
