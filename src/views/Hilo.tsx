"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Hilo.module.css";

/** Evento que dispara el tasador cuando muestra un resultado: completa el hilo. */
export const EVENTO_TASADO = "recircuito:tasado";

const BREAKPOINT_MOBILE = 768;
const X_MOBILE = 12;

type Punto = { x: number; y: number };

function curva(a: Punto, b: Punto): string {
  const dy = b.y - a.y;
  return `C ${a.x} ${a.y + dy * 0.5}, ${b.x} ${b.y - dy * 0.5}, ${b.x} ${b.y}`;
}

/**
 * Línea verde que recorre la página pasando por cada elemento con `data-hilo-nodo`
 * dentro de <main>. Se dibuja con el scroll (CSS scroll-timeline); sin soporte o con
 * prefers-reduced-motion se ve completa.
 */
export function Hilo() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [trazado, setTrazado] = useState<{ d: string; ultimo: string; alto: number } | null>(null);
  const [completo, setCompleto] = useState(0);

  useEffect(() => {
    const main = svgRef.current?.parentElement;
    if (!main) return;

    let raf = 0;
    const calcular = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const base = main.getBoundingClientRect();
        const mobile = window.innerWidth < BREAKPOINT_MOBILE;
        const puntos: Punto[] = [];
        main.querySelectorAll<HTMLElement>("[data-hilo-nodo]").forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.width === 0 && r.height === 0) return; // oculto
          puntos.push({
            x: mobile ? X_MOBILE : r.left - base.left + r.width / 2,
            y: r.top - base.top + r.height / 2,
          });
        });
        // Se respeta el orden del documento: el hilo entra a la tarjeta del tasador y termina en el brote.
        if (puntos.length < 2) return setTrazado(null);
        const [primero, ...resto] = puntos;
        let d = `M ${primero.x} ${primero.y}`;
        resto.forEach((p, i) => (d += ` ${curva(i === 0 ? primero : resto[i - 1], p)}`));
        const a = puntos[puntos.length - 2];
        const b = puntos[puntos.length - 1];
        setTrazado({ d, ultimo: `M ${a.x} ${a.y} ${curva(a, b)}`, alto: base.height });
      });
    };

    calcular();
    const ro = new ResizeObserver(calcular);
    ro.observe(main);
    window.addEventListener("resize", calcular);
    // Las imágenes y la fuente cambian el alto después de montar.
    window.addEventListener("load", calcular);

    const onTasado = () => {
      calcular();
      setCompleto((n) => n + 1);
    };
    window.addEventListener(EVENTO_TASADO, onTasado);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", calcular);
      window.removeEventListener("load", calcular);
      window.removeEventListener(EVENTO_TASADO, onTasado);
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      className={styles.hilo}
      aria-hidden="true"
      focusable="false"
      style={{ height: trazado?.alto ?? 0 }}
    >
      {trazado && (
        <>
          <path d={trazado.d} pathLength={1} className={styles.linea} />
          {completo > 0 && (
            <path key={completo} d={trazado.ultimo} pathLength={1} className={styles.brillo} />
          )}
        </>
      )}
    </svg>
  );
}
