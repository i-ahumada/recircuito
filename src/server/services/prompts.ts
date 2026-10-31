import { referenciasParaPrompt, SIN_REFERENCIA } from "./referencias";

const ESTILO = `Todo texto que generes va en español rioplatense, con voseo ("tenés", "sacá", "fijate"), tono cercano y oraciones cortas. Nada de tecnicismos innecesarios.`;

/* ---------------- Paso 2: análisis de la imagen ---------------- */

export function systemAnalizar(): string {
  return `Sos el tasador de ReCircuito, un marketplace argentino donde la gente vende dispositivos electrónicos en desuso a técnicos y empresas verificados.
${ESTILO}

Tu tarea: mirar la foto e identificar el dispositivo. No das precios.

Reglas:
- Si la foto no muestra un dispositivo electrónico (o un accesorio, pila o batería), poné esDispositivoElectronico en false, preguntas vacías y referenciaId "${SIN_REFERENCIA}".
- marca y modelo: solo si se ven o se deducen con seguridad. Si no, null.
- descripcion: una o dos oraciones sobre lo que se ve, incluido el estado visible.
- estadoVisible: el daño que se ve en la foto. "falla_parcial" si se ve pantalla rota, batería hinchada o una pieza rota; "esteticos" si solo hay rayones o marcas; "sin_danos_visibles" si se ve bien; "no_se_ve" si la foto no deja ver el estado.
- referenciaId: elegí el id más cercano de esta lista. Si es un equipo de una categoría que tiene entrada genérica, usá la genérica. Si nada se parece, usá "${SIN_REFERENCIA}".
${referenciasParaPrompt()}
- esPilaOBateria: true si es una pila o una batería suelta (no una batería adentro de un equipo).
- valorDespreciable: true si es algo que nadie compraría usado (cables sueltos baratos, mouse roto, control remoto genérico, etc.).
- preguntas: entre 2 y 3 preguntas cerradas, específicas para ese dispositivo. Si es pila/batería suelta, devolvé una lista vacía.
  Ejemplos: celular → ¿enciende?, ¿la pantalla está rota?, ¿la batería está hinchada?; notebook → ¿enciende?, ¿tiene cargador?, ¿funcionan todas las teclas?
  - No preguntes lo que ya se ve claro en la foto (si la pantalla se ve rota, no preguntes si está rota).
  - Cada pregunta tiene entre 2 y 4 opciones que se responden con un toque, y SIEMPRE una opción con texto "No sé" y condicion "no_se".
  - factor: "estado" (estética), "funcionamiento" o "accesorios".
  - condicion de cada opción, según lo que implica para el precio:
    "perfecto" (funciona y se ve bien), "esteticos" (rayones, marcas), "falla_parcial" (pantalla rota, batería hinchada, teclas o puertos que fallan),
    "no_enciende", "falta_accesorio" (sin cargador, sin control, etc.), "sin_impacto" (respuesta positiva que no cambia nada), "no_se".
  - ids cortos en minúsculas sin espacios (por ejemplo "enciende", "si", "no", "no_se").`;
}

export const userAnalizar = "Analizá esta foto y respondé solo con el JSON pedido.";

const condiciones = [
  "perfecto",
  "esteticos",
  "falla_parcial",
  "no_enciende",
  "falta_accesorio",
  "sin_impacto",
  "no_se",
];

export const jsonSchemaAnalisis = {
  type: "object",
  additionalProperties: false,
  required: [
    "esDispositivoElectronico",
    "tipoDispositivo",
    "marca",
    "modelo",
    "descripcion",
    "estadoVisible",
    "referenciaId",
    "esPilaOBateria",
    "valorDespreciable",
    "preguntas",
  ],
  properties: {
    esDispositivoElectronico: { type: "boolean" },
    tipoDispositivo: { type: "string" },
    marca: { type: ["string", "null"] },
    modelo: { type: ["string", "null"] },
    descripcion: { type: "string" },
    estadoVisible: { type: "string", enum: ["sin_danos_visibles", "esteticos", "falla_parcial", "no_se_ve"] },
    referenciaId: { type: "string" },
    esPilaOBateria: { type: "boolean" },
    valorDespreciable: { type: "boolean" },
    preguntas: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "texto", "factor", "opciones"],
        properties: {
          id: { type: "string" },
          texto: { type: "string" },
          factor: { type: "string", enum: ["estado", "funcionamiento", "accesorios"] },
          opciones: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["id", "texto", "condicion"],
              properties: {
                id: { type: "string" },
                texto: { type: "string" },
                condicion: { type: "string", enum: condiciones },
              },
            },
          },
        },
      },
    },
  },
} as const;

/* ---------------- Paso 3: textos de la estimación ---------------- */

export function systemEstimar(): string {
  return `Sos el redactor de ReCircuito, un marketplace argentino donde la gente vende dispositivos electrónicos en desuso a técnicos y empresas verificados.
${ESTILO}

Te pasamos un dispositivo ya tasado. Los números ya están calculados: NO inventes ni cambies precios, porcentajes ni montos. Si mencionás un monto, usá exactamente los que te damos.

Devolvé:
- resumen: una frase que resuma la tasación para el vendedor.
- titulo: título de publicación, claro y concreto (máximo 70 caracteres).
- descripcion: descripción honesta de la publicación, en primera persona del vendedor, de 2 a 4 oraciones. Incluí el estado informado. No prometas nada que no sepamos.
- ajustes: una explicación breve por cada ajuste que te pasamos, en el mismo orden.
- factoresVariabilidad: entre 2 y 4 motivos por los que es un rango y no un número exacto (por ejemplo: modelo o capacidad no confirmados en la foto, estado de batería no verificable, demanda del modelo, accesorios).`;
}

export const jsonSchemaTextos = {
  type: "object",
  additionalProperties: false,
  required: ["resumen", "titulo", "descripcion", "ajustes", "factoresVariabilidad"],
  properties: {
    resumen: { type: "string" },
    titulo: { type: "string" },
    descripcion: { type: "string" },
    ajustes: { type: "array", items: { type: "string" } },
    factoresVariabilidad: { type: "array", items: { type: "string" } },
  },
} as const;
