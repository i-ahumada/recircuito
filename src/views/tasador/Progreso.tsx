/* eslint-disable @next/next/no-img-element -- vista previa local */
import styles from "./Tasador.module.css";

export function Progreso({ mensaje, previewUrl }: { mensaje: string; previewUrl: string | null }) {
  return (
    <div className={styles.progreso}>
      {previewUrl && <img src={previewUrl} alt="" className={styles.progresoImg} />}
      <div className={styles.spinner} aria-hidden="true" />
      <p role="status" aria-live="polite" className={styles.progresoTexto}>
        {mensaje}
      </p>
    </div>
  );
}
