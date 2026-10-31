import "server-only";
import type { z } from "zod";
import { MENSAJES, ServiceError } from "./errors";

const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const TIMEOUT_MS = 25_000; // Heroku corta los requests a los 30 s
const PRESUPUESTO_TOTAL_MS = 28_000; // el reintento tiene que entrar antes del corte
const TIMEOUT_MINIMO_REINTENTO_MS = 8_000;

type ContenidoUsuario =
  | string
  | Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }>;

type Pedido<T> = {
  system: string;
  user: ContenidoUsuario;
  schemaName: string;
  jsonSchema: Record<string, unknown>;
  zodSchema: z.ZodType<T>;
};

function modelos(): string[] {
  return (process.env.OPENROUTER_MODELS ?? "")
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);
}

/** Algunos modelos envuelven el JSON en ```json … ``` aunque se pida json_schema. */
function extraerJson(texto: string): unknown {
  const limpio = texto.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  return JSON.parse(limpio);
}

function errorPorStatus(status: number, detalle: string): ServiceError {
  if (status === 429) return new ServiceError("ia_limite", 503, MENSAJES.ia_limite);
  if (status === 402) return new ServiceError("ia_sin_saldo", 503, MENSAJES.ia_sin_saldo);
  console.error(`[openrouter] error ${status}: ${detalle.slice(0, 500)}`);
  return new ServiceError("ia_error", 502, MENSAJES.ia_error);
}

async function llamarUnaVez<T>(
  pedido: Pedido<T>,
  apiKey: string,
  models: string[],
  timeoutMs: number,
): Promise<T> {
  let res: Response;
  let texto: string;
  try {
    res = await fetch(ENDPOINT, {
      method: "POST",
      signal: AbortSignal.timeout(timeoutMs),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.SITE_URL ?? "http://localhost:3000",
        "X-Title": "ReCircuito",
      },
      body: JSON.stringify({
        models,
        messages: [
          { role: "system", content: pedido.system },
          { role: "user", content: pedido.user },
        ],
        response_format: {
          type: "json_schema",
          json_schema: { name: pedido.schemaName, strict: true, schema: pedido.jsonSchema },
        },
        temperature: 0.2,
        // Los modelos con razonamiento tardan demasiado para el corte de 30 s de Heroku,
        // y acá el modelo solo clasifica y redacta (los precios los calculan las reglas).
        reasoning: { enabled: false },
      }),
    });
    // El timeout también puede saltar mientras se lee el cuerpo.
    texto = await res.text();
  } catch (err) {
    const nombre = (err as { name?: string })?.name;
    if (nombre === "TimeoutError" || nombre === "AbortError") {
      throw new ServiceError("ia_timeout", 504, MENSAJES.ia_timeout);
    }
    console.error("[openrouter] error de red", err);
    throw new ServiceError("ia_error", 502, MENSAJES.ia_error);
  }

  if (!res.ok) throw errorPorStatus(res.status, texto);

  let data: {
    choices?: Array<{ message?: { content?: string | null } }>;
    error?: { code?: number; message?: string };
  };
  try {
    data = JSON.parse(texto);
  } catch {
    throw new ServiceError("ia_respuesta_invalida", 502, MENSAJES.ia_respuesta_invalida);
  }
  // OpenRouter a veces responde 200 con el error adentro del cuerpo.
  if (data.error) throw errorPorStatus(data.error.code ?? 500, data.error.message ?? "");

  const contenido = data.choices?.[0]?.message?.content;
  if (!contenido) throw new ServiceError("ia_respuesta_invalida", 502, MENSAJES.ia_respuesta_invalida);

  let json: unknown;
  try {
    json = extraerJson(contenido);
  } catch {
    throw new ServiceError("ia_respuesta_invalida", 502, MENSAJES.ia_respuesta_invalida);
  }
  const parsed = pedido.zodSchema.safeParse(json);
  if (!parsed.success) {
    console.warn("[openrouter] respuesta que no cumple el schema", parsed.error.issues.slice(0, 5));
    throw new ServiceError("ia_respuesta_invalida", 502, MENSAJES.ia_respuesta_invalida);
  }
  return parsed.data;
}

/**
 * Llama a OpenRouter con salida estructurada y valida con zod.
 * Si la respuesta no es válida, reintenta una vez. Los errores de cupo, saldo
 * y timeout no se reintentan.
 */
export async function completarEstructurado<T>(pedido: Pedido<T>): Promise<T> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const models = modelos();
  if (!apiKey || models.length === 0) {
    throw new ServiceError("ia_no_configurada", 503, MENSAJES.ia_no_configurada);
  }
  const inicio = Date.now();
  try {
    return await llamarUnaVez(pedido, apiKey, models, TIMEOUT_MS);
  } catch (err) {
    const restante = PRESUPUESTO_TOTAL_MS - (Date.now() - inicio);
    if (
      err instanceof ServiceError &&
      err.codigo === "ia_respuesta_invalida" &&
      restante >= TIMEOUT_MINIMO_REINTENTO_MS
    ) {
      return llamarUnaVez(pedido, apiKey, models, Math.min(TIMEOUT_MS, restante));
    }
    throw err;
  }
}
