/* eslint-disable @next/next/no-img-element -- vista previa local */
import type { Analisis } from "@/lib/schemas";
import styles from "./Tasador.module.css";

type Props = {
  analisis: Analisis;
  respuestas: Record<string, string>;
  previewUrl: string | null;
  onResponder: (preguntaId: string, opcionId: string) => void;
  onContinuar: () => void;
  onCambiarFoto: () => void;
};

export function PasoPreguntas({ analisis, respuestas, previewUrl, onResponder, onContinuar, onCambiarFoto }: Props) {
  const completas = analisis.preguntas.every((p) => respuestas[p.id]);
  const nombre = [analisis.marca, analisis.modelo].filter(Boolean).join(" ");

  return (
    <div className={styles.pasoPreguntas}>
      <div className={styles.detectado}>
        {previewUrl && <img src={previewUrl} alt="" className={styles.detectadoImg} />}
        <div>
          <p className={styles.detectadoLabel}>Detectamos</p>
          <h3 className={styles.detectadoTitulo}>
            {analisis.tipoDispositivo}
            {nombre && <span> · {nombre}</span>}
          </h3>
          <p className={styles.detectadoDesc}>{analisis.descripcion}</p>
          <button type="button" className={styles.linkBtn} onClick={onCambiarFoto}>
            No es esto, probar con otra foto
          </button>
        </div>
      </div>

      <form
        className={styles.preguntas}
        onSubmit={(e) => {
          e.preventDefault();
          if (completas) onContinuar();
        }}
      >
        {analisis.preguntas.map((p, i) => (
          <fieldset key={p.id} className={styles.pregunta}>
            <legend>
              <span className={styles.preguntaNum}>{i + 1}</span>
              {p.texto}
            </legend>
            <div className={styles.opciones}>
              {p.opciones.map((o) => (
                <label key={o.id} className={styles.opcion}>
                  <input
                    type="radio"
                    name={p.id}
                    value={o.id}
                    checked={respuestas[p.id] === o.id}
                    onChange={() => onResponder(p.id, o.id)}
                  />
                  <span>{o.texto}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}

        <div className={styles.acciones}>
          <button type="submit" className="btn btnPrimario" disabled={!completas}>
            Ver cuánto vale
          </button>
          {!completas && <span className={styles.hint}>Contestá todas las preguntas para seguir.</span>}
        </div>
      </form>
    </div>
  );
}
