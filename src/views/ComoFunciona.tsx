import { Eyebrow } from "./Eyebrow";
import styles from "./ComoFunciona.module.css";
import { IconoPartes, IconoReciclaje, IconoReuso } from "./iconos";
import { PasosScrolly } from "./PasosScrolly";

const PASOS = [
  {
    img: "/img/paso-1-foto.webp",
    alt: "Sacale una foto y la IA lo tasa",
    titulo: "Sacale una foto.",
    texto: "La IA reconoce el modelo, te hace dos o tres preguntas y te da un rango de precio.",
  },
  {
    img: "/img/paso-2-ofertas.webp",
    alt: "Compradores verificados te ofertan",
    titulo: "Te ofertan compradores verificados.",
    texto: "Lo reparan, usan sus partes o lo revenden. Vos elegís qué oferta aceptar.",
  },
  {
    img: "/img/paso-3-retiro.webp",
    alt: "Aceptás y coordinan el retiro",
    titulo: "Coordinan el retiro.",
    texto: "Aceptás la oferta que te sirve, el comprador lo pasa a buscar y vos cobrás.",
  },
];

const DESTINOS = [
  { Icono: IconoReuso, titulo: "Vuelve a usarse", texto: "Lo reparan y lo vende otra persona." },
  { Icono: IconoPartes, titulo: "Se aprovechan sus partes", texto: "Pantalla, batería o placa van a otros equipos." },
  {
    Icono: IconoReciclaje,
    titulo: "Se recicla bien",
    texto: "Si no sirve, va a un punto de reciclaje habilitado, no a la basura.",
  },
];

const CHECKLIST = [
  "Hacé un backup de tus fotos y datos.",
  "Cerrá sesión de tu cuenta de Google o iCloud.",
  "Sacá el chip y la tarjeta de memoria.",
  "Restablecé de fábrica.",
];

export function ComoFunciona() {
  return (
    <section id="como-funciona" className="section" aria-labelledby="como-title">
      <div className="container">
        <Eyebrow>01 · Así funciona</Eyebrow>
        <h2 id="como-title" className="sectionTitle">
          De tu cajón a otras manos, en tres pasos.
        </h2>

        <PasosScrolly pasos={PASOS} />

        <div className={styles.despues}>
          <h3 className={styles.subtitulo}>Y después, ¿qué pasa con él?</h3>
          <ul className={styles.destinos}>
            {DESTINOS.map(({ Icono, titulo, texto }) => (
              <li key={titulo} className={`${styles.destino} reveal`}>
                <Icono className={styles.destinoIcono} />
                <h4>{titulo}</h4>
                <p>{texto}</p>
              </li>
            ))}
          </ul>
          <p className={styles.cobro}>Publicar es gratis. Cobramos una comisión solo si vendés.</p>
        </div>

        <div className={styles.checklist}>
          <h3 className={styles.subtitulo}>Antes de entregarlo</h3>
          <ul>
            {CHECKLIST.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <a href="#tasador" className={`btnLink ${styles.probalo}`}>
          Probalo con el tuyo ↓
        </a>
      </div>
    </section>
  );
}
