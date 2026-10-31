import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import styles from "./not-found.module.css";

export const metadata: Metadata = {
  title: "Página no encontrada · ReCircuito",
};

export default function NotFound() {
  return (
    <main className={styles.main}>
      <Image
        src="/img/cierre-cajon-vacio.webp"
        alt="Cajón vacío con un brote creciendo"
        width={1600}
        height={893}
        loading="lazy"
        sizes="360px"
        className={styles.img}
      />
      <h1 className={styles.titulo}>Acá no hay nada… todavía</h1>
      <p className={styles.sub}>La página que buscás no existe o se mudó.</p>
      <Link href="/" className="btn btnCoral">
        Volver al inicio
      </Link>
    </main>
  );
}
