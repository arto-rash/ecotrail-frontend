const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api"
).replace(/\/$/, "");

// Server-side calls inside Docker must reach the API by its service name,
// not the browser-facing URL. Falls back to the public URL elsewhere.
const INTERNAL_API_URL = (process.env.API_INTERNAL_URL || API_URL).replace(
  /\/$/,
  "",
);

export const PUBLIC_API_URL = API_URL;

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
  ) {
    super(`API request failed with status ${status}`);
  }
}

type ApiInit = RequestInit & { next?: { revalidate?: number | false; tags?: string[] } };

export async function api<T>(path: string, init?: ApiInit): Promise<T> {
  const base = typeof window === "undefined" ? INTERNAL_API_URL : API_URL;
  const isForm = init?.body instanceof FormData;
  const res = await fetch(`${base}/${path.replace(/^\//, "")}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(isForm ? {} : { "Content-Type": "application/json" }),
      ...init?.headers,
    },
  });

  const body = res.headers.get("content-type")?.includes("application/json")
    ? await res.json()
    : await res.text();

  if (!res.ok) throw new ApiError(res.status, body);
  return body as T;
}

/** Resolve an image path from the API: bundled images live in /public, uploads on the API host. */
export function imageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("/storage/")) return new URL(API_URL).origin + path;
  return path;
}
