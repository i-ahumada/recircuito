import { CAJAS } from "./cajas";
import styles from "./CompradoresVerificados.module.css";
import { Eyebrow } from "./Eyebrow";
import { Recorte } from "./Recorte";

const MOMENTOS = [
  "Solo ofertan compradores verificados.",
  "Ves cada oferta antes de decidir.",
  "Recién cuando aceptás, coordinan el retiro.",
];

export function CompradoresVerificados() {
  return (
    <section className="section" aria-labelledby="compradores-title">
      <div className={`container ${styles.grid}`}>
        <div className={styles.texto}>
          <Eyebrow>03 · A quién va</Eyebrow>
          <h2 id="compradores-title" className="sectionTitle">
            Tu equipo va a manos que saben qué hacer con él.
          </h2>
          <p className="sectionLead">
            En ReCircuito solo ofertan compradores verificados. Vos elegís a quién se lo vendés.
          </p>
          <ol className={styles.momentos}>
            {MOMENTOS.map((m) => (
              <li key={m}>
                <svg className={styles.check} viewBox="0 0 32 32" aria-hidden="true">
                  <circle cx="16" cy="16" r="15" />
                  <path d="M10 16.5l4 4 8-9" pathLength={1} />
                </svg>
                <span>{m}</span>
              </li>
            ))}
          </ol>
          <p className={styles.nota}>
            No reparamos ni reacondicionamos. Conectamos a quien tiene el equipo con quien sabe darle otra vida.
          </p>
        </div>
        <Recorte
          src="/img/compradores-verificados.webp"
          alt="Manos de un técnico abriendo un celular con herramientas de precisión"
          width={800}
          height={800}
          caja={CAJAS.compradores}
          brote
          fundido="fuerte"
          sizes="(min-width: 900px) 50vw, 100vw"
          className={styles.media}
        />
      </div>
    </section>
  );
}
