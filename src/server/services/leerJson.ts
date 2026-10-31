import type { z } from "zod";
import { MENSAJES, ServiceError } from "./errors";

/** Lee el body y lo valida con zod. Cualquier problema es un 400 con mensaje amigable. */
export async function leerJson<T>(req: Request, schema: z.ZodType<T>): Promise<T> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ServiceError("entrada_invalida", 400, MENSAJES.entrada_invalida);
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const primero = parsed.error.issues[0]?.message;
    throw new ServiceError("entrada_invalida", 400, primero && !primero.startsWith("Invalid") ? primero : MENSAJES.entrada_invalida);
  }
  return parsed.data;
}
