"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";
import styles from "./Hilo.module.css";

gsap.registerPlugin(ScrollTrigger);

/** Evento que dispara el tasador cuando muestra un resultado: brilla el tramo que entra al tasador. */
export const EVENTO_TASADO = "recircuito:tasado";

/** Largo normalizado de las líneas animadas. GSAP redondea stroke-dashoffset a px enteros: con 1000 el trazo es continuo. */
const LARGO = 1000;

type Punto = { x: number; y: number };
/** Una línea a dibujar: su trazado y el tramo de scroll (en px de documento) en que crece. */
type Linea = { d: string; desde: number; hasta: number };
type Trazado = { alto: number; riel: Linea; ultimo: string };

/** Ondulación suave dentro del margen: nunca sale del riel hacia el contenido. */
function curva(a: Punto, b: Punto, onda: number): string {
  const dy = b.y - a.y;
  return `C ${a.x - onda} ${a.y + dy * 0.35}, ${b.x + onda} ${b.y - dy * 0.35}, ${b.x} ${b.y}`;
}

/**
 * Línea verde que recorre la página por el margen izquierdo (el riel), pasando por cada
 * elemento con `data-hilo-nodo` dentro de <main>. Los nodos viven en el riel, así la
 * línea no cruza el texto. Crece con el scroll (GSAP ScrollTrigger, igual en todos los
 * navegadores); con reduced motion se ve completa.
 */
export function Hilo() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [trazado, setTrazado] = useState<Trazado | null>(null);
  const [completo, setCompleto] = useState(0);

  useEffect(() => {
    const main = svgRef.current?.parentElement;
    if (!main) return;

    let raf = 0;
    const calcular = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const base = main.getBoundingClientRect();
        const docY = (y: number) => base.top + window.scrollY + y;
        const vh = window.innerHeight;
        const puntos: (Punto & { tasador: boolean })[] = [];
        main.querySelectorAll<HTMLElement>("[data-hilo-nodo]").forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.width === 0 && r.height === 0) return; // oculto
          puntos.push({
            x: r.left - base.left + r.width / 2,
            y: r.top - base.top + r.height / 2,
            tasador: el.dataset.hiloNodo === "tasador",
          });
        });
        if (puntos.length < 2) return setTrazado(null);
        // La onda ocupa como máximo un tercio del margen, para no acercarse al texto.
        const onda = Math.min(14, puntos[0].x * 0.6);
        const [primero, ...resto] = puntos;
        let d = `M ${primero.x} ${primero.y}`;
        resto.forEach((p, i) => (d += ` ${curva(i === 0 ? primero : resto[i - 1], p, onda)}`));
        let fin = puntos.findIndex((p) => p.tasador);
        if (fin < 1) fin = puntos.length - 1;
        const ultimo = `M ${puntos[fin - 1].x} ${puntos[fin - 1].y} ${curva(puntos[fin - 1], puntos[fin], onda)}`;
        // La punta del riel acompaña la lectura: va un poco por encima del centro de la pantalla.
        const riel: Linea = {
          d,
          desde: Math.max(0, docY(primero.y) - vh * 0.6),
          hasta: docY(puntos[puntos.length - 1].y) - vh * 0.6,
        };

        setTrazado({ alto: base.height, riel, ultimo });
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

  // El riel crece en su tramo de scroll. Con reduced motion no se anima: queda completo.
  const rielRef = useRef<SVGPathElement>(null);
  useEffect(() => {
    const path = rielRef.current;
    if (!path || !trazado) return;
    const { desde, hasta } = trazado.riel;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        path,
        { strokeDashoffset: LARGO },
        {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: { start: Math.max(0, desde), end: Math.max(desde + 1, hasta), scrub: true },
        },
      );
    });
    return () => mm.revert();
  }, [trazado]);

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
          <path ref={rielRef} d={trazado.riel.d} pathLength={LARGO} className={styles.linea} />
          {completo > 0 && <path key={completo} d={trazado.ultimo} pathLength={1} className={styles.brillo} />}
        </>
      )}
    </svg>
  );
}
