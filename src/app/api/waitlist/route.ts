import { waitlistRequestSchema } from "@/lib/schemas";
import { errorResponse, ServiceError } from "@/server/services/errors";
import { getClientIp } from "@/server/services/getClientIp";
import { leerJson } from "@/server/services/leerJson";
import { limitarWaitlist } from "@/server/services/rateLimit";
import { registrarEnWaitlist } from "@/server/services/waitlist";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const datos = await leerJson(req, waitlistRequestSchema);
    const limite = limitarWaitlist(getClientIp(req));
    if (!limite.ok) {
      throw new ServiceError(
        "limite_ip",
        429,
        "Mandaste varios emails seguidos. Esperá un rato y probá de nuevo.",
        limite.retryAfterSeg,
      );
    }
    await registrarEnWaitlist(datos);
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}

