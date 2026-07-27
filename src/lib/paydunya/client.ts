// Client HTTP bas niveau PayDunya (fetch + headers + gestion erreurs réseau).
import { PAYDUNYA_BASE_URL, getPaydunyaHeaders } from "./config";

export class PaydunyaError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly httpStatus?: number
  ) {
    super(message);
    this.name = "PaydunyaError";
  }
}

/** Appel API PayDunya avec timeout (évite les requêtes suspendues). */
export async function paydunyaFetch<T = Record<string, unknown>>(
  path: string,
  init?: RequestInit,
  timeoutMs = 15000
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${PAYDUNYA_BASE_URL}${path}`, {
      ...init,
      headers: { ...getPaydunyaHeaders(), ...(init?.headers || {}) },
      signal: controller.signal,
      cache: "no-store",
    });

    if (!res.ok) {
      throw new PaydunyaError(
        `PayDunya HTTP ${res.status}`,
        "http_error",
        res.status
      );
    }
    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof PaydunyaError) throw err;
    if ((err as Error).name === "AbortError") {
      throw new PaydunyaError("Timeout PayDunya (15s)", "timeout");
    }
    throw new PaydunyaError(
      `Erreur réseau PayDunya: ${(err as Error).message}`,
      "network_error"
    );
  } finally {
    clearTimeout(timer);
  }
}
