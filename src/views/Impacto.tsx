import Image from "next/image";
import styles from "./Impacto.module.css";
import { MapaPilasToggle } from "./mapa/MapaPilasToggle";

// Fuentes de las cifras. Si cambiás un dato, actualizá también su fuente.
const FUENTE_GLOBAL = {
  texto: "Global E-waste Monitor 2024, ONU (UNITAR / UIT)",
  url: "https://ewastemonitor.info/",
};
// TODO: confirmar la fuente exacta de las cifras de Argentina antes de publicar.
const FUENTE_ARGENTINA = { texto: "Fuente a confirmar", url: null as string | null };

const CIFRAS = [
  {
    valor: "517.000 t",
    texto: "de residuos electrónicos se generan por año en Argentina.",
    fuente: FUENTE_ARGENTINA,
  },
  { valor: "3%", texto: "se recupera por vías formales en el país.", fuente: FUENTE_ARGENTINA },
  { valor: "62 millones de t", texto: "de residuos electrónicos se generaron en el mundo en 2022.", fuente: FUENTE_GLOBAL },
  { valor: "22,3%", texto: "se recicló de forma documentada a nivel mundial.", fuente: FUENTE_GLOBAL },
];

function Fuente({ fuente }: { fuente: { texto: string; url: string | null } }) {
  return (
    <span className={styles.fuente}>
      Fuente:{" "}
      {fuente.url ? (
        <a href={fuente.url} target="_blank" rel="noopener noreferrer">
          {fuente.texto}
        </a>
      ) : (
        fuente.texto
      )}
    </span>
  );
}

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
          className={styles.img}
        />
        <div className={`container ${styles.heroGrid}`}>
          <div className={styles.cifras}>
            <span className="eyebrow">Impacto</span>
            <h2 id="impacto-title" className="sectionTitle">
              El cajón es chico. El problema, no.
            </h2>
            <dl className={styles.lista}>
              {CIFRAS.map((c) => (
                <div key={c.valor} className={`${styles.cifra} reveal`}>
                  <dt>{c.valor}</dt>
                  <dd>
                    {c.texto}
                    <Fuente fuente={c.fuente} />
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      <div className={`container ${styles.bloques}`}>
        <div id="pilas" className={styles.pilas}>
          <h3>¿Y las pilas?</h3>
          <p>
            Las pilas y baterías sueltas no se venden. Pero tampoco van a la basura: contaminan el suelo y el agua.
            Sacales una foto y el tasador te muestra dónde dejarlas de forma segura.
          </p>
          <MapaPilasToggle />
        </div>
        <div className={styles.proximamente}>
          <span className={styles.badge}>Próximamente</span>
          <h3>Puntos de recolección en locales adheridos</h3>
          <p>
            Una red de comercios donde vas a poder dejar dispositivos que todavía sirven, como ese celular viejo, para
            que les den una segunda vida.
          </p>
        </div>
      </div>
    </section>
  );
}
