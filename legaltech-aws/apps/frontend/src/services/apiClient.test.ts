import assert from "node:assert/strict";
import test from "node:test";

import { clearStoredSession, saveStoredSession } from "../lib/authStorage";
import { apiClient } from "./apiClient";

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

test("apiClient sends Authorization from the stored dev session", async () => {
  storage.clear();
  saveStoredSession({
    email: "dev.admin@example.test",
    issuedAt: "2026-05-24T12:00:00.000Z",
    organizationId: "11111111-1111-4111-8111-111111111111",
    role: "admin",
    source: "pasted",
    token: "stored.jwt.token",
    userId: "22222222-2222-4222-8222-222222222222"
  });

  let capturedUrl = "";
  let capturedAuthorization = "";

  globalThis.fetch = (async (url, init) => {
    capturedUrl = String(url);
    const headers = new Headers(init?.headers);
    capturedAuthorization = headers.get("Authorization") ?? "";

    return Response.json({ success: true, data: [] });
  }) as typeof fetch;

  await apiClient.get<unknown[]>("/api/v1/clients");

  assert.equal(capturedUrl, "http://127.0.0.1:8000/api/v1/clients");
  assert.equal(capturedAuthorization, "Bearer stored.jwt.token");

  clearStoredSession();
});
