export type RiskLevel = "low" | "medium" | "high";

export type ClientStatus = "active" | "review" | "inactive";

export type CaseStatus =
  | "draft"
  | "submitted"
  | "processing"
  | "review"
  | "completed";

export type DocumentStatus =
  | "pending_upload"
  | "uploaded"
  | "processing"
  | "processed"
  | "failed";

export type Client = {
  id: string;
  name: string;
  documentLabel: string;
  email: string;
  phone: string;
  status: ClientStatus;
  riskLevel: RiskLevel;
  casesCount: number;
  createdAt: string;
};

export type Case = {
  id: string;
  code: string;
  clientName: string;
  caseType: string;
  status: CaseStatus;
  priority: "low" | "normal" | "high";
  documentsCount: number;
  updatedAt: string;
};

export type Document = {
  id: string;
  filename: string;
  caseCode: string;
  contentType: string;
  status: DocumentStatus;
  sizeLabel: string;
  uploadedAt: string;
};
