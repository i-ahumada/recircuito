import Image from "next/image";
import styles from "./ComoFunciona.module.css";

const PASOS = [
  {
    img: "/img/paso-1-foto.webp",
    titulo: "Sacale una foto y la IA lo tasa",
    texto: "Subí una foto o sacala con el celu. Te hacemos dos o tres preguntas y te damos un rango de precio.",
  },
  {
    img: "/img/paso-2-ofertas.webp",
    titulo: "Técnicos y empresas verificados te ofertan",
    texto: "Lo compran técnicos, empresas y particulares que validamos. Lo reparan, usan sus partes o lo revenden.",
  },
  {
    img: "/img/paso-3-retiro.webp",
    titulo: "Aceptás y coordinan el retiro",
    texto: "Elegís la oferta que te sirve y el comprador verificado se lo lleva. Vos te sacás el cajón de encima.",
  },
];

export function ComoFunciona() {
  return (
    <section id="como-funciona" className={`section ${styles.section}`} aria-labelledby="como-title">
      <div className="container">
        <span className="eyebrow">Cómo funciona</span>
        <h2 id="como-title" className="sectionTitle">
          Tres pasos y listo.
        </h2>

        <ol className={styles.pasos}>
          {PASOS.map((p, i) => (
            <li key={p.img} className={`${styles.paso} reveal`}>
              <Image src={p.img} alt={p.titulo} width={800} height={800} loading="lazy" sizes="(min-width: 900px) 33vw, 90vw" className={styles.img} />
              <div className={styles.texto}>
                <span className={styles.num} aria-hidden="true">
                  {i + 1}
                </span>
                <h3>{p.titulo}</h3>
                <p>{p.texto}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className={styles.extras}>
          <div className={`${styles.extra} ${styles.extraDescarte}`}>
            <h3>¿Y si no vale nada?</h3>
            <p>
              No pasa nada. Si no tiene valor de reventa, te mostramos en un mapa dónde dejarlo según el tipo de
              residuo. Nada termina en la basura común.
            </p>
          </div>
          <div className={`${styles.extra} ${styles.extraModelo}`}>
            <h3>Publicar es gratis, cobramos un porcentaje solo si vendés.</h3>
            <p>Sin costos fijos ni sorpresas. Si no se vende, no pagás nada.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
