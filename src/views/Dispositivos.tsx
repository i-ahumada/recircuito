import Image from "next/image";
import { desdePorCategoria, formatoPesos } from "@/lib/referenciasPublicas";
import { Carrusel } from "./Carrusel";
import { Eyebrow } from "./Eyebrow";
import styles from "./Dispositivos.module.css";
import { IconoPila } from "./iconos";

const CATEGORIAS = [
  { img: "cat-celular", nombre: "Celular", categoria: "celular", texto: "Aunque tenga la pantalla rota o no prenda." },
  {
    img: "cat-notebook",
    nombre: "Notebook",
    categoria: "notebook",
    texto: "Con o sin cargador, aunque esté lenta o con la batería agotada.",
  },
  { img: "cat-tablet", nombre: "Tablet", categoria: "tablet", texto: "Tablets y lectores de libros electrónicos." },
  { img: "cat-consola", nombre: "Consola", categoria: "consola", texto: "Consolas, joysticks y accesorios." },
  { img: "cat-monitor", nombre: "Monitor", categoria: "monitor", texto: "Monitores y pantallas de computadora." },
  {
    img: "cat-otros",
    nombre: "Otros",
    categoria: "otros",
    texto: "Routers, placas, cargadores y lo que no sabés dónde poner.",
  },
];

const OTROS = ["Cargadores y cables", "Mouse y teclados", "Auriculares", "Parlantes", "Pequeños electrodomésticos"];

export function Dispositivos() {
  return (
    <section id="dispositivos" className="section" aria-labelledby="dispositivos-title">
      <div className="container">
        <div className={styles.cabecera}>
          <div>
            <Eyebrow>03 · Qué entra</Eyebrow>
            <h2 id="dispositivos-title" className="sectionTitle">
              ¿Qué podés tasar?
            </h2>
          </div>
          <p className={styles.lead}>
            Casi todo lo que se enchufa o lleva batería. Si sirve, se vende. Si no, te mostramos dónde dejarlo.
          </p>
        </div>

        <Carrusel etiqueta="Categorías de dispositivos">
          {CATEGORIAS.map((c) => {
            const desde = desdePorCategoria(c.categoria);
            return (
              <li key={c.img} className={styles.item}>
                <div className={styles.imgWrap}>
                  <Image
                    src={`/img/${c.img}.webp`}
                    alt={`${c.nombre} usado`}
                    width={800}
                    height={800}
                    loading="lazy"
                    sizes="(min-width: 1000px) 18vw, (min-width: 640px) 30vw, 46vw"
                    className={`${styles.img} fundido`}
                  />
                </div>
                <h3>{c.nombre}</h3>
                <p>{c.texto}</p>
                {desde !== null && <span className={styles.dato}>Desde {formatoPesos(desde)}</span>}
              </li>
            );
          })}
        </Carrusel>

        <div className={styles.otros}>
          <span className={styles.otrosLabel}>También entran:</span>
          <ul>
            {OTROS.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        </div>

        <p className={styles.pilas}>
          <IconoPila className={styles.pilasIcono} />
          <span>
            Las pilas y baterías sueltas no se venden, pero tampoco van a la basura.{" "}
            <a href="#pilas" className="btnLink">
              Ver dónde dejarlas →
            </a>
          </span>
        </p>
      </div>
    </section>
  );
}
