"use client";

import { useEffect, useRef, useState } from "react";
import type { Analisis, Estimacion } from "@/lib/schemas";
import { Contador } from "../Contador";
import { MapaDescarteLazy } from "../mapa/MapaDescarteLazy";
import { WaitlistForm } from "../WaitlistForm";
import { BorradorEditable } from "./BorradorEditable";
import { formatoARS, formatoFecha, formatoRango } from "./formato";

/** Precio sugerido para publicar: el medio del rango, redondeado a $1.000. */
function precioSugerido(rango: { minARS: number; maxARS: number }) {
  return Math.round((rango.minARS + rango.maxARS) / 2 / 1000) * 1000;
}
import styles from "./Tasador.module.css";

type Props = { analisis: Analisis; estimacion: Estimacion; onTasarOtro: () => void };

const ACLARACION = "Es una estimación orientativa; el precio final lo acuerdan comprador y vendedor.";

export function Resultado({ analisis, estimacion, onTasarOtro }: Props) {
  const dispositivo = [analisis.tipoDispositivo, analisis.marca, analisis.modelo].filter(Boolean).join(" ");
  const rango = estimacion.tipo === "conPrecio" ? estimacion.rango : null;
  const [precio, setPrecio] = useState<number | null>(rango ? precioSugerido(rango) : null);

  if (estimacion.tipo === "sinValor") {
    return <ResultadoSinValor estimacion={estimacion} onTasarOtro={onTasarOtro} />;
  }

  const rangoTexto =
    estimacion.tipo === "conPrecio" ? formatoRango(estimacion.rango.minARS, estimacion.rango.maxARS) : undefined;

  return (
    <div className={styles.resultado}>
      <div className={styles.precioBloque}>
        {estimacion.tipo === "conPrecio" ? (
          <>
            <p className={styles.precioLabel}>Rango estimado</p>
            <p className={styles.precio} aria-label={`Entre ${rangoTexto}`}>
              <span aria-hidden="true">
                <Contador valor={estimacion.rango.minARS} prefijo="$ " duracionMs={900} inmediato />
              </span>
              <span className={styles.precioSep} aria-hidden="true">
                –
              </span>
              <span aria-hidden="true">
                <Contador valor={estimacion.rango.maxARS} prefijo="$ " duracionMs={900} inmediato />
              </span>
            </p>
          </>
        ) : (
          <>
            <p className={styles.precioLabel}>Sin precio de referencia</p>
            <p className={styles.precioSinRef}>Todavía no tenemos datos para tasar este equipo.</p>
          </>
        )}
        <p className={styles.resumen}>{estimacion.resumen}</p>
      </div>

      <BorradorEditable inicial={estimacion.borrador} rango={rango} precio={precio} onPrecio={setPrecio} />

      <details className={styles.porQue}>
        <summary>¿Por qué este precio?</summary>
        <div className={styles.porQueContenido}>
          {estimacion.tipo === "conPrecio" ? (
            <>
              <h4>1. Precio de referencia</h4>
              <p>
                Usamos <strong>{estimacion.referencia.nombre}</strong>, que usado y funcionando vale alrededor de{" "}
                <strong>{formatoARS(estimacion.referencia.precioReferenciaARS)}</strong>.{" "}
                {estimacion.referencia.muestras > 0
                  ? `Lo respaldan ${estimacion.referencia.muestras} publicaciones`
                  : "Es un valor de ejemplo, todavía sin publicaciones que lo respalden"}
                , actualizado el {formatoFecha(estimacion.referencia.actualizado)}.
              </p>

              <h4>2. Ajustes</h4>
              {estimacion.ajustes.length > 0 ? (
                <ul>
                  {estimacion.ajustes.map((a, i) => (
                    <li key={i}>
                      <strong>{a.respuesta}</strong> ({a.pregunta.replace(/[¿?]/g, "")}): {a.efecto}.
                      {estimacion.explicacionAjustes[i] && (
                        <span className={styles.ajusteExtra}> {estimacion.explicacionAjustes[i]}</span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No hubo ajustes: tomamos el estado de un equipo que funciona bien.</p>
              )}
            </>
          ) : (
            <>
              <h4>1. Precio de referencia</h4>
              <p>
                Este dispositivo no está en nuestra tabla de precios. Preferimos no darte un número inventado. Igual
                podés guardar el borrador y sumarte a la lista de espera.
              </p>
            </>
          )}

          <h4>{estimacion.tipo === "conPrecio" ? "3." : "2."} Qué hace variar el precio</h4>
          <ul>
            {estimacion.factoresVariabilidad.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>

          <p className={styles.aclaracion}>{ACLARACION}</p>
        </div>
      </details>

      <div className={styles.waitlistTasador}>
        <h3>Sumate a la lista de espera para publicarlo cuando lancemos</h3>
        <WaitlistForm
          origen="tasador"
          cta="Sumarme"
          dispositivo={dispositivo}
          rango={rangoTexto}
          precioARS={precio ?? undefined}
          conAceptacion
        />
      </div>

      <button type="button" className="btn btnGhost" onClick={onTasarOtro}>
        Tasar otro dispositivo
      </button>
    </div>
  );
}

function ResultadoSinValor({
  estimacion,
  onTasarOtro,
}: {
  estimacion: Extract<Estimacion, { tipo: "sinValor" }>;
  onTasarOtro: () => void;
}) {
  const mapaTituloRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    mapaTituloRef.current?.focus();
  }, []);

  return (
    <div className={styles.resultado}>
      <div className={styles.sinValor}>
        <h3 className={styles.sinValorTitulo}>No va a la basura: tiene un lugar.</h3>
        <p className={styles.resumen}>{estimacion.resumen}</p>
        <a href="#mapa-descarte" className="btnLink">
          Ver dónde dejarlo ↓
        </a>
      </div>

      <details className={styles.porQue}>
        <summary>¿Por qué no tiene valor?</summary>
        <div className={styles.porQueContenido}>
          <p>{estimacion.motivo}</p>
          <p className={styles.aclaracion}>{ACLARACION}</p>
        </div>
      </details>

      <div className={styles.mapaBloque}>
        <h3 ref={mapaTituloRef} id="mapa-descarte" tabIndex={-1} className={styles.mapaTitulo}>
          {estimacion.tipoResiduo === "pilas" ? "Dónde dejar pilas y baterías" : "Dónde dejar tus electrónicos"}
        </h3>
        <MapaDescarteLazy filtroInicial={estimacion.tipoResiduo} />
      </div>

      <button type="button" className="btn btnGhost" onClick={onTasarOtro}>
        Tasar otro dispositivo
      </button>
    </div>
  );
}
