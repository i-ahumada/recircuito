"use client";

import { useId, useState } from "react";
import type { Borrador } from "@/lib/schemas";
import styles from "./Tasador.module.css";

const CATEGORIAS = ["celular", "notebook", "tablet", "consola", "monitor", "accesorio", "audio", "otro"];
const ESTADOS = [
  "Funciona perfecto",
  "Detalles estéticos",
  "Pantalla rota o falla parcial",
  "No enciende (valor de repuestos)",
];

export function BorradorEditable({ inicial }: { inicial: Borrador }) {
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
