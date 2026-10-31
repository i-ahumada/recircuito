import "server-only";
import { appendFile, mkdir, stat } from "node:fs/promises";
import path from "node:path";
import type { WaitlistRequest } from "@/lib/schemas";
import { MENSAJES, ServiceError } from "./errors";

const TIMEOUT_MS = 10_000;
/** Mismo orden de columnas que la hoja de cálculo del Apps Script. */
const COLUMNAS = ["fecha", "email", "origen", "dispositivo", "rango", "precio"] as const;

type Fila = Record<(typeof COLUMNAS)[number], string>;

function rutaCsv() {
  return path.resolve(process.cwd(), process.env.WAITLIST_CSV_PATH || "data/waitlist.csv");
}

/** Escapa para CSV y evita que Excel o Sheets interpreten el texto como fórmula. */
function celda(valor: string) {
  const seguro = /^[=+\-@\t\r]/.test(valor) ? `'${valor}` : valor;
  return /[",\r\n]/.test(seguro) ? `"${seguro.replace(/"/g, '""')}"` : seguro;
}

async function guardarEnCsv(fila: Fila) {
  const ruta = rutaCsv();
  await mkdir(path.dirname(ruta), { recursive: true });
  const existe = await stat(ruta).then(
    () => true,
    () => false,
  );
  const linea = COLUMNAS.map((c) => celda(fila[c])).join(",") + "\n";
  await appendFile(ruta, (existe ? "" : COLUMNAS.join(",") + "\n") + linea, "utf8");
}

async function enviarAlWebhook(url: string, fila: Fila) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fila),
    redirect: "follow", // Apps Script responde con un 302 a googleusercontent.com
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  // Apps Script contesta 200 aunque falle adentro: el detalle viene en el body.
  const cuerpo = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
  if (cuerpo?.ok !== true) throw new Error(cuerpo?.error ?? "respuesta inesperada del Apps Script");
}

/**
 * Manda la inscripción al Apps Script que escribe en la hoja de cálculo.
 * Sin WAITLIST_WEBHOOK_URL, o si el webhook falla, la guarda en un CSV en el servidor
 * (WAITLIST_CSV_PATH, por defecto data/waitlist.csv) para no perderla.
 */
export async function registrarEnWaitlist(datos: WaitlistRequest): Promise<void> {
  const fila: Fila = {
    fecha: new Date().toISOString(),
    email: datos.email,
    origen: datos.origen,
    dispositivo: datos.dispositivo ?? "",
    rango: datos.rango ?? "",
    precio: datos.precioARS !== undefined ? String(datos.precioARS) : "",
  };

  const url = process.env.WAITLIST_WEBHOOK_URL;
  if (url) {
    try {
      await enviarAlWebhook(url, fila);
      return;
    } catch (err) {
      console.error("[waitlist] falló el webhook, se guarda en el CSV", err);
    }
  }

  try {
    await guardarEnCsv(fila);
  } catch (err) {
    console.error("[waitlist] no se pudo escribir el CSV", err);
    throw new ServiceError("webhook_error", 502, MENSAJES.webhook_error);
  }
}
