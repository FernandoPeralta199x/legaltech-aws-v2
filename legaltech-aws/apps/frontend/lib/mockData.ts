import type { Case, Client, Document } from "@/types";

export const mockClients: Client[] = [
  {
    id: "mock-client-001",
    name: "Cliente Demonstracao Alpha",
    documentLabel: "Documento protegido",
    email: "contato.alpha@example.test",
    phone: "+55 00 00000-0000",
    status: "active",
    riskLevel: "low",
    casesCount: 4,
    createdAt: "2026-05-18T12:00:00.000Z"
  },
  {
    id: "mock-client-002",
    name: "Empresa Exemplo Beta",
    documentLabel: "Documento protegido",
    email: "juridico.beta@example.test",
    phone: "+55 00 00000-0000",
    status: "review",
    riskLevel: "medium",
    casesCount: 2,
    createdAt: "2026-05-20T12:00:00.000Z"
  },
  {
    id: "mock-client-003",
    name: "Operacao Modelo Gama",
    documentLabel: "Documento protegido",
    email: "operacoes.gama@example.test",
    phone: "+55 00 00000-0000",
    status: "active",
    riskLevel: "high",
    casesCount: 1,
    createdAt: "2026-05-22T12:00:00.000Z"
  }
];

export const mockCases: Case[] = [
  {
    id: "mock-case-001",
    code: "CASE-2026-001",
    clientName: "Cliente Demonstracao Alpha",
    caseType: "Analise contratual",
    status: "processing",
    priority: "high",
    documentsCount: 6,
    updatedAt: "2026-05-24T10:30:00.000Z"
  },
  {
    id: "mock-case-002",
    code: "CASE-2026-002",
    clientName: "Empresa Exemplo Beta",
    caseType: "Due diligence",
    status: "review",
    priority: "normal",
    documentsCount: 3,
    updatedAt: "2026-05-23T16:10:00.000Z"
  },
  {
    id: "mock-case-003",
    code: "CASE-2026-003",
    clientName: "Operacao Modelo Gama",
    caseType: "Consulta de objeto",
    status: "draft",
    priority: "normal",
    documentsCount: 0,
    updatedAt: "2026-05-22T09:45:00.000Z"
  }
];

export const mockDocuments: Document[] = [
  {
    id: "mock-document-001",
    filename: "contrato-demonstrativo.pdf",
    caseCode: "CASE-2026-001",
    contentType: "application/pdf",
    status: "processed",
    sizeLabel: "1.4 MB",
    uploadedAt: "2026-05-24T09:20:00.000Z"
  },
  {
    id: "mock-document-002",
    filename: "minuta-operacional.docx",
    caseCode: "CASE-2026-001",
    contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    status: "processing",
    sizeLabel: "860 KB",
    uploadedAt: "2026-05-24T10:05:00.000Z"
  },
  {
    id: "mock-document-003",
    filename: "relatorio-preliminar.txt",
    caseCode: "CASE-2026-002",
    contentType: "text/plain",
    status: "uploaded",
    sizeLabel: "42 KB",
    uploadedAt: "2026-05-23T15:40:00.000Z"
  }
];
