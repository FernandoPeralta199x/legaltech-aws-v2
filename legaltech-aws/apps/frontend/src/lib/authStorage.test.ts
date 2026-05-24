import assert from "node:assert/strict";
import test from "node:test";

import {
  clearStoredSession,
  getStoredSession,
  saveStoredSession
} from "./authStorage";
import type { DevSession } from "../types/auth";

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

function makeSession(overrides: Partial<DevSession> = {}): DevSession {
  return {
    email: "dev.admin@example.test",
    issuedAt: "2026-05-24T12:00:00.000Z",
    organizationId: "11111111-1111-4111-8111-111111111111",
    role: "admin",
    source: "pasted",
    token: "header.payload.signature",
    userId: "22222222-2222-4222-8222-222222222222",
    ...overrides
  };
}

test("authStorage saves, reads and clears a dev session", () => {
  storage.clear();
  const session = makeSession();

  saveStoredSession(session);

  assert.deepEqual(getStoredSession(), session);

  clearStoredSession();

  assert.equal(getStoredSession(), null);
});

test("authStorage ignores malformed stored payloads", () => {
  storage.clear();
  storage.setItem("legaltech.dev.session.v1", "{invalid-json");

  assert.equal(getStoredSession(), null);
});
