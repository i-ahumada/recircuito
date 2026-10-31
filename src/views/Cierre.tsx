import Image from "next/image";
import styles from "./Cierre.module.css";

export function Cierre() {
  return (
    <section className={`section ${styles.section}`} aria-labelledby="cierre-title">
      <div className={`container ${styles.grid}`}>
        <div className={styles.texto}>
          <h2 id="cierre-title" className={styles.titulo}>
            Abrí el cajón. Sacale una foto.
          </h2>
          <p className="sectionLead">
            En un minuto sabés cuánto vale. Y si no vale nada, sabés dónde dejarlo.
          </p>
          <div className={styles.ctas}>
            <a href="#tasador" className="btn btnCoral">
              Tasá tu dispositivo
            </a>
            <a href="#lista-espera" className="btn btnGhost">
              Sumarme a la lista
            </a>
          </div>
        </div>
        <Image
          src="/img/cierre-cajon-vacio.webp"
          alt="El mismo cajón, ahora vacío, con un brote creciendo adentro"
          width={1600}
          height={893}
          loading="lazy"
          sizes="(min-width: 900px) 55vw, 100vw"
          className={styles.img}
        />
      </div>
    </section>
  );
}
