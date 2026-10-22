import { z } from "zod";

/** Backend origin (separate deployment). Empty string means same origin. */
const API_URL = (process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string | null;
  signal?: AbortSignal;
};

export async function apiFetch<S extends z.ZodType>(
  path: string,
  schema: S,
  { method = "GET", body, token, signal }: RequestOptions = {},
): Promise<z.infer<S>> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    signal,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: unknown } | null;
    throw new ApiError(res.status, typeof data?.error === "string" ? data.error : res.statusText);
  }

  const json: unknown = res.status === 204 ? null : await res.json();
  return schema.parse(json);
}
