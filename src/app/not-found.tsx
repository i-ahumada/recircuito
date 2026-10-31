import type { Metadata } from "next";
import Link from "next/link";
import { CAJAS } from "@/views/cajas";
import { Recorte } from "@/views/Recorte";
import styles from "./not-found.module.css";

export const metadata: Metadata = {
  title: "Página no encontrada · ReCircuito",
};

export default function NotFound() {
  return (
    <main className={styles.main}>
      <Recorte
        src="/img/cierre-cajon-vacio.webp"
        alt="Cajón vacío con un brote creciendo"
        width={1600}
        height={893}
        caja={CAJAS.cierre}
        sizes="700px"
        className={styles.img}
      />
      <h1 className={styles.titulo}>Acá no hay nada… todavía</h1>
      <p className={styles.sub}>La página que buscás no existe o se mudó.</p>
      <Link href="/" className="btn btnPrimario">
        Volver al inicio
      </Link>
    </main>
  );
}
