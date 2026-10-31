import Image from "next/image";
import styles from "./CompradoresVerificados.module.css";

const VALIDACIONES = [
  "Validamos su CUIT.",
  "Revisamos su documentación.",
  "Recién ahí puede ofertar.",
];

export function CompradoresVerificados() {
  return (
    <section className={`section ${styles.section}`} aria-labelledby="compradores-title">
      <div className={`container ${styles.grid}`}>
        <Image
          src="/img/compradores-verificados.webp"
          alt="Manos de un técnico abriendo un celular con herramientas de precisión"
          width={800}
          height={800}
          loading="lazy"
          sizes="(min-width: 900px) 45vw, 100vw"
          className={`${styles.img} reveal`}
        />
        <div>
          <span className="eyebrow">Compradores verificados</span>
          <h2 id="compradores-title" className="sectionTitle">
            Tu equipo va a manos que saben qué hacer con él.
          </h2>
          <p className="sectionLead">
            Cada técnico, empresa o particular que compra en ReCircuito pasa por una validación antes de poder
            ofertar. Así sabés a quién le entregás tu dispositivo.
          </p>
          <ul className={styles.lista}>
            {VALIDACIONES.map((v) => (
              <li key={v}>{v}</li>
            ))}
          </ul>
          <p className={styles.nota}>Nosotros no reparamos ni reacondicionamos: conectamos.</p>
        </div>
      </div>
    </section>
  );
}
