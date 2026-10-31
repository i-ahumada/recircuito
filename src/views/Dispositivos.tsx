import { desdePorCategoria, formatoPesos } from "@/lib/referenciasPublicas";
import { CAJAS } from "./cajas";
import { Carrusel } from "./Carrusel";
import styles from "./Dispositivos.module.css";
import { Eyebrow } from "./Eyebrow";
import { IconoPila } from "./iconos";
import { MapaPilasToggle } from "./mapa/MapaPilasToggle";
import { Recorte } from "./Recorte";

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
            <Eyebrow>05 · Qué entra</Eyebrow>
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
              <li key={c.img} className={`${styles.item} superficie`}>
                <Recorte
                  src={`/img/${c.img}.webp`}
                  alt={`${c.nombre} usado`}
                  width={800}
                  height={800}
                  caja={CAJAS.categoria}
                  sizes="(min-width: 1000px) 20vw, (min-width: 640px) 34vw, 55vw"
                  className={styles.img}
                />
                <div className={styles.cuerpo}>
                  <h3>{c.nombre}</h3>
                  <p>{c.texto}</p>
                  {desde !== null && <span className={styles.dato}>Desde {formatoPesos(desde)}</span>}
                </div>
              </li>
            );
          })}
          <li className={styles.itemPilas}>
            <a href="#pilas" className={`${styles.pilas} superficie`}>
              <span className={styles.pilasIconoWrap}>
                <IconoPila className={styles.pilasIcono} />
              </span>
              <span className={styles.cuerpo}>
                <span className={styles.pilasTitulo}>Pilas y baterías</span>
                <span className={styles.pilasTexto}>No se venden, pero tampoco van a la basura.</span>
                <span className={`btn btnGhost btnSmall ${styles.pilasBoton}`}>Ver dónde dejarlas</span>
              </span>
            </a>
          </li>
        </Carrusel>

        <div className={styles.otros}>
          <span className={styles.otrosLabel}>También entran:</span>
          <ul>
            {OTROS.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        </div>

        <div id="pilas" className={`${styles.pilasBloque} superficie`}>
          <h3>¿Y las pilas?</h3>
          <p>
            Las pilas y baterías no se venden, pero contaminan el suelo y el agua si van a la basura común. Mirá en el
            mapa dónde dejarlas.
          </p>
          <MapaPilasToggle />
        </div>
      </div>
    </section>
  );
}
