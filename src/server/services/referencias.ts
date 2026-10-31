import preciosReferencia from "@/data/precios-referencia.json";

export type Referencia = {
  id: string;
  categoria: string;
  nombre: string;
  palabrasClave: string[];
  precioReferenciaARS: number;
  muestras: number;
  actualizado: string;
  verificar: boolean;
};

export const SIN_REFERENCIA = "sin_referencia";

const referencias = preciosReferencia as Referencia[];

export function listarReferencias(): Referencia[] {
  return referencias;
}

export function buscarReferencia(id: string): Referencia | undefined {
  return referencias.find((r) => r.id === id);
}

/** Lista compacta para el prompt: el modelo elige un id de acá. */
export function referenciasParaPrompt(): string {
  return referencias
    .map((r) => `- ${r.id}: ${r.nombre} (${r.categoria}; ${r.palabrasClave.join(", ")})`)
    .join("\n");
}
