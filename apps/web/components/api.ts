const base = process.env.NEXT_PUBLIC_API_URL ?? "/api";
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${base}${path}`, { ...init, credentials: "include", headers: { "content-type": "application/json", ...init?.headers } });
  if (response.status === 401 && typeof window !== "undefined" && !location.pathname.startsWith("/login")) location.href = "/login";
  if (!response.ok) { const body = await response.json().catch(() => ({})); throw new Error(body.error ?? "Não foi possível concluir a operação"); }
  return response.status === 204 ? undefined as T : response.json();
}
