import Image from "next/image";
import { NAV } from "./Header";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.bottom}>
          <div className={styles.marca}>
            <Image
              src="/img/logo-blanco.webp"
              alt="ReCircuito"
              width={720}
              height={165}
              sizes="220px"
              className={styles.logo}
            />
            <p>Conectamos lo que ya no usás con quien le da una segunda vida.</p>
          </div>
          <nav aria-label="Pie de página">
            <ul className={styles.links}>
              {NAV.map((item) => (
                <li key={item.href}>
                  <a href={item.href}>{item.label}</a>
                </li>
              ))}
              <li>
                <a href="#pilas">¿Y las pilas?</a>
              </li>
            </ul>
          </nav>
        </div>
        <p className={styles.legal}>
          © {new Date().getFullYear()} ReCircuito · MVP de hackathon. Las tasaciones son estimaciones orientativas.
        </p>
      </div>
    </footer>
  );
}
