import type { ApiErrorBody, CodigoError } from "@/lib/schemas";

export class ServiceError extends Error {
  constructor(
    public codigo: CodigoError,
    public status: number,
    mensaje: string,
    public retryAfterSeg?: number,
  ) {
    super(mensaje);
  }
}

export const MENSAJES: Record<CodigoError, string> = {
  entrada_invalida: "Algo no está bien en lo que mandaste. Probá de nuevo.",
  no_es_dispositivo:
    "No vemos un dispositivo electrónico en la foto. Probá con otra en la que se vea bien el equipo.",
  limite_ip:
    "Ya hiciste varias tasaciones seguidas. Esperá un rato y probá de nuevo, o sumate a la lista de espera.",
  limite_diario:
    "Llegamos al tope de tasaciones de hoy. Sumate a la lista de espera y te avisamos cuando abramos.",
  ia_limite:
    "Nuestro servicio de IA está saturado en este momento. Probá de nuevo en unos minutos.",
  ia_sin_saldo:
    "El tasador se quedó sin créditos por hoy. Sumate a la lista de espera y te avisamos.",
  ia_timeout: "La IA tardó demasiado en responder. Probá de nuevo.",
  ia_respuesta_invalida: "La IA respondió algo que no pudimos entender. Probá de nuevo.",
  ia_no_configurada: "El tasador todavía no está configurado en este servidor.",
  ia_error: "No pudimos hablar con la IA. Probá de nuevo en un rato.",
  webhook_error: "No pudimos guardar tu email. Probá de nuevo en un rato.",
  interno: "Algo salió mal de nuestro lado. Probá de nuevo.",
};

export function errorResponse(err: unknown): Response {
  const e =
    err instanceof ServiceError
      ? err
      : new ServiceError("interno", 500, MENSAJES.interno);
  if (!(err instanceof ServiceError)) console.error("[api] error inesperado", err);
  const body: ApiErrorBody = { error: { codigo: e.codigo, mensaje: e.message } };
  const headers: HeadersInit = e.retryAfterSeg ? { "Retry-After": String(e.retryAfterSeg) } : {};
  return Response.json(body, { status: e.status, headers });
}

export function errorDeLimite(alcance: "ip" | "diario" | undefined, retryAfterSeg: number) {
  const codigo = alcance === "diario" ? "limite_diario" : "limite_ip";
  return new ServiceError(codigo, 429, MENSAJES[codigo], retryAfterSeg);
}
