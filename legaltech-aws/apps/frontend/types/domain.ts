// ─── Enums & literals ─────────────────────────────────────────────────────────

export type Role = "admin" | "analyst" | "client" | "viewer";

export type RiskLevel = "low" | "medium" | "high";

export type Priority = "low" | "normal" | "high" | "urgent";

export type ClientStatus = "active" | "review" | "inactive";

export type CaseStatus =
  | "draft"
  | "submitted"
  | "triagem_pendente"
  | "coleta_pendente"
  | "processamento_documental"
  | "analise_contratual"
  | "compliance"
  | "minuta_relatorio"
  | "revisao_humana"
  | "processing"
  | "review"
  | "approved"
  | "delivered"
  | "completed"
  | "failed"
  | "cancelled";

export type DocumentStatus =
  | "pending_upload"
  | "uploaded"
  | "processing"
  | "processed"
  | "validated"
  | "failed";

export type ReportStatus =
  | "draft"
  | "in_review"
  | "approved"
  | "delivered"
  | "rejected";

export type ReviewStatus = "pending" | "approved" | "rejected" | "adjustment_requested";

export type AgentExecutionStatus = "queued" | "running" | "completed" | "failed" | "skipped";

export type PartyType = "contratante" | "contratada" | "avalista" | "fiador" | "testemunha" | "outro";

export type ContractType =
  | "compra_venda"
  | "prestacao_servicos"
  | "locacao"
  | "parceria"
  | "confidencialidade"
  | "due_diligence"
  | "outro";

export type ProductType =
  | "dados_partes"
  | "consulta_objeto"
  | "analise_contratual"
  | "reuniao_equipe";

export type AuditAction =
  | "case_created"
  | "case_submitted"
  | "document_uploaded"
  | "document_processed"
  | "agent_started"
  | "agent_completed"
  | "report_generated"
  | "review_approved"
  | "review_rejected"
  | "review_adjustment"
  | "status_changed"
  | "user_login"
  | "user_logout";

// ─── Core entities ─────────────────────────────────────────────────────────────

export type Organization = {
  id: string;
  name: string;
  cnpj: string;
  plan: "starter" | "professional" | "enterprise";
  casesLimit: number;
  casesUsed: number;
  createdAt: string;
  status: "active" | "suspended";
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  organizationId: string;
  organizationName: string;
  avatarInitials: string;
  createdAt: string;
  lastLoginAt: string;
  status: "active" | "invited" | "inactive";
};

export type Client = {
  id: string;
  name: string;
  documentLabel: string;
  email: string;
  phone: string;
  status: ClientStatus;
  riskLevel: RiskLevel;
  casesCount: number;
  organizationId: string;
  createdAt: string;
};

export type CaseParty = {
  id: string;
  caseId: string;
  name: string;
  document: string;
  type: PartyType;
  email: string;
  phone: string;
  notes: string;
};

export type Case = {
  id: string;
  code: string;
  clientId: string;
  clientName: string;
  caseType: ContractType | string;
  product: ProductType;
  status: CaseStatus;
  priority: Priority;
  documentsCount: number;
  progressPercent: number;
  assignedTo: string | null;
  notes: string;
  estimatedValue?: number;
  parties: CaseParty[];
  updatedAt: string;
  createdAt: string;
  submittedAt: string | null;
};

export type Document = {
  id: string;
  filename: string;
  caseId: string;
  caseCode: string;
  contentType: string;
  status: DocumentStatus;
  sizeLabel: string;
  uploadedAt: string;
  processedAt: string | null;
  notes: string;
};

export type AgentExecution = {
  id: string;
  caseId: string;
  agentName: string;
  agentType:
    | "triagem"
    | "coleta"
    | "doc_processor"
    | "contrato_analyzer"
    | "compliance"
    | "report_writer";
  status: AgentExecutionStatus;
  startedAt: string;
  finishedAt: string | null;
  durationMs: number | null;
  outputSummary: string | null;
  errorMessage: string | null;
};

export type Report = {
  id: string;
  caseId: string;
  caseCode: string;
  status: ReportStatus;
  title: string;
  summary: string;
  risks: ReportRisk[];
  recommendations: string[];
  generatedAt: string;
  approvedAt: string | null;
  approvedBy: string | null;
  version: number;
};

export type ReportRisk = {
  id: string;
  level: RiskLevel;
  title: string;
  description: string;
};

export type Review = {
  id: string;
  caseId: string;
  reportId: string;
  status: ReviewStatus;
  assignedTo: string;
  checklist: ReviewChecklistItem[];
  observations: string;
  createdAt: string;
  reviewedAt: string | null;
};

export type ReviewChecklistItem = {
  id: string;
  label: string;
  checked: boolean;
};

export type AuditLog = {
  id: string;
  caseId: string | null;
  userId: string;
  userName: string;
  action: AuditAction;
  description: string;
  metadata: Record<string, string>;
  createdAt: string;
};

export type TimelineEvent = {
  id: string;
  caseId: string;
  status: CaseStatus;
  label: string;
  description: string;
  actor: string;
  createdAt: string;
};
