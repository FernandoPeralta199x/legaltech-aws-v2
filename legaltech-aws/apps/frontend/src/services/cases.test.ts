import assert from "node:assert/strict";
import test from "node:test";

import type { Case } from "../../types";
import { saveStoredLocalCase } from "../lib/localCases";
import { createCase, getCase, getCaseAggregate, listCases } from "./cases";

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

test("getCaseAggregate maps operational aggregate scoped to a case id", async () => {
  storage.clear();
  let capturedUrl = "";
  globalThis.fetch = (async (url) => {
    capturedUrl = String(url);

    return Response.json({
      success: true,
      data: {
        case: {
          id: "11111111-1111-4111-8111-111111111111",
          request_id: "22222222-2222-4222-8222-222222222222",
          code: "CASO-LOCAL-0001",
          organization_id: "33333333-3333-4333-8333-333333333333",
          created_by: "44444444-4444-4444-8444-444444444444",
          product_type: "analise_contratual",
          product_label: "Análise contratual",
          title: "Aggregate A",
          description: "Caso operacional A",
          status: "report_ready",
          progress: 90,
          risk_level: "medium",
          recommendation: "proceed_with_caution",
          source_mode: "mock",
          is_local_simulation: true,
          created_at: "2026-06-01T10:00:00.000Z",
          updated_at: "2026-06-01T11:00:00.000Z"
        },
        request: {
          id: "22222222-2222-4222-8222-222222222222",
          code: "PED-LOCAL-0001",
          organization_id: "33333333-3333-4333-8333-333333333333",
          created_by: "44444444-4444-4444-8444-444444444444",
          product_type: "analise_contratual",
          product_label: "Análise contratual",
          title: "Pedido A",
          description: "Pedido operacional A",
          status: "case_created",
          source_mode: "local",
          idempotency_key: "idem-a",
          created_at: "2026-06-01T10:00:00.000Z",
          updated_at: "2026-06-01T10:00:00.000Z"
        },
        parties: [
          {
            id: "party-a",
            case_id: "11111111-1111-4111-8111-111111111111",
            organization_id: "33333333-3333-4333-8333-333333333333",
            name: "Parte A",
            document_masked: "000****00",
            document_type: "cpf",
            person_type: "individual",
            role: "contratante",
            email: "parte@example.test",
            phone: "",
            status: "completed",
            risk_level: "low",
            provider_status_summary: "Mock ok",
            metadata: {},
            created_at: "2026-06-01T10:05:00.000Z",
            updated_at: "2026-06-01T10:05:00.000Z"
          }
        ],
        documents: [
          {
            id: "doc-a",
            case_id: "11111111-1111-4111-8111-111111111111",
            organization_id: "33333333-3333-4333-8333-333333333333",
            filename: "contrato-a.pdf",
            original_filename: "contrato-a.pdf",
            mime_type: "application/pdf",
            size_bytes: 2048,
            storage_provider: "local",
            storage_key: "local/case-a/contrato-a.pdf",
            status: "uploaded",
            ocr_status: "not_started",
            ai_read_status: "not_started",
            preview_available: false,
            download_available: false,
            uploaded_at: "2026-06-01T10:07:00.000Z",
            updated_at: "2026-06-01T10:07:00.000Z"
          }
        ],
        timeline: [
          {
            id: "event-a",
            case_id: "11111111-1111-4111-8111-111111111111",
            organization_id: "33333333-3333-4333-8333-333333333333",
            type: "case_created",
            title: "Caso criado",
            description: "Caso A criado.",
            severity: "success",
            source: "system",
            source_mode: "local",
            metadata: {},
            created_at: "2026-06-01T10:00:00.000Z"
          }
        ],
        triage_modules: [
          {
            id: "module-a",
            case_id: "11111111-1111-4111-8111-111111111111",
            organization_id: "33333333-3333-4333-8333-333333333333",
            module_key: "serasa",
            module_label: "Serasa mock",
            provider: "mock_serasa",
            status: "completed",
            source_mode: "mock",
            required: true,
            reason: "Teste",
            started_at: "2026-06-01T10:10:00.000Z",
            finished_at: "2026-06-01T10:11:00.000Z",
            attempts: 1,
            error_code: null,
            error_message: null,
            summary: "Consulta mock concluída.",
            result_ref: "provider-result-a",
            raw_result_ref: "raw-a",
            created_at: "2026-06-01T10:09:00.000Z",
            updated_at: "2026-06-01T10:11:00.000Z"
          }
        ],
        provider_results: [
          {
            id: "provider-result-a",
            case_id: "11111111-1111-4111-8111-111111111111",
            triage_module_id: "module-a",
            organization_id: "33333333-3333-4333-8333-333333333333",
            provider: "mock_serasa",
            provider_request_id: null,
            source_mode: "mock",
            status: "completed",
            input_hash: "hash-a",
            raw_result_ref: "raw-a",
            normalized_result: { risk_level: "low" },
            summary: "Resultado mock A.",
            risk_signals: ["mock_signal_a"],
            confidence: 0.61,
            error_code: null,
            error_message: null,
            created_at: "2026-06-01T10:11:00.000Z",
            updated_at: "2026-06-01T10:11:00.000Z"
          }
        ],
        report: {
          id: "report-a",
          case_id: "11111111-1111-4111-8111-111111111111",
          organization_id: "33333333-3333-4333-8333-333333333333",
          status: "ready",
          version: 1,
          summary: "Relatório do caso A.",
          findings: ["Achado A"],
          legal_risks: ["Risco jurídico A"],
          commercial_risks: [],
          reputational_risks: [],
          contractual_risks: [],
          missing_information: [],
          recommendation: "proceed_with_caution",
          confidence: 0.52,
          limitations: ["Mock local."],
          source_refs: [{ type: "case", id: "11111111-1111-4111-8111-111111111111" }],
          generated_by: "mock_ai_report_provider",
          generated_at: "2026-06-01T11:00:00.000Z",
          updated_at: "2026-06-01T11:00:00.000Z"
        },
        summary: {
          case_id: "11111111-1111-4111-8111-111111111111",
          organization_id: "33333333-3333-4333-8333-333333333333",
          parties_count: 1,
          documents_count: 1,
          timeline_count: 1,
          triage_status: "completed",
          report_status: "ready",
          risk_level: "medium",
          recommendation: "proceed_with_caution",
          progress: 90,
          latest_event_at: "2026-06-01T10:00:00.000Z",
          source_mode: "mock",
          updated_at: "2026-06-01T11:00:00.000Z"
        }
      },
      source_mode: "mock"
    });
  }) as typeof fetch;

  const result = await getCaseAggregate("11111111-1111-4111-8111-111111111111");

  assert.equal(new URL(capturedUrl).pathname, "/api/v1/cases/11111111-1111-4111-8111-111111111111/aggregate");
  assert.equal(result.source, "api");
  assert.equal(result.data.case.id, "11111111-1111-4111-8111-111111111111");
  assert.equal(result.data.case.progressPercent, 90);
  assert.equal(result.data.parties[0].name, "Parte A");
  assert.equal(result.data.parties[0].document, "000****00");
  assert.equal(result.data.documents[0].filename, "contrato-a.pdf");
  assert.equal(result.data.timeline[0].type, "case_created");
  assert.equal(result.data.triageModules[0].moduleKey, "serasa");
  assert.equal(result.data.providerResults[0].caseId, result.data.case.id);
  assert.equal(result.data.report?.summary, "Relatório do caso A.");
  assert.equal(result.data.summary.partiesCount, 1);
});

test("getCaseAggregate local fallback keeps the requested case id", async () => {
  storage.clear();
  const localCase = makeLocalCase({ id: "case-local-b", code: "CASO-LOCAL-B" });
  saveStoredLocalCase(makeLocalCase({ id: "case-local-a", code: "CASO-LOCAL-A" }));
  saveStoredLocalCase(localCase);
  let called = false;

  globalThis.fetch = (async () => {
    called = true;
    throw new Error("fetch should not be called for non-uuid local cases");
  }) as typeof fetch;

  const result = await getCaseAggregate("case-local-b");

  assert.equal(called, false);
  assert.equal(result.source, "mock");
  assert.equal(result.data.case.id, "case-local-b");
  assert.equal(result.data.summary.caseId, "case-local-b");
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
