"use client";

import { useId, useState } from "react";
import type { Borrador } from "@/lib/schemas";
import { formatoARS, formatoRango } from "./formato";
import styles from "./Tasador.module.css";

const CATEGORIAS = ["celular", "notebook", "tablet", "consola", "monitor", "accesorio", "audio", "otro"];
const ESTADOS = [
  "Funciona perfecto",
  "Detalles estéticos",
  "Pantalla rota o falla parcial",
  "No enciende (valor de repuestos)",
];

type Props = {
  inicial: Borrador;
  /** Rango estimado por el tasador; null si el equipo no tiene precio de referencia. */
  rango: { minARS: number; maxARS: number } | null;
  precio: number | null;
  onPrecio: (precio: number | null) => void;
};

export function BorradorEditable({ inicial, rango, precio, onPrecio }: Props) {
  const [borrador, setBorrador] = useState(inicial);
  const id = useId();
  const set = (campo: keyof Borrador) => (e: { target: { value: string } }) =>
    setBorrador((b) => ({ ...b, [campo]: e.target.value }));

  const categorias = CATEGORIAS.includes(borrador.categoria) ? CATEGORIAS : [borrador.categoria, ...CATEGORIAS];
  const estados = ESTADOS.includes(borrador.estado) ? ESTADOS : [borrador.estado, ...ESTADOS];

  return (
    <section className={styles.borrador} aria-labelledby={`${id}-titulo`}>
      <h3 id={`${id}-titulo`}>Tu borrador de publicación</h3>
      <p className={styles.borradorNota}>Editalo como quieras. Lo vas a poder publicar cuando lancemos.</p>

      <div className={styles.campo}>
        <label htmlFor={`${id}-t`}>Título</label>
        <input id={`${id}-t`} value={borrador.titulo} onChange={set("titulo")} maxLength={80} />
      </div>
      <div className={styles.campo}>
        <label htmlFor={`${id}-d`}>Descripción</label>
        <textarea id={`${id}-d`} value={borrador.descripcion} onChange={set("descripcion")} rows={5} maxLength={600} />
      </div>
      <div className={styles.campo}>
        <label htmlFor={`${id}-p`}>Precio de publicación</label>
        <div className={styles.precioInput}>
          <span aria-hidden="true">$</span>
          <input
            id={`${id}-p`}
            type="number"
            inputMode="numeric"
            min={0}
            step={1000}
            value={precio ?? ""}
            placeholder="Ej.: 150000"
            aria-describedby={`${id}-p-ayuda`}
            onChange={(e) => {
              const n = e.target.valueAsNumber;
              onPrecio(Number.isFinite(n) && n >= 0 ? Math.round(n) : null);
            }}
          />
        </div>
        <p id={`${id}-p-ayuda`} className={styles.campoAyuda}>
          {rango
            ? `Lo elegís vos. Estimamos entre ${formatoRango(rango.minARS, rango.maxARS)}.`
            : "Lo elegís vos: no tenemos datos de mercado para este equipo."}
          {rango && precio !== null && precio > rango.maxARS && " Por encima del rango puede tardar más en venderse."}
          {rango && precio !== null && precio > 0 && precio < rango.minARS && ` Está por debajo de lo estimado (${formatoARS(rango.minARS)}).`}
        </p>
      </div>
      <div className={styles.campos2}>
        <div className={styles.campo}>
          <label htmlFor={`${id}-c`}>Categoría</label>
          <select id={`${id}-c`} value={borrador.categoria} onChange={set("categoria")}>
            {categorias.map((c) => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.campo}>
          <label htmlFor={`${id}-e`}>Estado</label>
          <select id={`${id}-e`} value={borrador.estado} onChange={set("estado")}>
            {estados.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}
