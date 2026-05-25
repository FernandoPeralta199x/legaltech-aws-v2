import assert from "node:assert/strict";
import test from "node:test";

import { createCase, listCases } from "./cases";

test("listCases maps backend cases and reports api source", async () => {
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

test("createCase sends backend field names and omits organization_id", async () => {
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
