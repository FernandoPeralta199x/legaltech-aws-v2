import { mockCases } from "../../lib/mockData";
import type { Case, CaseCreate, CaseUpdate, Client, ProductType } from "../../types";
import {
  findStoredLocalCase,
  mergeCasesWithLocalCases
} from "../lib/localCases";
import { apiClient } from "./apiClient";
import { fallbackReason, shouldUseMockFallback, type ServiceResult } from "./fallback";

type BackendCase = {
  id: string;
  client_id: string;
  case_type: string;
  status: string;
  priority: "low" | "normal" | "high" | "urgent";
  metadata: Record<string, unknown>;
  submitted_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

function caseCodeFromId(id: string): string {
  if (id.toLowerCase().startsWith("case-")) {
    return id.replace(/^case-/i, "CASE-").toUpperCase();
  }

  return `CASO-${id.slice(0, 8).toUpperCase()}`;
}

function productFromMetadata(metadata: Record<string, unknown>): ProductType {
  const product = metadata.product;
  const allowed: ProductType[] = [
    "dados_partes",
    "consulta_objeto",
    "analise_contratual",
    "reuniao_equipe"
  ];

  return typeof product === "string" && allowed.includes(product as ProductType)
    ? (product as ProductType)
    : "analise_contratual";
}

function progressFromStatus(status: string): number {
  const progress: Record<string, number> = {
    approved: 95,
    cancelled: 0,
    completed: 100,
    delivered: 100,
    draft: 5,
    failed: 100,
    processing: 45,
    review: 80,
    submitted: 15
  };

  return progress[status] ?? 35;
}

export function mapBackendCase(
  legalCase: BackendCase,
  clients: Client[] = []
): Case {
  const client = clients.find((item) => item.id === legalCase.client_id);

  return {
    id: legalCase.id,
    code: caseCodeFromId(legalCase.id),
    clientId: legalCase.client_id,
    clientName: client?.name ?? `Cliente ${legalCase.client_id.slice(0, 8)}`,
    caseType: legalCase.case_type,
    product: productFromMetadata(legalCase.metadata),
    status: legalCase.status as Case["status"],
    priority: legalCase.priority,
    documentsCount: 0,
    progressPercent: progressFromStatus(legalCase.status),
    assignedTo: null,
    notes:
      typeof legalCase.metadata.notes === "string"
        ? legalCase.metadata.notes
        : "",
    metadata: legalCase.metadata,
    parties: [],
    updatedAt: legalCase.updated_at,
    createdAt: legalCase.created_at,
    submittedAt: legalCase.submitted_at
  };
}

function makeMockCase(payload: CaseCreate, clients: Client[] = []): Case {
  const now = new Date().toISOString();
  const client = clients.find((item) => item.id === payload.client_id);

  return {
    id: `case-local-${Date.now()}`,
    code: `CASO-LOCAL-${Date.now().toString().slice(-4)}`,
    clientId: payload.client_id,
    clientName: client?.name ?? "Cliente",
    caseType: payload.case_type,
    product: productFromMetadata(payload.metadata ?? {}),
    status: "draft",
    priority: payload.priority ?? "normal",
    documentsCount: 0,
    progressPercent: 5,
    assignedTo: null,
    notes:
      typeof payload.metadata?.notes === "string"
        ? payload.metadata.notes
        : "",
    metadata: payload.metadata ?? { source: "frontend_mock_fallback" },
    parties: [],
    updatedAt: now,
    createdAt: now,
    submittedAt: null
  };
}

export function enrichCasesWithClients(cases: Case[], clients: Client[]): Case[] {
  return cases.map((legalCase) => {
    const client = clients.find((item) => item.id === legalCase.clientId);
    return client ? { ...legalCase, clientName: client.name } : legalCase;
  });
}

export async function listCases(
  clients: Client[] = []
): Promise<ServiceResult<Case[]>> {
  try {
    const response = await apiClient.get<BackendCase[]>("/api/v1/cases");
    return {
      data: mergeCasesWithLocalCases(
        response.data.map((legalCase) => mapBackendCase(legalCase, clients))
      ),
      source: "api"
    };
  } catch (error) {
    if (!shouldUseMockFallback(error)) {
      throw error;
    }

    return {
      data: mergeCasesWithLocalCases(mockCases),
      fallbackReason: fallbackReason(error),
      source: "mock"
    };
  }
}

export async function createCase(
  payload: CaseCreate,
  clients: Client[] = []
): Promise<ServiceResult<Case>> {
  try {
    const response = await apiClient.post<BackendCase>("/api/v1/cases", payload);
    return {
      data: mapBackendCase(response.data, clients),
      source: "api"
    };
  } catch (error) {
    if (!shouldUseMockFallback(error)) {
      throw error;
    }

    return {
      data: makeMockCase(payload, clients),
      fallbackReason: fallbackReason(error),
      source: "mock"
    };
  }
}

export async function getCase(
  caseId: string,
  clients: Client[] = []
): Promise<ServiceResult<Case>> {
  const localCase = findStoredLocalCase(caseId);
  if (localCase) {
    return {
      data: localCase,
      source: "mock"
    };
  }

  try {
    const response = await apiClient.get<BackendCase>(`/api/v1/cases/${caseId}`);
    return {
      data: mapBackendCase(response.data, clients),
      source: "api"
    };
  } catch (error) {
    if (!shouldUseMockFallback(error)) {
      throw error;
    }

    const legalCase =
      findStoredLocalCase(caseId) ??
      mockCases.find((item) => item.id === caseId) ??
      mockCases[0];
    return {
      data: legalCase,
      fallbackReason: fallbackReason(error),
      source: "mock"
    };
  }
}

export async function updateCase(
  caseId: string,
  payload: CaseUpdate,
  clients: Client[] = []
): Promise<ServiceResult<Case>> {
  try {
    const response = await apiClient.patch<BackendCase>(
      `/api/v1/cases/${caseId}`,
      payload
    );
    return {
      data: mapBackendCase(response.data, clients),
      source: "api"
    };
  } catch (error) {
    if (!shouldUseMockFallback(error)) {
      throw error;
    }

    const current = mockCases.find((legalCase) => legalCase.id === caseId) ?? mockCases[0];
    return {
      data: {
        ...current,
        caseType: payload.case_type ?? current.caseType,
        clientId: payload.client_id ?? current.clientId,
        priority: payload.priority ?? current.priority,
        status: payload.status ?? current.status,
        updatedAt: new Date().toISOString()
      },
      fallbackReason: fallbackReason(error),
      source: "mock"
    };
  }
}
