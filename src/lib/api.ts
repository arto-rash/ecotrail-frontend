const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api"
).replace(/\/$/, "");

// Server-side calls inside Docker must reach the API by its service name,
// not the browser-facing URL. Falls back to the public URL elsewhere.
const INTERNAL_API_URL = (process.env.API_INTERNAL_URL ?? API_URL).replace(
  /\/$/,
  "",
);

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
  ) {
    super(`API request failed with status ${status}`);
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const base = typeof window === "undefined" ? INTERNAL_API_URL : API_URL;
  const res = await fetch(`${base}/${path.replace(/^\//, "")}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  const body = res.headers.get("content-type")?.includes("application/json")
    ? await res.json()
    : await res.text();

  if (!res.ok) throw new ApiError(res.status, body);
  return body as T;
}
