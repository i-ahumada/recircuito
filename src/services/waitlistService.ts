import type { WaitlistRequest } from "@/lib/schemas";
import { postJson } from "./apiClient";

export function sumarseAWaitlist(datos: WaitlistRequest): Promise<{ ok: true }> {
  return postJson<{ ok: true }>("/api/waitlist", datos);
}
