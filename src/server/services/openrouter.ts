import "server-only";
import type { z } from "zod";
import { MENSAJES, ServiceError } from "./errors";

const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const PRESUPUESTO_TOTAL_MS = 28_000; // Heroku corta los requests a los 30 s
/** Tope por intento cuando todavía queda otro modelo atrás: le deja tiempo al respaldo. */
const TIMEOUT_CON_RESPALDO_MS = 14_000;
const TIMEOUT_MINIMO_INTENTO_MS = 6_000;

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

/**
 * Razonamiento por modelo. Se pide apagado porque acá el modelo solo clasifica y redacta
 * (los precios los calculan las reglas) y razonar tarda demasiado para el corte de Heroku.
 * Algunos modelos (por ejemplo Gemini 3.5) no permiten apagarlo y responden 400: a esos se
 * les pide el esfuerzo mínimo, y se recuerda para no volver a fallar mientras viva el proceso.
 */
const RAZONAMIENTO_APAGADO = { enabled: false } as const;
const RAZONAMIENTO_MINIMO = { effort: "minimal" } as const;
const conRazonamientoObligatorio = new Set<string>();
const razonamientoPara = (modelo: string) =>
  conRazonamientoObligatorio.has(modelo) ? RAZONAMIENTO_MINIMO : RAZONAMIENTO_APAGADO;

class RazonamientoObligatorio extends Error {}

/** Algunos modelos envuelven el JSON en ```json … ``` aunque se pida json_schema. */
function extraerJson(texto: string): unknown {
  const limpio = texto.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  return JSON.parse(limpio);
}

function errorPorStatus(status: number, detalle: string): ServiceError {
  if (status === 400 && /reasoning is mandatory/i.test(detalle)) throw new RazonamientoObligatorio(detalle);
  if (status === 429) return new ServiceError("ia_limite", 503, MENSAJES.ia_limite);
  if (status === 402) return new ServiceError("ia_sin_saldo", 503, MENSAJES.ia_sin_saldo);
  console.error(`[openrouter] error ${status}: ${detalle.slice(0, 500)}`);
  return new ServiceError("ia_error", 502, MENSAJES.ia_error);
}

async function llamarUnaVez<T>(
  pedido: Pedido<T>,
  apiKey: string,
  modelo: string,
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
        model: modelo,
        messages: [
          { role: "system", content: pedido.system },
          { role: "user", content: pedido.user },
        ],
        response_format: {
          type: "json_schema",
          json_schema: { name: pedido.schemaName, strict: true, schema: pedido.jsonSchema },
        },
        temperature: 0.2,
        reasoning: razonamientoPara(modelo),
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
 *
 * Prueba los modelos de OPENROUTER_MODELS de a uno y en orden, cada uno con su configuración
 * de razonamiento (por eso no se usa el fallback `models` de OpenRouter, que manda la misma
 * a todos y además no pasa al siguiente ante un 402 sin saldo). Ante cualquier error de un
 * modelo se pasa al siguiente; con el último se reintenta una vez si la respuesta no cumplió
 * el schema. Todo tiene que entrar en el corte de 30 s de Heroku.
 */
export async function completarEstructurado<T>(pedido: Pedido<T>): Promise<T> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const models = modelos();
  if (!apiKey || models.length === 0) {
    throw new ServiceError("ia_no_configurada", 503, MENSAJES.ia_no_configurada);
  }
  const inicio = Date.now();
  const restante = () => PRESUPUESTO_TOTAL_MS - (Date.now() - inicio);

  let ultimoError: unknown = new ServiceError("ia_error", 502, MENSAJES.ia_error);
  let reintentoUsado = false;

  for (let i = 0; i < models.length; i++) {
    const modelo = models[i];
    const esUltimo = i === models.length - 1;

    for (let intento = 0; intento < 3; intento++) {
      if (restante() < TIMEOUT_MINIMO_INTENTO_MS) throw ultimoError;
      const timeout = esUltimo ? restante() : Math.min(TIMEOUT_CON_RESPALDO_MS, restante());
      try {
        return await llamarUnaVez(pedido, apiKey, modelo, timeout);
      } catch (err) {
        if (err instanceof RazonamientoObligatorio && !conRazonamientoObligatorio.has(modelo)) {
          conRazonamientoObligatorio.add(modelo);
          continue; // mismo modelo, ahora con razonamiento mínimo
        }
        ultimoError =
          err instanceof ServiceError ? err : new ServiceError("ia_error", 502, MENSAJES.ia_error);
        const codigo = (ultimoError as ServiceError).codigo;
        if (!esUltimo) {
          console.warn(`[openrouter] ${modelo} falló (${codigo}), se prueba con ${models[i + 1]}`);
          break;
        }
        if (codigo === "ia_respuesta_invalida" && !reintentoUsado) {
          reintentoUsado = true;
          continue;
        }
        throw ultimoError;
      }
    }
  }
  throw ultimoError;
}
