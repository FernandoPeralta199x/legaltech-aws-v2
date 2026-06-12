import { mockCases } from "../../lib/mockData";
import type {
  Case,
  CaseCreate,
  CaseListFilters,
  CaseUpdate,
  Client,
  ProductType
} from "../../types";
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

type BackendOperationalCase = {
  id?: string;
  case_id?: string;
  request_id?: string | null;
  code?: string;
  title?: string;
  description?: string;
  case_type?: string;
  product_type?: string;
  product_label?: string;
  client_id?: string | null;
  client_name?: string | null;
  status?: string;
  progress?: number;
  risk_level?: string;
  recommendation?: string | null;
  parties_count?: number;
  documents_count?: number;
  triage_status?: string;
  report_status?: string;
  source_mode?: string;
  created_at?: string;
  updated_at?: string;
};

type BackendCaseListPage = {
  items: BackendOperationalCase[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
};

type BackendCaseListPayload = BackendCase[] | BackendCaseListPage;

const productAliases: Record<string, ProductType> = {
  analise_contratual: "analise_contratual",
  contract_analysis: "analise_contratual",
  consulta_objeto: "consulta_objeto",
  dados_partes: "dados_partes",
  reuniao_advogado: "reuniao_equipe",
  reuniao_equipe: "reuniao_equipe"
};

function caseCodeFromId(id: string): string {
  if (id.toLowerCase().startsWith("case-")) {
    return id.replace(/^case-/i, "CASE-").toUpperCase();
  }

  return `CASO-${id.slice(0, 8).toUpperCase()}`;
}

function productFromMetadata(metadata: Record<string, unknown>): ProductType {
  const product = metadata.product;

  return typeof product === "string"
    ? productAliases[product] ?? "analise_contratual"
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

function clampProgress(progress: number): number {
  return Math.max(0, Math.min(100, Math.round(progress)));
}

function isPaginatedCaseList(payload: BackendCaseListPayload): payload is BackendCaseListPage {
  return !Array.isArray(payload) && Array.isArray(payload.items);
}

function caseTypeFromProduct(product: ProductType, rawCaseType?: string): string {
  if (rawCaseType && rawCaseType !== product) {
    return rawCaseType;
  }

  return product === "analise_contratual" ? "contract_analysis" : product;
}

function buildCaseListQuery(filters: CaseListFilters = {}): string {
  const search = new URLSearchParams();

  if (filters.status) search.set("status", filters.status);
  if (filters.caseType) search.set("case_type", filters.caseType);
  if (filters.clientId) search.set("client_id", filters.clientId);
  if (filters.productType) search.set("product_type", filters.productType);
  if (filters.riskLevel) search.set("risk_level", filters.riskLevel);
  if (filters.q) search.set("q", filters.q);
  if (filters.page) search.set("page", String(filters.page));
  if (filters.pageSize) search.set("page_size", String(filters.pageSize));
  if (filters.sortBy) search.set("sort_by", filters.sortBy);
  if (filters.sortOrder) search.set("sort_order", filters.sortOrder);

  const query = search.toString();
  return query ? `?${query}` : "";
}

function resolveListCasesArgs(
  filtersOrClients: CaseListFilters | Client[] = {},
  maybeClients: Client[] = []
): { filters: CaseListFilters; clients: Client[] } {
  if (Array.isArray(filtersOrClients)) {
    return { filters: {}, clients: filtersOrClients };
  }

  return { filters: filtersOrClients, clients: maybeClients };
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

export function mapOperationalCase(legalCase: BackendOperationalCase): Case {
  const id = legalCase.case_id ?? legalCase.id ?? "";
  const product = productAliases[legalCase.product_type ?? ""] ?? "analise_contratual";
  const title = legalCase.title?.trim() || legalCase.code || "Caso operacional";
  const progress =
    typeof legalCase.progress === "number"
      ? clampProgress(legalCase.progress)
      : progressFromStatus(legalCase.status ?? "");

  return {
    id,
    code: legalCase.code ?? caseCodeFromId(id),
    clientId: legalCase.client_id ?? legalCase.request_id ?? id,
    clientName: legalCase.client_name?.trim() || "Nao informado",
    caseType: caseTypeFromProduct(product, legalCase.case_type),
    product,
    productLabel: legalCase.product_label,
    status: (legalCase.status ?? "created") as Case["status"],
    priority: "normal",
    documentsCount: legalCase.documents_count ?? 0,
    progressPercent: progress,
    progress,
    riskLevel: legalCase.risk_level as Case["riskLevel"],
    recommendation: legalCase.recommendation as Case["recommendation"],
    sourceMode: legalCase.source_mode as Case["sourceMode"],
    assignedTo: null,
    notes: legalCase.description ?? "",
    metadata: {
      description: legalCase.description,
      partiesCount: legalCase.parties_count ?? 0,
      recommendation: legalCase.recommendation,
      reportStatus: legalCase.report_status,
      requestId: legalCase.request_id,
      riskLevel: legalCase.risk_level,
      sourceMode: legalCase.source_mode,
      title,
      triageStatus: legalCase.triage_status
    },
    parties: [],
    updatedAt: legalCase.updated_at ?? new Date().toISOString(),
    createdAt: legalCase.created_at ?? legalCase.updated_at ?? new Date().toISOString(),
    submittedAt: legalCase.created_at ?? null
  };
}

function mapCaseListPayload(
  payload: BackendCaseListPayload,
  clients: Client[] = []
): Case[] {
  if (isPaginatedCaseList(payload)) {
    return payload.items.map((legalCase) => mapOperationalCase(legalCase));
  }

  return payload.map((legalCase) => mapBackendCase(legalCase, clients));
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
  filtersOrClients: CaseListFilters | Client[] = {},
  maybeClients: Client[] = []
): Promise<ServiceResult<Case[]>> {
  const { clients, filters } = resolveListCasesArgs(filtersOrClients, maybeClients);
  try {
    const response = await apiClient.get<BackendCaseListPayload>(
      `/api/v1/cases${buildCaseListQuery(filters)}`
    );
    return {
      data: mergeCasesWithLocalCases(mapCaseListPayload(response.data, clients)),
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

    const legalCase = findStoredLocalCase(caseId) ?? mockCases.find((item) => item.id === caseId);
    if (!legalCase) {
      throw error;
    }

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
