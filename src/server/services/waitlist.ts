import "server-only";
import type { WaitlistRequest } from "@/lib/schemas";
import { MENSAJES, ServiceError } from "./errors";

const TIMEOUT_MS = 10_000;

/**
 * Reenvía la inscripción al Apps Script que escribe en la hoja de cálculo.
 * Sin WAITLIST_WEBHOOK_URL no falla: lo deja en la consola para poder probar el formulario.
 */
export async function registrarEnWaitlist(datos: WaitlistRequest): Promise<void> {
  const payload = {
    email: datos.email,
    origen: datos.origen,
    dispositivo: datos.dispositivo ?? "",
    rango: datos.rango ?? "",
    fecha: new Date().toISOString(),
  };

  const url = process.env.WAITLIST_WEBHOOK_URL;
  if (!url) {
    console.warn("[waitlist] WAITLIST_WEBHOOK_URL vacía: no se guarda, solo se registra acá.", payload);
    return;
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      redirect: "follow", // Apps Script responde con un 302 a googleusercontent.com
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (err) {
    console.error("[waitlist] falló el webhook", err);
    throw new ServiceError("webhook_error", 502, MENSAJES.webhook_error);
  }
}
