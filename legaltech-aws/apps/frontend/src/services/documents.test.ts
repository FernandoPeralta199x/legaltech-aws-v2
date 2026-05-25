import assert from "node:assert/strict";
import test from "node:test";

import { createDocument, listDocuments } from "./documents";

test("listDocuments maps backend documents and reports api source", async () => {
  globalThis.fetch = (async () =>
    Response.json({
      success: true,
      data: [
        {
          id: "doc-api-1",
          case_id: "case-api-1",
          filename: "contrato.pdf",
          content_type: "application/pdf",
          size_bytes: 2048,
          file_hash: null,
          status: "uploaded",
          uploaded_by: null,
          uploaded_at: "2026-05-25T10:00:00.000Z",
          metadata: {},
          created_at: "2026-05-25T10:00:00.000Z",
          updated_at: "2026-05-25T10:00:00.000Z"
        }
      ]
    })) as typeof fetch;

  const result = await listDocuments();

  assert.equal(result.source, "api");
  assert.equal(result.data[0].id, "doc-api-1");
  assert.equal(result.data[0].sizeLabel, "2 KB");
  assert.equal(result.data[0].caseCode, "CASE-API-1");
});

test("createDocument sends metadata-only backend payload without organization_id", async () => {
  let requestBody = "";

  globalThis.fetch = (async (_url, init) => {
    requestBody = String(init?.body ?? "");

    return Response.json(
      {
        success: true,
        data: {
          id: "doc-created",
          case_id: "case-api-1",
          filename: "contrato.pdf",
          content_type: "application/pdf",
          size_bytes: 1024,
          file_hash: null,
          status: "pending_upload",
          uploaded_by: null,
          uploaded_at: null,
          metadata: {},
          created_at: "2026-05-25T10:00:00.000Z",
          updated_at: "2026-05-25T10:00:00.000Z"
        }
      },
      { status: 201 }
    );
  }) as typeof fetch;

  await createDocument({
    case_id: "case-api-1",
    content_type: "application/pdf",
    filename: "contrato.pdf",
    size_bytes: 1024
  });

  const payload = JSON.parse(requestBody);
  assert.equal(payload.case_id, "case-api-1");
  assert.equal(payload.organization_id, undefined);
});
