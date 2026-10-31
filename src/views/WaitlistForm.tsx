"use client";

import Image from "next/image";
import { useId, useState, type FormEvent } from "react";
import { useWaitlist } from "@/hooks/useWaitlist";
import type { Origen } from "@/lib/schemas";
import styles from "./WaitlistForm.module.css";

type Props = {
  origen: Origen;
  /** Texto del botón */
  cta?: string;
  /** Datos de la tasación que viajan junto con el email */
  dispositivo?: string;
  rango?: string;
  /** Pide checkbox de aceptación (formulario del tasador) */
  conAceptacion?: boolean;
  /** Fondo oscuro (footer) */
  tono?: "claro" | "oscuro";
};

export function WaitlistForm({
  origen,
  cta = "Sumarme",
  dispositivo,
  rango,
  conAceptacion = false,
  tono = "claro",
}: Props) {
  const { estado, enviar } = useWaitlist();
  const [email, setEmail] = useState("");
  const [acepta, setAcepta] = useState(false);
  const id = useId();

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (conAceptacion && !acepta) return;
    void enviar({ email: email.trim(), origen, dispositivo, rango, ...(conAceptacion ? { acepta: true } : {}) });
  }

  if (estado.tipo === "exito") {
    return (
      <div className={styles.exito} data-tono={tono} role="status">
        <Image
          src="/img/gracias-lista-espera.webp"
          alt="Celular esperando con un brote verde"
          width={200}
          height={200}
          loading="lazy"
          className={`${styles.exitoImg} fundido`}
        />
        <p className={styles.exitoTexto}>¡Listo! Te avisamos cuando lancemos.</p>
      </div>
    );
  }

  const enviando = estado.tipo === "enviando";
  const errorId = `${id}-error`;

  return (
    <form className={styles.form} data-tono={tono} onSubmit={onSubmit} noValidate>
      <div className={styles.fila}>
        <label htmlFor={`${id}-email`} className="visuallyHidden">
          Tu email
        </label>
        <input
          id={`${id}-email`}
          type="email"
          name="email"
          inputMode="email"
          autoComplete="email"
          placeholder="tu@email.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.input}
          aria-invalid={estado.tipo === "error"}
          aria-describedby={estado.tipo === "error" ? errorId : undefined}
        />
        <button
          type="submit"
          className={`btn btnSecundario ${styles.boton}`}
          disabled={enviando || (conAceptacion && !acepta)}
          aria-busy={enviando}
        >
          {enviando ? "Enviando…" : cta}
        </button>
      </div>

      {conAceptacion && (
        <label className={styles.check}>
          <input type="checkbox" checked={acepta} onChange={(e) => setAcepta(e.target.checked)} required />
          <span>Acepto que ReCircuito guarde mi email y este dispositivo tasado para avisarme cuando lancemos.</span>
        </label>
      )}

      <p className={styles.mensaje} aria-live="polite">
        {estado.tipo === "error" ? (
          <span id={errorId} className={styles.error}>
            {estado.mensaje}
          </span>
        ) : (
          <span className={styles.nota}>Sin spam. Solo te escribimos para el lanzamiento.</span>
        )}
      </p>
    </form>
  );
}
