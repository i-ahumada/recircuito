/**
 * Limitador en memoria con ventana deslizante. Alcanza porque Heroku corre un
 * solo dyno: si se escala a más de uno, cada dyno lleva su propia cuenta.
 */

const HORA_MS = 60 * 60 * 1000;
const DIA_MS = 24 * HORA_MS;

function entero(valor: string | undefined, porDefecto: number): number {
  const n = Number.parseInt(valor ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : porDefecto;
}

export const LIMITES = {
  tasacionesPorHoraIp: entero(process.env.TASACIONES_POR_HORA_IP, 5),
  tasacionesPorDia: entero(process.env.DAILY_TASACIONES_LIMIT, 20),
  waitlistPorHoraIp: 5,
};

type Resultado = { ok: true } | { ok: false; retryAfterSeg: number };

const buckets = new Map<string, number[]>();

function consumir(clave: string, limite: number, ventanaMs: number): Resultado {
  const ahora = Date.now();
  const vigentes = (buckets.get(clave) ?? []).filter((t) => ahora - t < ventanaMs);
  if (vigentes.length >= limite) {
    buckets.set(clave, vigentes);
    const retryAfterMs = ventanaMs - (ahora - vigentes[0]);
    return { ok: false, retryAfterSeg: Math.max(1, Math.ceil(retryAfterMs / 1000)) };
  }
  vigentes.push(ahora);
  buckets.set(clave, vigentes);
  return { ok: true };
}

/** Primero chequea el tope global y después el de IP, para no gastar cupo de IP si ya no hay global. */
export function limitarTasacion(
  ip: string,
  paso: "analizar" | "estimar",
): (Resultado & { alcance?: "ip" | "diario" }) {
  // Cada tasación usa un análisis y una estimación; se cuentan por separado para
  // que no se pueda llamar a /estimar en loop sin pasar por /analizar.
  const diario = consumir(`dia:${paso}`, LIMITES.tasacionesPorDia, DIA_MS);
  if (!diario.ok) return { ...diario, alcance: "diario" };
  const porIp = consumir(`ip:${paso}:${ip}`, LIMITES.tasacionesPorHoraIp, HORA_MS);
  if (!porIp.ok) {
    devolver(`dia:${paso}`);
    return { ...porIp, alcance: "ip" };
  }
  return { ok: true };
}

export function limitarWaitlist(ip: string): Resultado {
  return consumir(`waitlist:${ip}`, LIMITES.waitlistPorHoraIp, HORA_MS);
}

function devolver(clave: string) {
  buckets.get(clave)?.pop();
}

// Limpieza periódica para que el Map no crezca sin límite.
const limpieza = setInterval(() => {
  const ahora = Date.now();
  for (const [clave, tiempos] of buckets) {
    const vigentes = tiempos.filter((t) => ahora - t < DIA_MS);
    if (vigentes.length === 0) buckets.delete(clave);
    else buckets.set(clave, vigentes);
  }
}, HORA_MS);
limpieza.unref?.();
