import type { Client, ClientCreate, ClientUpdate } from "../../types";
import { apiClient } from "./apiClient";
import { fallbackReason, shouldUseMockFallback, type ServiceResult } from "./fallback";

type BackendClient = {
  id: string;
  name: string;
  document: string | null;
  email: string | null;
  phone: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

function protectedDocumentLabel(document: string | null | undefined): string {
  if (!document) {
    return "Documento não informado";
  }

  return "Documento protegido";
}

export function mapBackendClient(client: BackendClient): Client {
  return {
    id: client.id,
    name: client.name,
    document: client.document,
    documentLabel: protectedDocumentLabel(client.document),
    email: client.email ?? "",
    phone: client.phone ?? "",
    status: "active",
    riskLevel: "low",
    casesCount: 0,
    metadata: client.metadata,
    createdAt: client.created_at,
    updatedAt: client.updated_at
  };
}

function makeMockClient(payload: ClientCreate): Client {
  const now = new Date().toISOString();

  return {
    id: `client-local-${Date.now()}`,
    name: payload.name,
    document: payload.document,
    documentLabel: protectedDocumentLabel(payload.document),
    email: payload.email ?? "",
    phone: payload.phone ?? "",
    status: "active",
    riskLevel: "low",
    casesCount: 0,
    metadata: payload.metadata ?? { source: "frontend_mock_fallback" },
    createdAt: now,
    updatedAt: now
  };
}

function sanitizeClientPayload<T extends ClientCreate | ClientUpdate>(
  payload: T
): T {
  const sanitized: Partial<ClientCreate> = {};

  if ("name" in payload) {
    sanitized.name = payload.name;
  }
  if ("document" in payload) {
    sanitized.document = payload.document;
  }
  if ("email" in payload) {
    sanitized.email = payload.email;
  }
  if ("phone" in payload) {
    sanitized.phone = payload.phone;
  }
  if ("metadata" in payload) {
    sanitized.metadata = payload.metadata;
  }

  return sanitized as T;
}

export async function listClients(): Promise<ServiceResult<Client[]>> {
  try {
    const response = await apiClient.get<BackendClient[]>("/api/v1/clients");
    return {
      data: response.success ? response.data.map(mapBackendClient) : [],
      source: "api"
    };
  } catch (error) {
    if (!shouldUseMockFallback(error)) {
      throw error;
    }

    return {
      data: [],
      fallbackReason: fallbackReason(error),
      source: "mock"
    };
  }
}

export async function createClient(
  payload: ClientCreate
): Promise<ServiceResult<Client>> {
  const safePayload = sanitizeClientPayload(payload);
  try {
    const response = await apiClient.post<BackendClient>(
      "/api/v1/clients",
      safePayload
    );
    return {
      data: mapBackendClient(response.data),
      source: "api"
    };
  } catch (error) {
    if (!shouldUseMockFallback(error)) {
      throw error;
    }

    return {
      data: makeMockClient(safePayload),
      fallbackReason: fallbackReason(error),
      source: "mock"
    };
  }
}

export async function getClient(clientId: string): Promise<ServiceResult<Client>> {
  try {
    const response = await apiClient.get<BackendClient>(`/api/v1/clients/${clientId}`);
    return {
      data: mapBackendClient(response.data),
      source: "api"
    };
  } catch (error) {
    if (!shouldUseMockFallback(error)) {
      throw error;
    }

    throw error;
  }
}

export async function updateClient(
  clientId: string,
  payload: ClientUpdate
): Promise<ServiceResult<Client>> {
  const safePayload = sanitizeClientPayload(payload);
  try {
    const response = await apiClient.patch<BackendClient>(
      `/api/v1/clients/${clientId}`,
      safePayload
    );
    return {
      data: mapBackendClient(response.data),
      source: "api"
    };
  } catch (error) {
    if (!shouldUseMockFallback(error)) {
      throw error;
    }

    throw error;
  }
}
