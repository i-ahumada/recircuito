"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "./ComoFunciona.module.css";

type Paso = { img: string; alt: string; titulo: string; texto: string };

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
      <div className={styles.fija} aria-hidden="true">
        {pasos.map((p, i) => (
          <Image
            key={p.img}
            src={p.img}
            alt=""
            width={800}
            height={800}
            loading="lazy"
            sizes="40vw"
            className={`${styles.fijaImg} fundido`}
            data-activa={i === activo}
          />
        ))}
      </div>

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
            <Image
              src={p.img}
              alt={p.alt}
              width={800}
              height={800}
              loading="lazy"
              sizes="90vw"
              className={`${styles.pasoImg} fundido`}
            />
            <div className={styles.pasoTexto}>
              <span className={styles.num} data-hilo-nodo aria-hidden="true">
                {i + 1}
              </span>
              <h3>{p.titulo}</h3>
              <p>{p.texto}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
