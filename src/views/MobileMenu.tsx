"use client";

import { useEffect, useId, useState } from "react";
import styles from "./MobileMenu.module.css";

type Props = { items: { href: string; label: string }[] };

export function MobileMenu({ items }: Props) {
  const [abierto, setAbierto] = useState(false);
  const id = useId();

  useEffect(() => {
    if (!abierto) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [abierto]);

  const cerrar = () => setAbierto(false);

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={styles.toggle}
        aria-expanded={abierto}
        aria-controls={id}
        onClick={() => setAbierto((a) => !a)}
      >
        <span className="visuallyHidden">{abierto ? "Cerrar menú" : "Abrir menú"}</span>
        <span className={styles.bars} data-open={abierto} aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </button>
      <nav id={id} className={styles.panel} data-open={abierto} aria-label="Menú" hidden={!abierto}>
        <ul>
          {items.map((item) => (
            <li key={item.href}>
              <a href={item.href} onClick={cerrar}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
        <a href="#tasador" className="btn btnPrimario" onClick={cerrar}>
          Tasá tu dispositivo
        </a>
      </nav>
    </div>
  );
}
