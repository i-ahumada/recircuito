"use client";

import { useEffect, useState } from "react";
import type { Analisis, Estimacion, Respuesta } from "@/lib/schemas";
import { ApiError } from "@/services/apiClient";
import { analizarImagen, estimarPrecio } from "@/services/tasacionService";

export type EstadoTasacion =
  | { paso: "imagen" }
  | { paso: "analizando" }
  | { paso: "preguntas"; analisis: Analisis; respuestas: Record<string, string> }
  | { paso: "estimando"; analisis: Analisis }
  | { paso: "resultado"; analisis: Analisis; estimacion: Estimacion }
  | { paso: "error"; error: ApiError; analisis?: Analisis; respuestas?: Record<string, string> };

const MENSAJES_PROGRESO = {
  analizando: ["Mirando la foto…", "Identificando el dispositivo…", "Armando un par de preguntas…"],
  estimando: ["Buscando el precio de referencia…", "Calculando el rango…", "Redactando tu publicación…"],
};

const INTERVALO_PROGRESO_MS = 2500;

function aApiError(err: unknown): ApiError {
  return err instanceof ApiError ? err : new ApiError("interno", "Algo salió mal. Probá de nuevo.");
}

export function useTasacion() {
  const [estado, setEstado] = useState<EstadoTasacion>({ paso: "imagen" });
  const [indiceProgreso, setIndiceProgreso] = useState(0);

  const cargando = estado.paso === "analizando" || estado.paso === "estimando";

  useEffect(() => {
    if (!cargando) return;
    const id = setInterval(() => setIndiceProgreso((i) => i + 1), INTERVALO_PROGRESO_MS);
    return () => {
      clearInterval(id);
      setIndiceProgreso(0);
    };
  }, [cargando]);

  const mensajeProgreso = cargando
    ? MENSAJES_PROGRESO[estado.paso][Math.min(indiceProgreso, MENSAJES_PROGRESO[estado.paso].length - 1)]
    : null;

  async function estimar(analisis: Analisis, respuestasMap: Record<string, string>) {
    setEstado({ paso: "estimando", analisis });
    const respuestas: Respuesta[] = Object.entries(respuestasMap).map(([preguntaId, opcionId]) => ({
      preguntaId,
      opcionId,
    }));
    try {
      const estimacion = await estimarPrecio(analisis, respuestas);
      setEstado({ paso: "resultado", analisis, estimacion });
    } catch (err) {
      setEstado({ paso: "error", error: aApiError(err), analisis, respuestas: respuestasMap });
    }
  }

  async function analizar(imagenBase64: string) {
    setEstado({ paso: "analizando" });
    try {
      const analisis = await analizarImagen(imagenBase64);
      if (analisis.preguntas.length === 0) {
        await estimar(analisis, {});
      } else {
        setEstado({ paso: "preguntas", analisis, respuestas: {} });
      }
    } catch (err) {
      setEstado({ paso: "error", error: aApiError(err) });
    }
  }

  function responder(preguntaId: string, opcionId: string) {
    setEstado((e) =>
      e.paso === "preguntas" ? { ...e, respuestas: { ...e.respuestas, [preguntaId]: opcionId } } : e,
    );
  }

  /** Después de un error en la estimación, vuelve a las preguntas sin perder el análisis. */
  function reintentar() {
    if (estado.paso !== "error") return;
    if (estado.analisis) {
      setEstado({ paso: "preguntas", analisis: estado.analisis, respuestas: estado.respuestas ?? {} });
    } else {
      setEstado({ paso: "imagen" });
    }
  }

  function reiniciar() {
    setEstado({ paso: "imagen" });
  }

  return { estado, mensajeProgreso, analizar, responder, estimar, reintentar, reiniciar };
}
