import { analizarRequestSchema, analisisSchema } from "@/lib/schemas";
import { errorDeLimite, errorResponse } from "@/server/services/errors";
import { getClientIp } from "@/server/services/getClientIp";
import { leerJson } from "@/server/services/leerJson";
import { limitarTasacion } from "@/server/services/rateLimit";
import { analizarImagen } from "@/server/services/tasacion";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { imagenBase64 } = await leerJson(req, analizarRequestSchema);
    const limite = limitarTasacion(getClientIp(req), "analizar");
    if (!limite.ok) throw errorDeLimite(limite.alcance, limite.retryAfterSeg);

    const analisis = await analizarImagen(imagenBase64);
    return Response.json(analisisSchema.parse(analisis));
  } catch (err) {
    return errorResponse(err);
  }
}
