import type { Analisis, Estimacion, Respuesta } from "@/lib/schemas";
import { postJson } from "./apiClient";

export function analizarImagen(imagenBase64: string): Promise<Analisis> {
  return postJson<Analisis>("/api/tasacion/analizar", { imagenBase64 });
}

export function estimarPrecio(analisis: Analisis, respuestas: Respuesta[]): Promise<Estimacion> {
  return postJson<Estimacion>("/api/tasacion/estimar", { analisis, respuestas });
}
