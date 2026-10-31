import { formatoPesos, mesActualizacion, referenciasVerificadas } from "@/lib/referenciasPublicas";
import { Eyebrow } from "./Eyebrow";
import { CierreImagen } from "./tasador/CierreImagen";
import { Tasador } from "./tasador/Tasador";
import styles from "./tasador/Tasador.module.css";

export function TasadorSection() {
  const precios = referenciasVerificadas();
  const mes = mesActualizacion();

  return (
    <section id="tasador" className="section" aria-labelledby="tasador-title">
      <div className="container">
        <div className={styles.intro}>
          <Eyebrow>04 · Probalo con el tuyo</Eyebrow>
          <h2 id="tasador-title" className={styles.cierreTitulo}>
            Abrí el cajón. Empezá por uno.
          </h2>
          <p className="sectionLead">
            Subí una foto, respondé dos o tres preguntas y en un minuto sabés cuánto vale, con la publicación ya
            redactada. Si no vale nada, te decimos dónde dejarlo.
          </p>
        </div>

        {precios.length > 0 && (
          <div className={styles.precios}>
            <h3 className={styles.preciosTitulo}>Lo que se está pagando hoy</h3>
            <ul className={styles.preciosFila}>
              {precios.map((p) => (
                <li key={p.id} className={styles.precioCard}>
                  <span className={styles.precioNombre}>{p.nombre}</span>
                  <span className={styles.precioHasta}>Hasta {formatoPesos(p.precioReferenciaARS)}</span>
                </li>
              ))}
            </ul>
            <p className={styles.preciosNota}>
              Referencias de publicaciones reales en Buenos Aires.{mes ? ` Actualizado en ${mes}.` : ""}
            </p>
          </div>
        )}

        <div className={styles.cierreGrid}>
          <div className={styles.cardWrap}>
            <span className={`nodo railNodo ${styles.cardNodo}`} data-hilo-nodo="tasador" aria-hidden="true" />
            <Tasador />
          </div>
          <CierreImagen />
        </div>

        <p className={styles.todaviaNo}>
          ¿Todavía no?{" "}
          <a href="#lista-espera" className="btnLink">
            Avisame cuando abra el marketplace →
          </a>
        </p>
      </div>
    </section>
  );
}
