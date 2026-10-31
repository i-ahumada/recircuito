import Image from "next/image";
import styles from "./Logo.module.css";

export function Logo() {
  return (
    <a href="#inicio" className={styles.logo} aria-label="ReCircuito, ir al inicio">
      <Image src="/img/logo.webp" alt="" width={720} height={165} priority sizes="200px" className={styles.img} />
    </a>
  );
}
