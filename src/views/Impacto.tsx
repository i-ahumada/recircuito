import { CAJAS } from "./cajas";
import { CalculadoraCajon } from "./CalculadoraCajon";
import { Contador } from "./Contador";
import { Eyebrow } from "./Eyebrow";
import styles from "./Impacto.module.css";
import { Recorte } from "./Recorte";

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
    <section id="impacto" className="section" aria-labelledby="impacto-title">
      <div className="container">
        <Eyebrow>01 · Por qué importa</Eyebrow>
        <h2 id="impacto-title" className="sectionTitle">
          Lo que guardás en el cajón no desaparece.
        </h2>

        <div className={styles.fila}>
          <Recorte
            src="/img/impacto.webp"
            alt="Pila de electrónica vieja de la que crecen hojas verdes"
            width={1600}
            height={893}
            caja={CAJAS.impacto}
            brote
          fundido="fuerte"
            sizes="(min-width: 900px) 90vw, 150vw"
            className={styles.img}
          />
          <div className={`${styles.cifras} superficie`} data-brote>
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

        <div className={styles.fila2}>
          <CalculadoraCajon />
        </div>
      </div>
    </section>
  );
}
