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
/** Desde este ancho los brotes pueden meterse detrás de imágenes; más chico, solo salen de pantalla. */
const ANCHO_DESKTOP = 1024;

type Punto = { x: number; y: number };
/** Una línea a dibujar: su trazado y el tramo de scroll (en px de documento) en que crece. */
type Linea = { d: string; desde: number; hasta: number };
type Trazado = { alto: number; riel: Linea; ramas: Linea[]; ultimo: string };

/** Ondulación suave dentro del margen: nunca sale del riel hacia el contenido. */
function curva(a: Punto, b: Punto, onda: number): string {
  const dy = b.y - a.y;
  return `C ${a.x - onda} ${a.y + dy * 0.35}, ${b.x + onda} ${b.y - dy * 0.35}, ${b.x} ${b.y}`;
}

type Caja = { left: number; right: number; top: number; bottom: number };

/** ¿Una bajada vertical en x, entre y0 e y1, toca alguna de estas cajas de texto? */
function tocaTexto(x: number, y0: number, y1: number, textos: Caja[]) {
  return textos.some((t) => x > t.left - 24 && x < t.right + 24 && y1 > t.top - 12 && y0 < t.bottom + 12);
}

/**
 * Línea verde que recorre la página por el margen izquierdo (el riel), pasando por cada
 * elemento con `data-hilo-nodo` dentro de <main>. De ella salen brotes por las franjas
 * vacías entre secciones: algunos se van de la pantalla y otros, en desktop, se meten
 * detrás de una imagen o superficie marcada con `data-brote`, sin cruzar nunca un texto.
 * Todo crece con el scroll (GSAP ScrollTrigger); con reduced motion se ve completo.
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
        const rel = (r: DOMRect): Caja => ({
          left: r.left - base.left,
          right: r.right - base.left,
          top: r.top - base.top,
          bottom: r.bottom - base.top,
        });
        const docY = (y: number) => base.top + window.scrollY + y;
        const vh = window.innerHeight;
        const ancho = base.width;

        // ---------- Riel ----------
        const puntos: (Punto & { tasador: boolean })[] = [];
        main.querySelectorAll<HTMLElement>("[data-hilo-nodo]").forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.width === 0 && r.height === 0) return; // oculto
          const c = rel(r);
          puntos.push({ x: (c.left + c.right) / 2, y: (c.top + c.bottom) / 2, tasador: el.dataset.hiloNodo === "tasador" });
        });
        if (puntos.length < 2) return setTrazado(null);
        const xRiel = puntos[0].x;
        const onda = Math.min(14, xRiel * 0.6);
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

        // ---------- Brotes, en las franjas vacías entre secciones ----------
        const desktop = window.innerWidth >= ANCHO_DESKTOP;
        const secciones = [...main.querySelectorAll<HTMLElement>(":scope > section")];
        const ramas: Linea[] = [];
        secciones.forEach((sec, i) => {
          if (i === 0) return;
          const arriba = secciones[i - 1].querySelector(":scope > .container");
          const abajo = sec.querySelector(":scope > .container");
          if (!arriba || !abajo) return;
          const y0 = rel(arriba.getBoundingClientRect()).bottom;
          const y1 = rel(abajo.getBoundingClientRect()).top;
          if (y1 - y0 < 40) return; // franja muy angosta
          const ym = (y0 + y1) / 2;
          const media = (y1 - y0) / 2;

          // En desktop: buscar una imagen o superficie de la sección donde esconder el brote.
          if (desktop) {
            // Se mide el texto en sí (no la caja del bloque, que ocupa todo el ancho del contenedor).
            const rango = document.createRange();
            const textos = [...sec.querySelectorAll<HTMLElement>("h2, h3, p, li, dt, dd, .eyebrow, a, button")]
              .map((t) => {
                rango.selectNodeContents(t);
                return rel(rango.getBoundingClientRect());
              })
              .filter((t) => t.right - t.left > 0);
            for (const destino of sec.querySelectorAll<HTMLElement>("[data-brote]")) {
              const r = destino.getBoundingClientRect();
              if (r.width === 0) continue;
              const c = rel(r);
              const punta = destino.dataset.brote === "punta";
              const candidatos = punta ? [0.5] : [0.72, 0.85, 0.6];
              for (const f of candidatos) {
                const tx = c.left + (c.right - c.left) * f;
                const ty = punta ? (c.top + c.bottom) / 2 : c.top + (c.bottom - c.top) * 0.45;
                const textosAjenos = punta ? textos : textos.filter((t) => !(t.left >= c.left && t.right <= c.right && t.top >= c.top && t.bottom <= c.bottom));
                if (tx > ancho - 8 || tocaTexto(tx, ym, punta ? ty - 8 : c.top, textosAjenos)) continue;
                const codo = Math.min(48, (ty - ym) / 2);
                ramas.push({
                  d: `M ${xRiel} ${ym} C ${xRiel + (tx - xRiel) * 0.55} ${ym}, ${tx} ${ym}, ${tx} ${ym + codo} L ${tx} ${ty}`,
                  desde: docY(ym) - vh * 0.75,
                  hasta: docY(ty) - vh * 0.4,
                });
                return;
              }
            }
          }

          // Si no: el brote cruza la franja y se va de la pantalla, curvándose hacia arriba o hacia abajo.
          const dir = i % 2 === 0 ? 1 : -1;
          ramas.push({
            d: `M ${xRiel} ${ym} C ${xRiel + ancho * 0.3} ${ym + dir * media * 0.15}, ${ancho * 0.7} ${ym - dir * media * 0.55}, ${ancho + 40} ${ym - dir * media * 0.85}`,
            desde: docY(ym) - vh * 0.8,
            hasta: docY(ym) - vh * 0.35,
          });
        });

        setTrazado({ alto: base.height, riel, ramas, ultimo });
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

  // Cada línea crece en su tramo de scroll. Con reduced motion no se anima: queda completa.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || !trazado) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // Mismo orden que en el SVG: primero los brotes (quedan por debajo del riel), después el riel.
      const lineas = [...trazado.ramas, trazado.riel];
      svg.querySelectorAll<SVGPathElement>("[data-linea]").forEach((path, i) => {
        const l = lineas[i];
        if (!l) return;
        gsap.fromTo(
          path,
          { strokeDashoffset: LARGO },
          {
            strokeDashoffset: 0,
            ease: "none",
            scrollTrigger: { start: Math.max(0, l.desde), end: Math.max(l.desde + 1, l.hasta), scrub: true },
          },
        );
      });
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
          {trazado.ramas.map((r, i) => (
            <path key={`rama-${i}`} data-linea d={r.d} pathLength={LARGO} className={`${styles.linea} ${styles.rama}`} />
          ))}
          <path data-linea d={trazado.riel.d} pathLength={LARGO} className={styles.linea} />
          {completo > 0 && <path key={completo} d={trazado.ultimo} pathLength={1} className={styles.brillo} />}
        </>
      )}
    </svg>
  );
}
