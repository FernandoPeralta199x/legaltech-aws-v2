import type { ApiResponse } from "@/types";

const DEFAULT_API_BASE_URL = "http://127.0.0.1:8000";

export const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;

type ApiClientOptions = RequestInit & {
  token?: string;
};

function buildUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${apiBaseUrl}${normalizedPath}`;
}

export async function apiRequest<T>(
  path: string,
  options: ApiClientOptions = {}
): Promise<ApiResponse<T>> {
  const { token, headers, ...requestOptions } = options;
  const requestHeaders = new Headers(headers);

  if (!requestHeaders.has("Content-Type") && requestOptions.body) {
    requestHeaders.set("Content-Type", "application/json");
  }
  if (token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(buildUrl(path), {
    ...requestOptions,
    headers: requestHeaders
  });

  return response.json() as Promise<ApiResponse<T>>;
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
    })
};
