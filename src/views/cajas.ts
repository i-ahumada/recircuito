import type { Caja } from "./Recorte";

/** Recortes de cada imagen (zona con contenido, medida sobre public/img). */
export const CAJAS = {
  hero: [47, 7, 100, 100],
  cierre: [46, 12, 100, 100],
  impacto: [0, 10, 74, 100],
  compradores: [5, 11, 100, 100],
  paso1: [23.5, 9.5, 99.5, 85.5],
  paso2: [12, 12, 88, 88],
  paso3: [8, 10, 84, 86],
  categoria: [9, 5, 91, 93],
  gracias: [26, 28, 74, 76],
} as const satisfies Record<string, Caja>;
