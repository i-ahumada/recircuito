"use client";

import { useEffect, useRef, useState } from "react";
import type { Caja } from "./Recorte";
import { Recorte } from "./Recorte";
import styles from "./ComoFunciona.module.css";

type Paso = { img: string; caja: Caja; alt: string; titulo: string; texto: string };

/**
 * En desktop: imagen fija a la izquierda que cambia con fundido cruzado cuando cada
 * texto pasa por el centro de la pantalla. En mobile: lista vertical con su imagen.
 */
export function PasosScrolly({ pasos }: { pasos: Paso[] }) {
  const [activo, setActivo] = useState(0);
  const refs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActivo(Number((e.target as HTMLElement).dataset.indice));
        }
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className={styles.scrolly}>
      <ol className={styles.pasos}>
        {pasos.map((p, i) => (
          <li
            key={p.img}
            ref={(el) => {
              refs.current[i] = el;
            }}
            data-indice={i}
            data-activo={i === activo}
            className={styles.paso}
          >
            <div className={styles.pasoTexto}>
              <span className={styles.num} aria-hidden="true">
                {i + 1}
              </span>
              <h3>{p.titulo}</h3>
              <p>{p.texto}</p>
            </div>
            <Recorte
              src={p.img}
              alt={p.alt}
              width={800}
              height={800}
              caja={p.caja}
              sizes="(min-width: 900px) 10vw, 120vw"
              className={styles.pasoImg}
            />
          </li>
        ))}
      </ol>

      <div className={styles.fija} data-brote aria-hidden="true">
        {pasos.map((p, i) => (
          <div key={p.img} className={styles.fijaImg} data-activa={i === activo}>
            <Recorte src={p.img} alt="" width={800} height={800} caja={p.caja} sizes="60vw" />
          </div>
        ))}
      </div>
    </div>
  );
}
