import { NAV } from "./Header";
import styles from "./Footer.module.css";
import { WaitlistForm } from "./WaitlistForm";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div id="lista-espera" className={styles.waitlist}>
          <div>
            <h2 className={styles.titulo}>El marketplace abre pronto.</h2>
            <p className={styles.sub}>Dejanos tu email y te avisamos el día que puedas vender. Nada más.</p>
          </div>
          <WaitlistForm origen="footer" cta="Sumarme" tono="oscuro" />
        </div>

        <div className={styles.bottom}>
          <div className={styles.marca}>
            <span className={styles.logo}>ReCircuito</span>
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
