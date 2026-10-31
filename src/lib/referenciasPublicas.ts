import preciosReferencia from "@/data/precios-referencia.json";

type Entrada = (typeof preciosReferencia)[number];

/** Solo las referencias con datos verificados (no los valores de ejemplo). */
export function referenciasVerificadas(): Entrada[] {
  return preciosReferencia.filter((r) => !r.verificar && r.muestras > 0);
}

/** Precio de referencia más bajo verificado de una categoría, o null si no hay. */
export function desdePorCategoria(categoria: string): number | null {
  const precios = referenciasVerificadas()
    .filter((r) => r.categoria === categoria)
    .map((r) => r.precioReferenciaARS);
  return precios.length ? Math.min(...precios) : null;
}

/** Fecha más reciente entre las referencias verificadas, como "octubre de 2026". */
export function mesActualizacion(): string | null {
  const fechas = referenciasVerificadas().map((r) => r.actualizado).sort();
  const ultima = fechas.at(-1);
  if (!ultima) return null;
  const [a, m] = ultima.split("-").map(Number);
  return new Date(a, m - 1, 1).toLocaleDateString("es-AR", { month: "long", year: "numeric" });
}

export function formatoPesos(n: number): string {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);
}
