import type { ApiErrorBody, CodigoError } from "@/lib/schemas";

export class ApiError extends Error {
  constructor(
    public codigo: CodigoError | "red",
    mensaje: string,
    public retryAfterSeg?: number,
  ) {
    super(mensaje);
  }

  /** Errores en los que conviene ofrecer la lista de espera. */
  get ofrecerWaitlist() {
    return ["limite_ip", "limite_diario", "ia_sin_saldo", "ia_no_configurada"].includes(this.codigo);
  }
}

export async function postJson<T>(url: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError("red", "No pudimos conectarnos. Revisá tu conexión y probá de nuevo.");
  }

  const data = (await res.json().catch(() => null)) as T | ApiErrorBody | null;
  if (!res.ok || data === null) {
    const err = (data as ApiErrorBody | null)?.error;
    const retry = Number(res.headers.get("Retry-After")) || undefined;
    throw new ApiError(err?.codigo ?? "interno", err?.mensaje ?? "Algo salió mal. Probá de nuevo.", retry);
  }
  return data as T;
}
