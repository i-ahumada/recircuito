"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  valor: number;
  decimales?: number;
  /** Texto antes y después del número (por ejemplo "$" o " %"). */
  prefijo?: string;
  sufijo?: string;
  duracionMs?: number;
  /** Arranca al montar en lugar de esperar a entrar en pantalla. */
  inmediato?: boolean;
};

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Número que cuenta desde 0 hasta `valor` una sola vez. Con reduced motion
 * (o en el render del servidor) se muestra el valor final directo.
 */
export function Contador({ valor, decimales = 0, prefijo = "", sufijo = "", duracionMs = 1200, inmediato = false }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const [actual, setActual] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const animar = () => {
      const inicio = performance.now();
      const paso = (ahora: number) => {
        const t = Math.min(1, (ahora - inicio) / duracionMs);
        setActual(valor * easeOut(t));
        if (t < 1) raf = requestAnimationFrame(paso);
      };
      raf = requestAnimationFrame(paso);
    };

    if (inmediato) {
      animar();
      return () => cancelAnimationFrame(raf);
    }

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          io.disconnect();
          animar();
        }
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [valor, duracionMs, inmediato]);

  const n = actual ?? valor;
  const texto = n.toLocaleString("es-AR", { minimumFractionDigits: decimales, maximumFractionDigits: decimales });
  return (
    <span ref={ref}>
      {prefijo}
      {texto}
      {sufijo}
    </span>
  );
}
