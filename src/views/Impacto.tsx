import { CAJAS } from "./cajas";
import { CalculadoraCajon } from "./CalculadoraCajon";
import { Contador } from "./Contador";
import { Eyebrow } from "./Eyebrow";
import styles from "./Impacto.module.css";
import { Recorte } from "./Recorte";

type Fuente = { texto: string; url?: string };

const MANUAL_RAEE: Fuente = {
  texto: "Manual de Gestión Integral de RAEE, Ministerio de Ambiente de la Nación",
  url: "https://www.argentina.gob.ar/ambiente/control/manual-raee",
};
const ESTUDIO_EMPLEO: Fuente = {
  texto: "RAEE y empleo en la Argentina (OIT, 2020)",
  url: "https://www.ilo.org/es/media/401831/download",
};
const GCBA: Fuente = {
  texto: "Gobierno de la Ciudad de Buenos Aires",
  url: "https://buenosaires.gob.ar/gcaba_historico/vicejefatura/ambiente/residuos-especiales/residuos-de-aparatos-electricos-y-electronicos-raee",
};

type Cifra = {
  /** Valor animado; si la cifra es un rango se usa `fijo` y no se anima. */
  valor?: number;
  fijo?: string;
  decimales?: number;
  sufijo?: string;
  texto: string;
};

const CIFRAS: Cifra[] = [
  { valor: 465000, sufijo: " t", texto: "de residuos electrónicos genera Argentina por año." },
  { valor: 10.3, decimales: 1, sufijo: " kg", texto: "por habitante, cada año." },
  { fijo: "3 a 4 %", texto: "se recupera por canales formales." },
];

// Composición de un RAEE. Colores validados (contraste ≥ 3:1 y separación para daltonismo).
const COMPOSICION = [
  { pct: 72, nombre: "Reciclable", detalle: "plásticos, metales ferrosos y preciosos, vidrio", color: "#0a7a52" },
  { pct: 25, nombre: "Reutilizable", detalle: "cables, motores, fuentes, lectoras, imanes", color: "#2a7fc4" },
  { pct: 3, nombre: "Peligroso", detalle: "tubos de rayos catódicos, plaquetas, gases refrigerantes, PCB", color: "#e2553a" },
];

function Cita({ fuentes }: { fuentes: Fuente[] }) {
  return (
    <p className={styles.fuente}>
      Fuente{fuentes.length > 1 ? "s" : ""}:{" "}
      {fuentes.map((f, i) => (
        <span key={f.texto}>
          {i > 0 && " · "}
          {f.url ? (
            <a href={f.url} target="_blank" rel="noopener noreferrer">
              {f.texto}
            </a>
          ) : (
            f.texto
          )}
        </span>
      ))}
    </p>
  );
}

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
            fundido="fuerte"
            sizes="(min-width: 900px) 90vw, 150vw"
            className={styles.img}
          />
          <div className={`${styles.cifras} superficie`}>
            <dl className={styles.lista}>
              {CIFRAS.map((c) => (
                <div key={c.texto} className={styles.cifra}>
                  <dt>
                    {c.fijo ?? <Contador valor={c.valor ?? 0} decimales={c.decimales} sufijo={c.sufijo} />}
                  </dt>
                  <dd>{c.texto}</dd>
                </div>
              ))}
            </dl>
            <Cita fuentes={[MANUAL_RAEE, ESTUDIO_EMPLEO]} />
          </div>
        </div>

        <div className={`${styles.composicion} superficie`}>
          <h3>Y casi todo lo que se tira se puede aprovechar.</h3>
          <div className={styles.barra} aria-hidden="true">
            {COMPOSICION.map((p) => (
              <span key={p.nombre} style={{ flexGrow: p.pct, background: p.color }} />
            ))}
          </div>
          <dl className={styles.partes}>
            {COMPOSICION.map((p) => (
              <div key={p.nombre} className={styles.parte}>
                <dt>
                  <span className={styles.muestra} style={{ background: p.color }} aria-hidden="true" />
                  <strong>{p.pct} %</strong> {p.nombre}
                </dt>
                <dd>{p.detalle}</dd>
              </div>
            ))}
          </dl>
          <Cita fuentes={[GCBA]} />
        </div>

        <div className={styles.fila2}>
          <CalculadoraCajon />
        </div>
      </div>
    </section>
  );
}
