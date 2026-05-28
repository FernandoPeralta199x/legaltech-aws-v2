import type { DevSession } from "../types/auth";
import { DEV_ROLES } from "../types/auth";

export const AUTH_STORAGE_KEY = "legaltech.dev.session.v1";
export const AUTH_SESSION_CHANGED_EVENT = "legaltech-dev-session-changed";

function getBrowserStorage(): Storage | null {
  if (typeof globalThis === "undefined" || !("localStorage" in globalThis)) {
    return null;
  }

  return globalThis.localStorage;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isDevSession(value: unknown): value is DevSession {
  if (!isObject(value)) {
    return false;
  }

  return (
    typeof value.email === "string" &&
    typeof value.issuedAt === "string" &&
    typeof value.organizationId === "string" &&
    typeof value.role === "string" &&
    DEV_ROLES.includes(value.role as DevSession["role"]) &&
    value.source === "pasted" &&
    typeof value.token === "string" &&
    value.token.length > 0 &&
    typeof value.userId === "string"
  );
}

function notifySessionChanged(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT));
}

export function saveStoredSession(session: DevSession): void {
  const storage = getBrowserStorage();
  if (!storage) {
    return;
  }

  storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  notifySessionChanged();
}

export function getStoredSession(): DevSession | null {
  const storage = getBrowserStorage();
  if (!storage) {
    return null;
  }

  const rawValue = storage.getItem(AUTH_STORAGE_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as unknown;
    if (!isDevSession(parsed)) {
      clearStoredSession();
      return null;
    }

    if (parsed.expiresAt && new Date(parsed.expiresAt).getTime() <= Date.now()) {
      clearStoredSession();
      return null;
    }

    return parsed;
  } catch {
    clearStoredSession();
    return null;
  }
}

export function getStoredToken(): string | null {
  return getStoredSession()?.token ?? null;
}

export function clearStoredSession(): void {
  const storage = getBrowserStorage();
  if (!storage) {
    return;
  }

  storage.removeItem(AUTH_STORAGE_KEY);
  notifySessionChanged();
}
