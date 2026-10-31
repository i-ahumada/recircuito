import { estimacionSchema, estimarRequestSchema } from "@/lib/schemas";
import { errorDeLimite, errorResponse } from "@/server/services/errors";
import { getClientIp } from "@/server/services/getClientIp";
import { leerJson } from "@/server/services/leerJson";
import { limitarTasacion } from "@/server/services/rateLimit";
import { estimarPrecio } from "@/server/services/tasacion";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const datos = await leerJson(req, estimarRequestSchema);
    const limite = limitarTasacion(getClientIp(req), "estimar");
    if (!limite.ok) throw errorDeLimite(limite.alcance, limite.retryAfterSeg);

    const estimacion = await estimarPrecio(datos);
    return Response.json(estimacionSchema.parse(estimacion));
  } catch (err) {
    return errorResponse(err);
  }
}
