"use client";

import { useState } from "react";
import styles from "./Impacto.module.css";

// Peso aproximado por equipo, en kg.
const ITEMS = [
  { id: "celulares", nombre: "Celulares", kg: 0.18 },
  { id: "notebooks", nombre: "Notebooks", kg: 2.1 },
  { id: "tablets", nombre: "Tablets", kg: 0.5 },
  { id: "otros", nombre: "Otros", kg: 0.8 },
] as const;

type Id = (typeof ITEMS)[number]["id"];
const MAX = 50;

export function CalculadoraCajon() {
  const [cant, setCant] = useState<Record<Id, number>>({ celulares: 0, notebooks: 0, tablets: 0, otros: 0 });
  const kg = ITEMS.reduce((acc, it) => acc + cant[it.id] * it.kg, 0);
  const total = Object.values(cant).reduce((a, b) => a + b, 0);

  const cambiar = (id: Id, delta: number) =>
    setCant((c) => ({ ...c, [id]: Math.min(MAX, Math.max(0, c[id] + delta)) }));

  return (
    <div className={`${styles.calculadora} superficie`}>
      <h3>¿Cuánto hay en tu cajón?</h3>
      <ul className={styles.contadores}>
        {ITEMS.map((it) => (
          <li key={it.id}>
            <span className={styles.contadorNombre} id={`calc-${it.id}`}>
              {it.nombre}
            </span>
            <div className={styles.contador} role="group" aria-labelledby={`calc-${it.id}`}>
              <button
                type="button"
                onClick={() => cambiar(it.id, -1)}
                disabled={cant[it.id] === 0}
                aria-label={`Restar ${it.nombre.toLowerCase()}`}
              >
                −
              </button>
              <output aria-live="polite">{cant[it.id]}</output>
              <button
                type="button"
                onClick={() => cambiar(it.id, 1)}
                disabled={cant[it.id] === MAX}
                aria-label={`Sumar ${it.nombre.toLowerCase()}`}
              >
                +
              </button>
            </div>
          </li>
        ))}
      </ul>
      <p className={styles.calcResultado} aria-live="polite">
        {total === 0 ? (
          "Sumá lo que tenés guardado."
        ) : (
          <>
            Son <strong>{kg.toLocaleString("es-AR", { maximumFractionDigits: 1 })} kg</strong> de electrónica que
            vuelven a servir en lugar de terminar en la basura.
          </>
        )}
      </p>
      <a href="#tasador" className="btn btnPrimario">
        Tasá el primero
      </a>
    </div>
  );
}
