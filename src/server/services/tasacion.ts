import "server-only";
import {
  analisisSchema,
  textosEstimacionSchema,
  type Analisis,
  type Estimacion,
  type EstimarRequest,
} from "@/lib/schemas";
import { MENSAJES, ServiceError } from "./errors";
import { completarEstructurado } from "./openrouter";
import { calcularRango, etiquetaBanda, resolverRespuestas } from "./pricingRules";
import { jsonSchemaAnalisis, jsonSchemaTextos, systemAnalizar, systemEstimar, userAnalizar } from "./prompts";
import { buscarReferencia, SIN_REFERENCIA } from "./referencias";

export async function analizarImagen(imagenBase64: string): Promise<Analisis> {
  const analisis = await completarEstructurado({
    system: systemAnalizar(),
    user: [
      { type: "text", text: userAnalizar },
      { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imagenBase64}` } },
    ],
    schemaName: "analisis_dispositivo",
    jsonSchema: jsonSchemaAnalisis,
    zodSchema: analisisSchema,
  });

  if (!analisis.esDispositivoElectronico) {
    throw new ServiceError("no_es_dispositivo", 422, MENSAJES.no_es_dispositivo);
  }
  if (!analisis.esPilaOBateria && analisis.preguntas.length < 2) {
    throw new ServiceError("ia_respuesta_invalida", 502, MENSAJES.ia_respuesta_invalida);
  }
  // Si el modelo devolvió un id que no está en la tabla, se trata como sin referencia.
  if (analisis.referenciaId !== SIN_REFERENCIA && !buscarReferencia(analisis.referenciaId)) {
    analisis.referenciaId = SIN_REFERENCIA;
  }
  return analisis;
}

const fmt = (n: number) => `$${n.toLocaleString("es-AR")}`;

export async function estimarPrecio({ analisis, respuestas }: EstimarRequest): Promise<Estimacion> {
  const referencia = buscarReferencia(analisis.referenciaId);
  const resueltas = resolverRespuestas(analisis, respuestas);
  const reglas = calcularRango(analisis, resueltas, referencia);

  if (reglas.tipo === "sinValor") {
    // No hace falta gastar una llamada a la IA para esto.
    return {
      tipo: "sinValor",
      resumen:
        reglas.tipoResiduo === "pilas"
          ? "Las pilas y baterías no se venden, pero sí tienen que reciclarse bien."
          : "Esto no tiene valor de reventa, pero no va a la basura común.",
      motivo: reglas.motivo,
      tipoResiduo: reglas.tipoResiduo,
    };
  }

  const dispositivo = [analisis.tipoDispositivo, analisis.marca, analisis.modelo].filter(Boolean).join(" ");
  const datos = {
    dispositivo,
    descripcionDeLaFoto: analisis.descripcion,
    estadoGeneral: etiquetaBanda(reglas.banda),
    respuestas: resueltas.map((r) => `${r.pregunta} → ${r.respuesta}`),
    ajustes: reglas.ajustes.map((a) => `${a.respuesta}: ${a.efecto}`),
    ...(reglas.tipo === "conPrecio"
      ? {
          referenciaUsada: referencia?.nombre,
          rangoCalculado: `${fmt(reglas.minARS)} a ${fmt(reglas.maxARS)}`,
        }
      : { rangoCalculado: "No hay precio de referencia para este dispositivo; no menciones montos." }),
  };

  const textos = await completarEstructurado({
    system: systemEstimar(),
    user: JSON.stringify(datos, null, 2),
    schemaName: "textos_tasacion",
    jsonSchema: jsonSchemaTextos,
    zodSchema: textosEstimacionSchema,
  });

  const borrador = {
    titulo: textos.titulo,
    descripcion: textos.descripcion,
    categoria: referencia?.categoria ?? analisis.tipoDispositivo,
    estado: etiquetaBanda(reglas.banda),
  };

  if (reglas.tipo === "sinReferencia" || !referencia) {
    return {
      tipo: "sinReferencia",
      resumen: textos.resumen,
      borrador,
      factoresVariabilidad: textos.factoresVariabilidad,
    };
  }

  return {
    tipo: "conPrecio",
    rango: { minARS: reglas.minARS, maxARS: reglas.maxARS },
    resumen: textos.resumen,
    borrador,
    referencia: {
      id: referencia.id,
      nombre: referencia.nombre,
      categoria: referencia.categoria,
      precioReferenciaARS: referencia.precioReferenciaARS,
      muestras: referencia.muestras,
      actualizado: referencia.actualizado,
      verificar: referencia.verificar,
    },
    ajustes: reglas.ajustes,
    explicacionAjustes: textos.ajustes,
    factoresVariabilidad: textos.factoresVariabilidad,
  };
}
