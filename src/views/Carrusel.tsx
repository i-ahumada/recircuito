"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./Carrusel.module.css";

type Props = { etiqueta: string; children: ReactNode };

/** Fila con scroll horizontal y snap. Los ítems se renderizan en el servidor; acá solo van los controles. */
export function Carrusel({ etiqueta, children }: Props) {
  const pistaRef = useRef<HTMLUListElement>(null);
  const [puede, setPuede] = useState({ atras: false, adelante: true });

  const actualizar = useCallback(() => {
    const el = pistaRef.current;
    if (!el) return;
    setPuede({
      atras: el.scrollLeft > 4,
      adelante: el.scrollLeft + el.clientWidth < el.scrollWidth - 4,
    });
  }, []);

  useEffect(() => {
    const el = pistaRef.current;
    if (!el) return;
    actualizar();
    el.addEventListener("scroll", actualizar, { passive: true });
    window.addEventListener("resize", actualizar);
    return () => {
      el.removeEventListener("scroll", actualizar);
      window.removeEventListener("resize", actualizar);
    };
  }, [actualizar]);

  function mover(direccion: 1 | -1) {
    const el = pistaRef.current;
    if (!el) return;
    const reducir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: direccion * el.clientWidth * 0.8, behavior: reducir ? "auto" : "smooth" });
  }

  return (
    <div className={styles.carrusel} role="region" aria-roledescription="carrusel" aria-label={etiqueta}>
      <ul ref={pistaRef} className={styles.pista}>
        {children}
      </ul>
      <div className={styles.controles}>
        <button
          type="button"
          className={styles.flecha}
          onClick={() => mover(-1)}
          disabled={!puede.atras}
          aria-label="Ver anteriores"
        >
          <span aria-hidden="true">←</span>
        </button>
        <button
          type="button"
          className={styles.flecha}
          onClick={() => mover(1)}
          disabled={!puede.adelante}
          aria-label="Ver siguientes"
        >
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}
