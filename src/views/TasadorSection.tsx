import { Tasador } from "./tasador/Tasador";
import styles from "./tasador/Tasador.module.css";

export function TasadorSection() {
  return (
    <section id="tasador" className={`section ${styles.section}`} aria-labelledby="tasador-title">
      <div className="container">
        <div className={styles.intro}>
          <span className="eyebrow">Tasador con IA</span>
          <h2 id="tasador-title" className="sectionTitle">
            ¿Cuánto vale lo que tenés guardado?
          </h2>
          <p className="sectionLead">
            Subí una foto, contestá dos o tres preguntas y te damos un rango de precio con un borrador para publicarlo.
            Si no tiene valor, te mostramos dónde dejarlo.
          </p>
        </div>
        <Tasador />
      </div>
    </section>
  );
}
