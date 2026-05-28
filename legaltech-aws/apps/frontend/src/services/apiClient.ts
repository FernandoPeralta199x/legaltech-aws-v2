import { getStoredToken } from "../lib/authStorage";
import type { ApiError, ApiResponse, ApiSuccessResponse } from "../../types/api";

const DEFAULT_API_PORT = "8000";
const LOCAL_API_FALLBACK_HOST = "127.0.0.1";

function normalizeBaseUrl(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

function isLoopbackHost(hostname: string | undefined): boolean {
  if (!hostname) {
    return false;
  }

  return ["127.0.0.1", "localhost", "::1", "[::1]"].includes(hostname);
}

function getRuntimeLocation():
  | { hostname?: string; protocol?: string }
  | null {
  if (typeof window !== "undefined" && window.location) {
    return window.location;
  }

  if ("location" in globalThis) {
    return globalThis.location as { hostname?: string; protocol?: string };
  }

  return null;
}

function rewriteLoopbackForLanAccess(
  configuredBaseUrl: string,
  runtimeLocation: { hostname?: string } | null
): string {
  const browserHost = runtimeLocation?.hostname?.trim();
  if (!browserHost || browserHost === "0.0.0.0" || isLoopbackHost(browserHost)) {
    return normalizeBaseUrl(configuredBaseUrl);
  }

  try {
    const parsedUrl = new URL(configuredBaseUrl);
    if (!isLoopbackHost(parsedUrl.hostname)) {
      return normalizeBaseUrl(configuredBaseUrl);
    }

    parsedUrl.hostname = browserHost;
    return normalizeBaseUrl(parsedUrl.toString());
  } catch {
    return normalizeBaseUrl(configuredBaseUrl);
  }
}

export function resolveApiBaseUrl(): string {
  const runtimeLocation = getRuntimeLocation();
  const configuredBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (configuredBaseUrl) {
    return rewriteLoopbackForLanAccess(configuredBaseUrl, runtimeLocation);
  }

  const hostname = runtimeLocation?.hostname?.trim();
  if (hostname && hostname !== "0.0.0.0") {
    const protocol = runtimeLocation?.protocol === "https:" ? "https:" : "http:";
    return `${protocol}//${hostname}:${DEFAULT_API_PORT}`;
  }

  return `http://${LOCAL_API_FALLBACK_HOST}:${DEFAULT_API_PORT}`;
}

export const apiBaseUrl = resolveApiBaseUrl();

type ApiClientOptions = RequestInit & {
  token?: string;
};

export class ApiClientError extends Error {
  readonly code: string;
  readonly details?: Record<string, unknown>;
  readonly status: number;

  constructor(error: ApiError, status: number) {
    super(error.message);
    this.name = "ApiClientError";
    this.code = error.code;
    this.details = error.details;
    this.status = status;
  }
}

export class ApiNetworkError extends Error {
  constructor(message = "API indisponivel.") {
    super(message);
    this.name = "ApiNetworkError";
  }
}

function buildUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${resolveApiBaseUrl()}${normalizedPath}`;
}

function shouldSetJsonContentType(body: BodyInit | null | undefined): boolean {
  return Boolean(body) && !(body instanceof FormData);
}

export async function apiRequest<T>(
  path: string,
  options: ApiClientOptions = {}
): Promise<ApiSuccessResponse<T>> {
  const { token, headers, ...requestOptions } = options;
  const requestHeaders = new Headers(headers);
  const bearerToken = token ?? getStoredToken();

  if (
    !requestHeaders.has("Content-Type") &&
    shouldSetJsonContentType(requestOptions.body)
  ) {
    requestHeaders.set("Content-Type", "application/json");
  }
  if (bearerToken) {
    requestHeaders.set("Authorization", `Bearer ${bearerToken}`);
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path), {
      ...requestOptions,
      headers: requestHeaders
    });
  } catch {
    throw new ApiNetworkError();
  }

  let payload: ApiResponse<T>;
  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new ApiClientError(
      {
        code: "INVALID_RESPONSE",
        message: "Resposta inválida da API.",
        details: {}
      },
      response.status
    );
  }

  if (!response.ok || !payload.success) {
    const error = payload.success
      ? {
          code: "HTTP_ERROR",
          message: `Erro HTTP ${response.status}.`,
          details: {}
        }
      : payload.error;

    throw new ApiClientError(error, response.status);
  }

  return payload;
}

export const apiClient = {
  get: <T>(path: string, options?: ApiClientOptions) =>
    apiRequest<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body: unknown, options?: ApiClientOptions) =>
    apiRequest<T>(path, {
      ...options,
      method: "POST",
      body: JSON.stringify(body)
    }),
  patch: <T>(path: string, body: unknown, options?: ApiClientOptions) =>
    apiRequest<T>(path, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(body)
    }),
  postForm: <T>(path: string, body: FormData, options?: ApiClientOptions) =>
    apiRequest<T>(path, {
      ...options,
      method: "POST",
      body
    })
};
