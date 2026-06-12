import assert from "node:assert/strict";
import test from "node:test";

import type { Case } from "../../types";
import { saveStoredLocalCase } from "../lib/localCases";
import { createCase, getCase, listCases } from "./cases";

class MemoryStorage {
  private values = new Map<string, string>();

  clear() {
    this.values.clear();
  }

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  removeItem(key: string) {
    this.values.delete(key);
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

const storage = new MemoryStorage();
Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  value: storage
});

function makeLocalCase(overrides: Partial<Case> = {}): Case {
  return {
    id: "case-local-wizard",
    code: "CASO-LOCAL-000001",
    clientId: "party-local",
    clientName: "Cliente Local",
    caseType: "contract_analysis",
    product: "analise_contratual",
    status: "submitted",
    priority: "normal",
    documentsCount: 1,
    progressPercent: 15,
    assignedTo: null,
    notes: "Registro local criado pelo fluxo Novo Pedido do MVP.",
    metadata: {
      origin: "local",
      source: "new_case_wizard",
      syncStatus: "local_only"
    },
    parties: [],
    updatedAt: "2026-06-01T10:00:00.000Z",
    createdAt: "2026-06-01T10:00:00.000Z",
    submittedAt: "2026-06-01T10:00:00.000Z",
    ...overrides
  };
}

test("listCases maps backend cases and reports api source", async () => {
  storage.clear();
  globalThis.fetch = (async () =>
    Response.json({
      success: true,
      data: [
        {
          id: "case-api-1",
          client_id: "client-api-1",
          case_type: "contract_analysis",
          status: "draft",
          priority: "normal",
          metadata: { product: "analise_contratual" },
          submitted_at: null,
          completed_at: null,
          created_at: "2026-05-25T10:00:00.000Z",
          updated_at: "2026-05-25T10:30:00.000Z"
        }
      ]
    })) as typeof fetch;

  const result = await listCases();

  assert.equal(result.source, "api");
  assert.equal(result.data[0].id, "case-api-1");
  assert.equal(result.data[0].code, "CASE-API-1");
  assert.equal(result.data[0].product, "analise_contratual");
});

test("listCases maps operational paginated backend cases without local fallback", async () => {
  storage.clear();
  globalThis.fetch = (async () =>
    Response.json({
      success: true,
      data: {
        items: [
          {
            id: "case-operational-a",
            case_id: "case-operational-a",
            request_id: "request-operational-a",
            code: "CASO-LOCAL-0001",
            title: "Análise operacional A",
            product_type: "analise_contratual",
            product_label: "Análise contratual",
            status: "triage_completed",
            progress: 75,
            risk_level: "medium",
            recommendation: "proceed_with_caution",
            parties_count: 2,
            documents_count: 1,
            triage_status: "completed",
            report_status: "ready",
            source_mode: "mock",
            created_at: "2026-06-01T10:00:00.000Z",
            updated_at: "2026-06-01T11:00:00.000Z"
          },
          {
            id: "case-operational-b",
            case_id: "case-operational-b",
            code: "CASO-LOCAL-0002",
            title: "Análise operacional B",
            product_type: "dados_partes",
            product_label: "Dados das partes",
            status: "created",
            progress: 0,
            risk_level: "unknown",
            parties_count: 0,
            documents_count: 0,
            triage_status: "not_started",
            report_status: "not_started",
            source_mode: "local",
            created_at: "2026-06-02T10:00:00.000Z",
            updated_at: "2026-06-02T10:00:00.000Z"
          }
        ],
        page: 1,
        page_size: 20,
        total: 2,
        total_pages: 1
      },
      source_mode: "mock"
    })) as typeof fetch;

  const result = await listCases();

  assert.equal(result.source, "api");
  assert.equal(result.fallbackReason, undefined);
  assert.equal(result.data.length, 2);
  assert.equal(result.data[0].id, "case-operational-a");
  assert.equal(result.data[0].status, "triage_completed");
  assert.equal(result.data[0].progressPercent, 75);
  assert.equal(result.data[0].documentsCount, 1);
  assert.equal(result.data[0].sourceMode, "mock");
  assert.equal(result.data[0].riskLevel, "medium");
  assert.equal(result.data[0].metadata?.reportStatus, "ready");
  assert.equal(result.data[0].metadata?.partiesCount, 2);
  assert.equal(result.data[1].id, "case-operational-b");
  assert.equal(result.data[1].progressPercent, 0);
});

test("listCases accepts pagination and multi-case filters", async () => {
  storage.clear();
  let capturedUrl = "";
  globalThis.fetch = (async (url) => {
    capturedUrl = String(url);

    return Response.json({
      success: true,
      data: []
    });
  }) as typeof fetch;

  await listCases({
    page: 2,
    pageSize: 10,
    productType: "analise_contratual",
    q: "CASO",
    riskLevel: "unknown",
    sortBy: "updated_at",
    sortOrder: "desc",
    status: "created"
  });

  const url = new URL(capturedUrl);
  assert.equal(url.searchParams.get("page"), "2");
  assert.equal(url.searchParams.get("page_size"), "10");
  assert.equal(url.searchParams.get("product_type"), "analise_contratual");
  assert.equal(url.searchParams.get("risk_level"), "unknown");
  assert.equal(url.searchParams.get("status"), "created");
});

test("listCases includes locally stored wizard cases before backend cases", async () => {
  storage.clear();
  const localCase = makeLocalCase();
  saveStoredLocalCase(localCase);

  globalThis.fetch = (async () =>
    Response.json({
      success: true,
      data: [
        {
          id: "case-api-1",
          client_id: "client-api-1",
          case_type: "contract_analysis",
          status: "draft",
          priority: "normal",
          metadata: { product: "analise_contratual" },
          submitted_at: null,
          completed_at: null,
          created_at: "2026-05-25T10:00:00.000Z",
          updated_at: "2026-05-25T10:30:00.000Z"
        }
      ]
    })) as typeof fetch;

  const result = await listCases();

  assert.equal(result.source, "api");
  assert.equal(result.data.length, 2);
  assert.equal(result.data[0].id, localCase.id);
  assert.equal(result.data[0].metadata?.syncStatus, "local_only");
  assert.equal(result.data[1].id, "case-api-1");
});

test("listCases deduplicates locally stored wizard cases on refresh", async () => {
  storage.clear();
  const localCase = makeLocalCase();
  saveStoredLocalCase(localCase);

  globalThis.fetch = (async () =>
    Response.json({
      success: true,
      data: [
        {
          id: localCase.id,
          client_id: localCase.clientId,
          case_type: localCase.caseType,
          status: localCase.status,
          priority: localCase.priority,
          metadata: { product: localCase.product },
          submitted_at: localCase.submittedAt,
          completed_at: null,
          created_at: localCase.createdAt,
          updated_at: localCase.updatedAt
        }
      ]
    })) as typeof fetch;

  const result = await listCases();

  assert.equal(result.data.length, 1);
  assert.equal(result.data[0].id, localCase.id);
});

test("getCase returns locally stored wizard cases without fetching the backend", async () => {
  storage.clear();
  const localCase = makeLocalCase();
  let called = false;
  saveStoredLocalCase(localCase);

  globalThis.fetch = (async () => {
    called = true;
    throw new Error("fetch should not be called for local cases");
  }) as typeof fetch;

  const result = await getCase(localCase.id);

  assert.equal(result.data.id, localCase.id);
  assert.equal(result.data.metadata?.syncStatus, "local_only");
  assert.equal(called, false);
});

test("createCase sends backend field names and omits organization_id", async () => {
  storage.clear();
  let requestBody = "";

  globalThis.fetch = (async (_url, init) => {
    requestBody = String(init?.body ?? "");

    return Response.json(
      {
        success: true,
        data: {
          id: "case-created",
          client_id: "client-api-1",
          case_type: "contract_analysis",
          status: "draft",
          priority: "high",
          metadata: {},
          submitted_at: null,
          completed_at: null,
          created_at: "2026-05-25T10:00:00.000Z",
          updated_at: "2026-05-25T10:00:00.000Z"
        }
      },
      { status: 201 }
    );
  }) as typeof fetch;

  await createCase({
    case_type: "contract_analysis",
    client_id: "client-api-1",
    priority: "high"
  });

  const payload = JSON.parse(requestBody);
  assert.equal(payload.client_id, "client-api-1");
  assert.equal(payload.organization_id, undefined);
});
