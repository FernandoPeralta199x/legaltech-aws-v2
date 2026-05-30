import assert from "node:assert/strict";
import test from "node:test";

import { ApiClientError } from "./apiClient";
import { createClient, listClients, updateClient } from "./clients";

test("listClients maps backend clients and reports api source", async () => {
  globalThis.fetch = (async () =>
    Response.json({
      success: true,
      data: [
        {
          id: "client-api-1",
          name: "Cliente API",
          document: "00000000000",
          email: "cliente.api@example.test",
          phone: "+5500000000000",
          metadata: {},
          created_at: "2026-05-25T10:00:00.000Z",
          updated_at: "2026-05-25T10:00:00.000Z"
        }
      ]
    })) as typeof fetch;

  const result = await listClients();

  assert.equal(result.source, "api");
  assert.equal(result.data[0].id, "client-api-1");
  assert.equal(result.data[0].documentLabel, "Documento protegido");
  assert.equal(result.data[0].createdAt, "2026-05-25T10:00:00.000Z");
});

test("listClients falls back to mock only when the API is unavailable", async () => {
  globalThis.fetch = (async () => {
    throw new TypeError("fetch failed");
  }) as typeof fetch;

  const result = await listClients();

  assert.equal(result.source, "mock");
  assert.ok(result.fallbackReason);
  assert.ok(result.data.length > 0);
});

test("listClients does not hide authorization errors behind fallback", async () => {
  globalThis.fetch = (async () =>
    Response.json(
      {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Usuário sem permissão.",
          details: {}
        }
      },
      { status: 403 }
    )) as typeof fetch;

  await assert.rejects(() => listClients(), ApiClientError);
});

test("createClient never sends organization_id from the frontend payload", async () => {
  let requestBody = "";

  globalThis.fetch = (async (_url, init) => {
    requestBody = String(init?.body ?? "");

    return Response.json(
      {
        success: true,
        data: {
          id: "client-created",
          name: "Cliente Criado",
          document: null,
          email: "criado@example.test",
          phone: null,
          metadata: {},
          created_at: "2026-05-25T10:00:00.000Z",
          updated_at: "2026-05-25T10:00:00.000Z"
        }
      },
      { status: 201 }
    );
  }) as typeof fetch;

  await createClient({
    email: "criado@example.test",
    name: "Cliente Criado"
  });

  assert.equal(JSON.parse(requestBody).organization_id, undefined);
});

test("updateClient sends PATCH and omits organization_id from the frontend payload", async () => {
  let requestBody = "";
  let requestMethod = "";
  let requestUrl = "";

  globalThis.fetch = (async (url, init) => {
    requestUrl = String(url);
    requestMethod = String(init?.method);
    requestBody = String(init?.body ?? "");

    return Response.json({
      success: true,
      data: {
        id: "client-updated",
        name: "Cliente Atualizado",
        document: null,
        email: "atualizado@example.test",
        phone: "+5500000000000",
        metadata: {},
        created_at: "2026-05-25T10:00:00.000Z",
        updated_at: "2026-05-25T11:00:00.000Z"
      }
    });
  }) as typeof fetch;

  const result = await updateClient(
    "client-updated",
    {
      email: "atualizado@example.test",
      name: "Cliente Atualizado",
      organization_id: "nao-deve-sair-do-frontend"
    } as Parameters<typeof updateClient>[1] & { organization_id: string }
  );

  const payload = JSON.parse(requestBody);
  assert.equal(requestMethod, "PATCH");
  assert.equal(requestUrl.endsWith("/api/v1/clients/client-updated"), true);
  assert.equal(payload.name, "Cliente Atualizado");
  assert.equal(payload.organization_id, undefined);
  assert.equal(result.source, "api");
  assert.equal(result.data.name, "Cliente Atualizado");
});
