"use client";

import { useEffect, useRef } from "react";
import { EVENTO_TASADO } from "../Hilo";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useTasacion } from "@/hooks/useTasacion";
import { WaitlistForm } from "../WaitlistForm";
import { PasoImagen } from "./PasoImagen";
import { PasoPreguntas } from "./PasoPreguntas";
import { Progreso } from "./Progreso";
import { Resultado } from "./Resultado";
import styles from "./Tasador.module.css";

const PASOS = ["Foto", "Preguntas", "Resultado"];

export function Tasador() {
  const imagen = useImageUpload();
  const tasacion = useTasacion();
  const { estado } = tasacion;
  const panelRef = useRef<HTMLDivElement>(null);

  const pasoActual =
    estado.paso === "imagen" || estado.paso === "analizando"
      ? 0
      : estado.paso === "preguntas" || estado.paso === "estimando"
        ? 1
        : estado.paso === "resultado"
          ? 2
          : estado.analisis
            ? 1
            : 0;

  // Al cambiar de paso, el foco va al panel para que los lectores de pantalla anuncien el contenido nuevo.
  const pasoAnterior = useRef(estado.paso);
  useEffect(() => {
    if (pasoAnterior.current !== estado.paso && estado.paso !== "analizando" && estado.paso !== "estimando") {
      panelRef.current?.focus({ preventScroll: true });
    }
    // El cierre visual de la página: el hilo se completa y el brote final pulsa.
    if (pasoAnterior.current !== "resultado" && estado.paso === "resultado") {
      window.dispatchEvent(new Event(EVENTO_TASADO));
    }
    pasoAnterior.current = estado.paso;
  }, [estado.paso]);

  function tasarOtro() {
    imagen.reiniciar();
    tasacion.reiniciar();
  }

  const previewUrl = imagen.estado.tipo === "lista" ? imagen.estado.previewUrl : null;

  return (
    <div className={styles.card}>
      <ol className={styles.stepper} aria-label="Pasos de la tasación">
        {PASOS.map((nombre, i) => (
          <li key={nombre} data-estado={i < pasoActual ? "hecho" : i === pasoActual ? "actual" : "pendiente"}>
            <span className={styles.stepNum} aria-hidden="true">
              {i + 1}
            </span>
            <span>{nombre}</span>
            {i === pasoActual && <span className="visuallyHidden"> (paso actual)</span>}
          </li>
        ))}
      </ol>

      <div ref={panelRef} tabIndex={-1} className={styles.panel}>
        {estado.paso === "imagen" && (
          <PasoImagen
            estado={imagen.estado}
            onArchivo={imagen.cargar}
            onCambiar={imagen.reiniciar}
            onTasar={(b64) => void tasacion.analizar(b64)}
          />
        )}

        {(estado.paso === "analizando" || estado.paso === "estimando") && (
          <Progreso mensaje={tasacion.mensajeProgreso ?? "Procesando…"} previewUrl={previewUrl} />
        )}

        {estado.paso === "preguntas" && (
          <PasoPreguntas
            analisis={estado.analisis}
            respuestas={estado.respuestas}
            previewUrl={previewUrl}
            onResponder={tasacion.responder}
            onContinuar={() => void tasacion.estimar(estado.analisis, estado.respuestas)}
            onCambiarFoto={tasarOtro}
          />
        )}

        {estado.paso === "resultado" && (
          <Resultado analisis={estado.analisis} estimacion={estado.estimacion} onTasarOtro={tasarOtro} />
        )}

        {estado.paso === "error" && (
          <div className={styles.error} role="alert">
            <h3>No pudimos terminar la tasación</h3>
            <p>{estado.error.message}</p>
            <div className={styles.acciones}>
              {estado.error.codigo !== "limite_diario" && (
                <button type="button" className="btn btnCoral" onClick={tasacion.reintentar}>
                  Probar de nuevo
                </button>
              )}
              <button type="button" className="btn btnGhost" onClick={tasarOtro}>
                Usar otra foto
              </button>
            </div>
            {estado.error.ofrecerWaitlist && (
              <div className={styles.errorWaitlist}>
                <p>Sumate a la lista de espera y te avisamos cuando abramos.</p>
                <WaitlistForm origen="tasador" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
