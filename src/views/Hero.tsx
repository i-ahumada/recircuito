import { CAJAS } from "./cajas";
import styles from "./Hero.module.css";
import { CATEGORIAS_ICONOS } from "./iconos";
import { enRecorte, Recorte } from "./Recorte";

// Puntas de los brotes en hero-cajon.webp, en % de la imagen original.
const BROTES = [
  { x: 77.7, y: 15.2 },
  { x: 68.5, y: 17.9 },
  { x: 61.6, y: 26.8 },
  { x: 85.9, y: 30.4 },
  { x: 55.3, y: 48.1 },
];

export function Hero() {
  return (
    <section id="inicio" className={styles.hero} aria-labelledby="hero-title">
      <div className={`container ${styles.grid}`}>
        <div className={styles.texto}>
          <h1 id="hero-title" className={styles.titulo}>
            Vaciá el <span className={styles.nowrap}>cajón.</span>
          </h1>
          <p className={styles.sub}>
            Ese celular, esa notebook, esa tablet que no usás valen plata. Sacales una foto y en un minuto sabés
            cuánto.
          </p>
          <div className={styles.ctas}>
            {/* Acá nace el hilo. */}
            <span className="nodo railNodo" data-hilo-nodo aria-hidden="true" />
            <a href="#tasador" className="btn btnCoral">
              Tasá tu dispositivo
            </a>
            <span className={styles.micro}>Gratis y sin registrarte.</span>
          </div>

          <div className={styles.selector}>
            <p className={styles.selectorTitulo} id="selector-titulo">
              ¿Qué tenés en el cajón?
            </p>
            <ul className={styles.chips} aria-labelledby="selector-titulo">
              {CATEGORIAS_ICONOS.map(({ nombre, Icono }) => (
                <li key={nombre}>
                  <a href="#tasador" className={styles.chip}>
                    <Icono className={styles.chipIcono} />
                    {nombre}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <p className={styles.waitlist}>
            Todavía estamos abriendo el marketplace.{" "}
            <a href="#lista-espera" className="btnLink">
              Avisame cuando abra →
            </a>
          </p>
        </div>

        <Recorte
          src="/img/hero-cajon.webp"
          alt="Cajón abierto con celulares, tablets y cables viejos de los que salen brotes verdes"
          width={1600}
          height={893}
          caja={CAJAS.hero}
          sizes="(min-width: 900px) 90vw, 190vw"
          priority
          className={styles.media}
        >
          {BROTES.map((b, i) => (
            <span
              key={i}
              className={styles.brote}
              style={{ ...enRecorte(CAJAS.hero, b.x, b.y), "--i": i } as React.CSSProperties}
              aria-hidden="true"
            />
          ))}
        </Recorte>
      </div>
    </section>
  );
}
