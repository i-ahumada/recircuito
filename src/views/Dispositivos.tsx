import Image from "next/image";
import styles from "./Dispositivos.module.css";

const CATEGORIAS = [
  { img: "cat-celular", nombre: "Celular", texto: "Smartphones y celulares viejos, aunque tengan la pantalla rota." },
  { img: "cat-notebook", nombre: "Notebook", texto: "Notebooks y computadoras, con o sin cargador." },
  { img: "cat-tablet", nombre: "Tablet", texto: "Tablets y lectores de libros electrónicos." },
  { img: "cat-consola", nombre: "Consola", texto: "Consolas, joysticks y accesorios de juego." },
  { img: "cat-monitor", nombre: "Monitor", texto: "Monitores y pantallas de computadora." },
  { img: "cat-otros", nombre: "Otros", texto: "Routers, placas, cargadores y otros electrónicos." },
];

const OTROS = [
  { nombre: "Accesorios y cargadores", texto: "Cargadores, cables, fuentes, mouse y teclados." },
  { nombre: "Audio", texto: "Auriculares, parlantes y equipos de música." },
  { nombre: "Pequeños electrodomésticos", texto: "Pavas eléctricas, secadores, licuadoras y similares." },
];

export function Dispositivos() {
  return (
    <section id="dispositivos" className={`section ${styles.section}`} aria-labelledby="dispositivos-title">
      <div className="container">
        <span className="eyebrow">Dispositivos</span>
        <h2 id="dispositivos-title" className="sectionTitle">
          ¿Qué podés publicar o descartar?
        </h2>
        <p className="sectionLead">
          Casi todo lo que se enchufa o lleva batería. Si sirve, se vende. Si no, te decimos dónde dejarlo.
        </p>

        <ul className={styles.grid}>
          {CATEGORIAS.map((c) => (
            <li key={c.img} className={`${styles.card} reveal`}>
              <Image
                src={`/img/${c.img}.webp`}
                alt={`${c.nombre} usado`}
                width={800}
                height={800}
                loading="lazy"
                sizes="(min-width: 900px) 30vw, (min-width: 560px) 45vw, 90vw"
                className={styles.img}
              />
              <h3>{c.nombre}</h3>
              <p>{c.texto}</p>
            </li>
          ))}
        </ul>

        <div className={styles.otros}>
          <h3>En «Otros» también entran</h3>
          <ul>
            {OTROS.map((o) => (
              <li key={o.nombre}>
                <strong>{o.nombre}.</strong> {o.texto}
              </li>
            ))}
          </ul>
          <p className={styles.pilas}>
            <strong>Pilas y baterías:</strong> no se venden, pero el tasador te muestra dónde dejarlas.{" "}
            <a href="#pilas">Ver más</a>
          </p>
        </div>
      </div>
    </section>
  );
}
