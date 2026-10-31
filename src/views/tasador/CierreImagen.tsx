"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { EVENTO_TASADO } from "../Hilo";
import styles from "./Tasador.module.css";

// Punta del brote en cierre-cajon-vacio.webp, en % de la imagen. Ahí termina el hilo.
const BROTE = { x: 74.6, y: 25 };

/** Imagen del cajón vacío: aparece con un fundido lento y su brote pulsa cuando termina una tasación. */
export function CierreImagen() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [pulsos, setPulsos] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    const onTasado = () => setPulsos((n) => n + 1);
    window.addEventListener(EVENTO_TASADO, onTasado);
    return () => {
      io.disconnect();
      window.removeEventListener(EVENTO_TASADO, onTasado);
    };
  }, []);

  return (
    <div ref={ref} className={styles.cierreMedia} data-visible={visible}>
      <Image
        src="/img/cierre-cajon-vacio.webp"
        alt="El mismo cajón, ahora vacío, con un brote creciendo adentro"
        width={1600}
        height={893}
        loading="lazy"
        sizes="(min-width: 1000px) 45vw, 100vw"
        className={`${styles.cierreImg} fundido`}
      />
      <span
        key={pulsos}
        className={styles.broteFinal}
        data-pulso={pulsos > 0}
        style={{ "--x": BROTE.x, "--y": BROTE.y } as React.CSSProperties}
        data-hilo-nodo=""
        aria-hidden="true"
      />
    </div>
  );
}
