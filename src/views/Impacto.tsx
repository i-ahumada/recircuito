import Image from "next/image";
import { CalculadoraCajon } from "./CalculadoraCajon";
import { Contador } from "./Contador";
import { Eyebrow } from "./Eyebrow";
import styles from "./Impacto.module.css";
import { MapaPilasToggle } from "./mapa/MapaPilasToggle";

// Las cifras de Argentina no se publican hasta tener una fuente citable.
const FUENTE_GLOBAL = {
  texto: "Global E-waste Monitor 2024, ONU (UNITAR / UIT)",
  url: "https://ewastemonitor.info/",
};

const CIFRAS = [
  {
    valor: 62,
    decimales: 0,
    sufijo: " millones de t",
    texto: "de residuos electrónicos se generaron en el mundo en 2022.",
  },
  { valor: 22.3, decimales: 1, sufijo: " %", texto: "se recicló de forma documentada." },
];

export function Impacto() {
  return (
    <section id="impacto" className={`section ${styles.section}`} aria-labelledby="impacto-title">
      <div className={styles.hero}>
        <Image
          src="/img/impacto.webp"
          alt="Pila de electrónica vieja de la que crecen hojas verdes"
          width={1600}
          height={893}
          loading="lazy"
          sizes="(min-width: 900px) 75vw, 100vw"
          className={`${styles.img} fundido`}
        />
        <div className={`container ${styles.heroGrid}`}>
          <div className={styles.cifras}>
            <Eyebrow>04 · Por qué importa</Eyebrow>
            <h2 id="impacto-title" className="sectionTitle">
              El cajón es chico. El problema, no.
            </h2>
            <dl className={styles.lista}>
              {CIFRAS.map((c) => (
                <div key={c.texto} className={styles.cifra}>
                  <dt>
                    <Contador valor={c.valor} decimales={c.decimales} sufijo={c.sufijo} />
                  </dt>
                  <dd>{c.texto}</dd>
                </div>
              ))}
            </dl>
            <p className={styles.fuente}>
              Fuente:{" "}
              <a href={FUENTE_GLOBAL.url} target="_blank" rel="noopener noreferrer">
                {FUENTE_GLOBAL.texto}
              </a>
            </p>
          </div>
        </div>
      </div>

      <div className={`container ${styles.bloques}`}>
        <CalculadoraCajon />
        <div id="pilas" className={styles.pilas}>
          <h3>¿Y las pilas?</h3>
          <p>
            Las pilas y baterías no se venden, pero contaminan el suelo y el agua si van a la basura común. Mirá en el
            mapa dónde dejarlas.
          </p>
          <MapaPilasToggle />
        </div>
      </div>

      <div className="container">
        <p className={styles.proximamente}>
          <span className={styles.badge}>Próximamente</span>
          Puntos de recolección en locales adheridos, para dejar dispositivos que todavía sirven, como ese celular viejo.
        </p>
      </div>
    </section>
  );
}
