const ars = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });

export function formatoARS(n: number): string {
  return ars.format(n);
}

export function formatoRango(min: number, max: number): string {
  return `${formatoARS(min)} – ${formatoARS(max)}`;
}

export function formatoFecha(iso: string): string {
  const [a, m, d] = iso.split("-").map(Number);
  if (!a || !m || !d) return iso;
  return new Date(a, m - 1, d).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" });
}
