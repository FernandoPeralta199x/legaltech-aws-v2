import {
  clearStoredSession,
  getStoredSession,
  saveStoredSession
} from "../lib/authStorage";
import type { DecodedDevJwt, DevLoginInput, DevRole, DevSession } from "../types/auth";
import { DEV_ROLES } from "../types/auth";

const DEV_ORGANIZATION_ID = "11111111-1111-4111-8111-111111111111";
const DEV_USER_ID = "22222222-2222-4222-8222-222222222222";
const DEV_AUDIENCE = "legaltech-local-api";
const DEV_ISSUER = "legaltech-local-dev";

function base64UrlEncode(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(input: string): string {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));

  return new TextDecoder().decode(bytes);
}

export function isDevRole(value: string): value is DevRole {
  return DEV_ROLES.includes(value as DevRole);
}

export function decodeDevJwt(token: string): DecodedDevJwt | null {
  const parts = token.trim().split(".");
  if (parts.length !== 3 || !parts[1]) {
    return null;
  }

  try {
    return JSON.parse(base64UrlDecode(parts[1])) as DecodedDevJwt;
  } catch {
    return null;
  }
}

export function createLocalPlaceholderDevToken(role: DevRole): string {
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const payload: DecodedDevJwt = {
    aud: DEV_AUDIENCE,
    email: `dev.${role}@example.test`,
    exp: nowInSeconds + 60 * 60 * 8,
    iat: nowInSeconds,
    iss: DEV_ISSUER,
    sub: DEV_USER_ID,
    token_use: "id",
    "custom:organization_id": DEV_ORGANIZATION_ID,
    "custom:role": role
  };

  return [
    base64UrlEncode(JSON.stringify({ alg: "none", typ: "JWT" })),
    base64UrlEncode(JSON.stringify(payload)),
    "dev-ui-placeholder"
  ].join(".");
}

export function buildDevSession(input: DevLoginInput): DevSession {
  const providedToken = input.token?.trim();
  if (!providedToken) {
    throw new Error("JWT dev é obrigatório para criar sessão local.");
  }

  const token = providedToken;
  const decodedToken = decodeDevJwt(token);
  const decodedRole = decodedToken?.["custom:role"] ?? decodedToken?.role;
  const role = decodedRole && isDevRole(decodedRole) ? decodedRole : input.role;
  const issuedAt = decodedToken?.iat
    ? new Date(decodedToken.iat * 1000).toISOString()
    : new Date().toISOString();
  const expiresAt = decodedToken?.exp
    ? new Date(decodedToken.exp * 1000).toISOString()
    : undefined;

  return {
    email: decodedToken?.email ?? `dev.${role}@example.test`,
    expiresAt,
    issuedAt,
    organizationId:
      decodedToken?.["custom:organization_id"] ??
      decodedToken?.organization_id ??
      DEV_ORGANIZATION_ID,
    role,
    source: "pasted",
    token,
    userId: decodedToken?.sub ?? DEV_USER_ID
  };
}

export function saveDevSession(input: DevLoginInput): DevSession {
  const session = buildDevSession(input);
  saveStoredSession(session);
  return session;
}

export function getCurrentDevSession(): DevSession | null {
  return getStoredSession();
}

export function logoutDevSession(): void {
  clearStoredSession();
}
