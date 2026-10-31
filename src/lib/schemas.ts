import { z } from "zod";

/* ---------- Comunes ---------- */

export const tipoResiduoSchema = z.enum(["raee", "pilas"]);
export type TipoResiduo = z.infer<typeof tipoResiduoSchema>;

export const factorSchema = z.enum(["estado", "funcionamiento", "accesorios"]);
export type Factor = z.infer<typeof factorSchema>;

/**
 * Qué condición indica cada opción. El modelo la declara al generar la pregunta
 * y el servidor la usa para elegir la banda de precio (ver pricingRules.ts).
 */
export const condicionSchema = z.enum([
  "perfecto",
  "esteticos",
  "falla_parcial",
  "no_enciende",
  "falta_accesorio",
  "sin_impacto",
  "no_se",
]);
export type Condicion = z.infer<typeof condicionSchema>;

/* ---------- Paso 2: análisis ---------- */

export const MAX_IMAGEN_BASE64 = 1_500_000; // ~1 MB de JPEG en base64

export const analizarRequestSchema = z.object({
  imagenBase64: z
    .string()
    .min(100)
    .max(MAX_IMAGEN_BASE64)
    .regex(/^[A-Za-z0-9+/=]+$/, "La imagen no está en base64"),
});
export type AnalizarRequest = z.infer<typeof analizarRequestSchema>;

export const opcionSchema = z.object({
  id: z.string().min(1).max(40),
  texto: z.string().min(1).max(60),
  condicion: condicionSchema,
});
export type Opcion = z.infer<typeof opcionSchema>;

export const preguntaSchema = z
  .object({
    id: z.string().min(1).max(40),
    texto: z.string().min(1).max(120),
    factor: factorSchema,
    opciones: z.array(opcionSchema).min(2).max(4),
  })
  .refine((p) => p.opciones.some((o) => o.condicion === "no_se"), {
    message: "Cada pregunta tiene que incluir la opción «No sé»",
  });
export type Pregunta = z.infer<typeof preguntaSchema>;

/** Daño que se ve en la foto. Cuenta como una respuesta más en las reglas de precio. */
export const estadoVisibleSchema = z.enum(["sin_danos_visibles", "esteticos", "falla_parcial", "no_se_ve"]);
export type EstadoVisible = z.infer<typeof estadoVisibleSchema>;

export const analisisSchema = z.object({
  esDispositivoElectronico: z.boolean(),
  tipoDispositivo: z.string().max(60),
  marca: z.string().max(60).nullable(),
  modelo: z.string().max(80).nullable(),
  descripcion: z.string().max(300),
  estadoVisible: estadoVisibleSchema,
  referenciaId: z.string().max(80),
  esPilaOBateria: z.boolean(),
  valorDespreciable: z.boolean(),
  preguntas: z.array(preguntaSchema).max(3),
});
export type Analisis = z.infer<typeof analisisSchema>;

/* ---------- Paso 3: estimación ---------- */

export const respuestaSchema = z.object({
  preguntaId: z.string().min(1).max(40),
  opcionId: z.string().min(1).max(40),
});
export type Respuesta = z.infer<typeof respuestaSchema>;

export const estimarRequestSchema = z.object({
  analisis: analisisSchema,
  respuestas: z.array(respuestaSchema).max(3),
});
export type EstimarRequest = z.infer<typeof estimarRequestSchema>;

export const textosEstimacionSchema = z.object({
  resumen: z.string().min(1).max(240),
  titulo: z.string().min(1).max(80),
  descripcion: z.string().min(1).max(600),
  ajustes: z.array(z.string().min(1).max(200)).max(4),
  factoresVariabilidad: z.array(z.string().min(1).max(200)).min(2).max(4),
});
export type TextosEstimacion = z.infer<typeof textosEstimacionSchema>;

export const referenciaPublicaSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  categoria: z.string(),
  precioReferenciaARS: z.number(),
  muestras: z.number(),
  actualizado: z.string(),
  verificar: z.boolean(),
});
export type ReferenciaPublica = z.infer<typeof referenciaPublicaSchema>;

export const ajusteSchema = z.object({
  pregunta: z.string(),
  respuesta: z.string(),
  efecto: z.string(),
});
export type Ajuste = z.infer<typeof ajusteSchema>;

export const borradorSchema = z.object({
  titulo: z.string(),
  descripcion: z.string(),
  categoria: z.string(),
  estado: z.string(),
});
export type Borrador = z.infer<typeof borradorSchema>;

export const estimacionSchema = z.discriminatedUnion("tipo", [
  z.object({
    tipo: z.literal("conPrecio"),
    rango: z.object({ minARS: z.number(), maxARS: z.number() }),
    resumen: z.string(),
    borrador: borradorSchema,
    referencia: referenciaPublicaSchema,
    ajustes: z.array(ajusteSchema),
    explicacionAjustes: z.array(z.string()),
    factoresVariabilidad: z.array(z.string()),
  }),
  z.object({
    tipo: z.literal("sinReferencia"),
    resumen: z.string(),
    borrador: borradorSchema,
    factoresVariabilidad: z.array(z.string()),
  }),
  z.object({
    tipo: z.literal("sinValor"),
    resumen: z.string(),
    motivo: z.string(),
    tipoResiduo: tipoResiduoSchema,
  }),
]);
export type Estimacion = z.infer<typeof estimacionSchema>;

/* ---------- Waitlist ---------- */

export const origenSchema = z.enum(["hero", "tasador", "cierre"]);
export type Origen = z.infer<typeof origenSchema>;

export const waitlistRequestSchema = z.object({
  email: z.email("Revisá el email").max(200),
  origen: origenSchema,
  dispositivo: z.string().max(120).optional(),
  rango: z.string().max(60).optional(),
  /** Precio que la persona eligió para publicar, en ARS. */
  precioARS: z
    .number("Revisá el precio")
    .int("El precio tiene que ser un número entero")
    .min(0, "El precio no puede ser negativo")
    .max(100_000_000, "Revisá el precio: es demasiado alto")
    .optional(),
  acepta: z.literal(true).optional(),
});
export type WaitlistRequest = z.infer<typeof waitlistRequestSchema>;

/* ---------- Errores de la API ---------- */

export const codigoErrorSchema = z.enum([
  "entrada_invalida",
  "no_es_dispositivo",
  "limite_ip",
  "limite_diario",
  "ia_limite",
  "ia_sin_saldo",
  "ia_timeout",
  "ia_respuesta_invalida",
  "ia_no_configurada",
  "ia_error",
  "webhook_error",
  "interno",
]);
export type CodigoError = z.infer<typeof codigoErrorSchema>;

export type ApiErrorBody = { error: { codigo: CodigoError; mensaje: string } };
