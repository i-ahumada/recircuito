/* eslint-disable @next/next/no-img-element -- vista previa local */
import styles from "./Tasador.module.css";

// Puntos que se encienden sobre la foto mientras se analiza, en %.
const PUNTOS = [
  { x: 28, y: 30 },
  { x: 70, y: 22 },
  { x: 62, y: 68 },
  { x: 34, y: 76 },
];

export function Progreso({ mensaje, previewUrl }: { mensaje: string; previewUrl: string | null }) {
  return (
    <div className={styles.progreso}>
      {previewUrl ? (
        <div className={styles.escaneo} aria-hidden="true">
          <img src={previewUrl} alt="" />
          <span className={styles.escaneoLinea} />
          {PUNTOS.map((p, i) => (
            <span
              key={i}
              className={styles.escaneoPunto}
              style={{ left: `${p.x}%`, top: `${p.y}%`, animationDelay: `${i * 0.45}s` }}
            />
          ))}
        </div>
      ) : (
        <div className={styles.spinner} aria-hidden="true" />
      )}
      <p role="status" aria-live="polite" className={styles.progresoTexto}>
        {mensaje}
      </p>
    </div>
  );
}
