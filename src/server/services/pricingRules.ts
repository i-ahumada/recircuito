import type { Ajuste, Analisis, Condicion, EstadoVisible, Respuesta, TipoResiduo } from "@/lib/schemas";
import type { Referencia } from "./referencias";

/* ------------------------------------------------------------------
 * Reglas de precio. Editá estos valores para ajustar la tasación.
 * Todos los porcentajes son sobre el precio de referencia (equipo usado
 * y funcionando).
 * ------------------------------------------------------------------ */

export const BANDAS = {
  perfecto: { min: 0.8, max: 1.0, etiqueta: "Funciona perfecto" },
  esteticos: { min: 0.6, max: 0.8, etiqueta: "Detalles estéticos" },
  falla_parcial: { min: 0.3, max: 0.45, etiqueta: "Pantalla rota o falla parcial" },
  no_enciende: { min: 0.1, max: 0.2, etiqueta: "No enciende (valor de repuestos)" },
} as const;

/** Cada respuesta "No sé" baja el mínimo en estos puntos (amplía el rango, no lo corre). */
export const AMPLIACION_POR_NO_SE = 0.1;
/** El mínimo nunca baja de acá, aunque haya varios "No sé". */
export const PISO_MINIMO = BANDAS.no_enciende.min;
/** Si falta un accesorio (por ejemplo, el cargador), se restan estos puntos a ambos extremos. */
export const DESCUENTO_FALTA_ACCESORIO = 0.05;
/** Por debajo de este máximo en pesos, se considera sin valor de reventa. */
export const UMBRAL_SIN_VALOR_ARS = 5000;
/** Redondeo de los montos mostrados. */
export const REDONDEO_ARS = 1000;

/* ------------------------------------------------------------------ */

type Banda = keyof typeof BANDAS;
const ORDEN_GRAVEDAD: Banda[] = ["perfecto", "esteticos", "falla_parcial", "no_enciende"];

const pct = (n: number) => `${Math.round(n * 100)}%`;

export type ResultadoReglas =
  | {
      tipo: "conPrecio";
      minARS: number;
      maxARS: number;
      banda: Banda;
      ajustes: Ajuste[];
    }
  | { tipo: "sinValor"; tipoResiduo: TipoResiduo; motivo: string }
  | { tipo: "sinReferencia"; banda: Banda; ajustes: Ajuste[] };

type RespuestaResuelta = { pregunta: string; respuesta: string; condicion: Condicion };

const CONDICION_VISIBLE: Record<EstadoVisible, { condicion: Condicion; texto: string } | null> = {
  falla_parcial: { condicion: "falla_parcial", texto: "Se ve un daño importante" },
  esteticos: { condicion: "esteticos", texto: "Se ven rayones o marcas" },
  sin_danos_visibles: null,
  no_se_ve: null,
};

/**
 * Une cada respuesta con su pregunta y opción (ignora ids que no existan) y suma
 * el daño visible en la foto como un ajuste más.
 */
export function resolverRespuestas(analisis: Analisis, respuestas: Respuesta[]): RespuestaResuelta[] {
  const visible = CONDICION_VISIBLE[analisis.estadoVisible];
  const desdeFoto: RespuestaResuelta[] = visible
    ? [{ pregunta: "Lo que se ve en la foto", respuesta: visible.texto, condicion: visible.condicion }]
    : [];
  return [...desdeFoto, ...respuestas.flatMap((r) => {
    const pregunta = analisis.preguntas.find((p) => p.id === r.preguntaId);
    const opcion = pregunta?.opciones.find((o) => o.id === r.opcionId);
    if (!pregunta || !opcion) return [];
    return [{ pregunta: pregunta.texto, respuesta: opcion.texto, condicion: opcion.condicion }];
  })];
}

function redondear(n: number) {
  return Math.round(n / REDONDEO_ARS) * REDONDEO_ARS;
}

export function calcularRango(
  analisis: Analisis,
  respuestas: RespuestaResuelta[],
  referencia: Referencia | undefined,
): ResultadoReglas {
  if (analisis.esPilaOBateria || referencia?.categoria === "pilas") {
    return {
      tipo: "sinValor",
      tipoResiduo: "pilas",
      motivo:
        "Las pilas y baterías sueltas no se revenden. Contienen materiales que contaminan, así que tienen que ir a un punto de recolección.",
    };
  }

  // La peor condición informada define la banda. Si nada dice lo contrario, se asume que funciona.
  let banda: Banda = "perfecto";
  for (const r of respuestas) {
    if (r.condicion in BANDAS) {
      const c = r.condicion as Banda;
      if (ORDEN_GRAVEDAD.indexOf(c) > ORDEN_GRAVEDAD.indexOf(banda)) banda = c;
    }
  }

  let min: number = BANDAS[banda].min;
  let max: number = BANDAS[banda].max;
  const ajustes: Ajuste[] = [];

  for (const r of respuestas) {
    if (r.condicion in BANDAS) {
      const b = BANDAS[r.condicion as Banda];
      ajustes.push({
        pregunta: r.pregunta,
        respuesta: r.respuesta,
        efecto:
          r.condicion === banda
            ? `${b.etiqueta}: entre ${pct(b.min)} y ${pct(b.max)} del valor de referencia`
            : `${b.etiqueta}: no cambia el rango, pesa más otra respuesta`,
      });
    } else if (r.condicion === "falta_accesorio") {
      min -= DESCUENTO_FALTA_ACCESORIO;
      max -= DESCUENTO_FALTA_ACCESORIO;
      ajustes.push({
        pregunta: r.pregunta,
        respuesta: r.respuesta,
        efecto: `Falta un accesorio: resta ${pct(DESCUENTO_FALTA_ACCESORIO)} en ambos extremos`,
      });
    } else if (r.condicion === "no_se") {
      min -= AMPLIACION_POR_NO_SE;
      ajustes.push({
        pregunta: r.pregunta,
        respuesta: r.respuesta,
        efecto: `No lo sabés: el mínimo baja ${pct(AMPLIACION_POR_NO_SE)} para cubrir esa duda, el máximo queda igual`,
      });
    } else {
      ajustes.push({ pregunta: r.pregunta, respuesta: r.respuesta, efecto: "No cambia el precio" });
    }
  }

  min = Math.max(PISO_MINIMO, min);
  max = Math.max(min, max);

  if (!referencia) {
    if (analisis.valorDespreciable) {
      return {
        tipo: "sinValor",
        tipoResiduo: "raee",
        motivo:
          "No encontramos un valor de reventa para este objeto. Lo mejor es llevarlo a un punto de reciclaje de electrónicos.",
      };
    }
    return { tipo: "sinReferencia", banda, ajustes };
  }

  const minARS = redondear(referencia.precioReferenciaARS * min);
  const maxARS = redondear(referencia.precioReferenciaARS * max);

  if (maxARS < UMBRAL_SIN_VALOR_ARS) {
    return {
      tipo: "sinValor",
      tipoResiduo: "raee",
      motivo: `Aun en el mejor caso vale menos de $${UMBRAL_SIN_VALOR_ARS.toLocaleString("es-AR")}, así que no conviene publicarlo. Llevalo a un punto de reciclaje de electrónicos.`,
    };
  }

  return { tipo: "conPrecio", minARS, maxARS, banda, ajustes };
}

export function etiquetaBanda(banda: Banda): string {
  return BANDAS[banda].etiqueta;
}
