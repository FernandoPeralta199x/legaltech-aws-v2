import type { CaseStatus, ClientStatus, DocumentStatus, RiskLevel } from "@/types";

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

export function formatRiskLabel(value: RiskLevel): string {
  const labels: Record<RiskLevel, string> = {
    low: "Baixo",
    medium: "Moderado",
    high: "Alto"
  };

  return labels[value];
}

export function formatStatusLabel(
  value: CaseStatus | ClientStatus | DocumentStatus
): string {
  const labels: Record<string, string> = {
    active: "Ativo",
    completed: "Concluido",
    draft: "Rascunho",
    failed: "Falhou",
    inactive: "Inativo",
    pending_upload: "Aguardando upload",
    processed: "Processado",
    processing: "Em processamento",
    review: "Em revisao",
    submitted: "Enviado",
    uploaded: "Enviado"
  };

  return labels[value] ?? value;
}
