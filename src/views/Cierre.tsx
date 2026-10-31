import styles from "./Cierre.module.css";
import { WaitlistForm } from "./WaitlistForm";

/** Banda de cierre: la frase final, la acción principal y la lista de espera. */
export function Cierre() {
  return (
    <section className={`section ${styles.cierre}`} aria-labelledby="cierre-title">
      <div className="container">
        <div className={`${styles.panel} superficie`}>
          <div className={styles.accion}>
            <span className="nodo railNodo" data-hilo-nodo aria-hidden="true" />
            <h2 id="cierre-title" className={styles.frase}>
              Lo que no usás, a alguien le sirve.
            </h2>
            <a href="#tasador" className="btn btnCoral">
              Tasá tu dispositivo
            </a>
          </div>

          <div id="lista-espera" className={styles.waitlist}>
            <h3>El marketplace abre pronto.</h3>
            <p>Dejanos tu email y te avisamos el día que puedas vender. Nada más.</p>
            <WaitlistForm origen="cierre" cta="Sumarme" />
          </div>
        </div>

        <p className={styles.proximamente}>
          <span className={styles.badge}>Próximamente</span>
          Puntos de recolección en locales adheridos, para dejar dispositivos que todavía sirven, como ese celular viejo.
        </p>
      </div>
    </section>
  );
}
