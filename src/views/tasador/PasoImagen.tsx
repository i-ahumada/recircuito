"use client";

/* eslint-disable @next/next/no-img-element -- la vista previa es un blob local, next/image no aplica */
import { useRef, useState, type DragEvent } from "react";
import { ACCEPT_ATTR, type useImageUpload } from "@/hooks/useImageUpload";
import { useEsTactil } from "@/hooks/useEsTactil";
import styles from "./Tasador.module.css";

type Props = {
  estado: ReturnType<typeof useImageUpload>["estado"];
  onArchivo: (file: File | undefined) => void;
  onCambiar: () => void;
  onTasar: (base64: string) => void;
};

export function PasoImagen({ estado, onArchivo, onCambiar, onTasar }: Props) {
  const esTactil = useEsTactil();
  const subirRef = useRef<HTMLInputElement>(null);
  const camaraRef = useRef<HTMLInputElement>(null);
  const [arrastrando, setArrastrando] = useState(false);

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setArrastrando(false);
    onArchivo(e.dataTransfer.files[0]);
  }

  return (
    <div className={styles.pasoImagen}>
      <h3 className={styles.pasoTitulo}>Paso 1: la foto</h3>

      {estado.tipo === "lista" ? (
        <div className={styles.preview}>
          <img src={estado.previewUrl} alt="Vista previa de la foto que vas a tasar" />
          <div className={styles.acciones}>
            <button type="button" className="btn btnCoral" onClick={() => onTasar(estado.base64)}>
              Tasar esta foto
            </button>
            <button type="button" className="btn btnGhost" onClick={onCambiar}>
              Cambiar foto
            </button>
          </div>
        </div>
      ) : (
        <div
          className={styles.dropzone}
          data-arrastrando={arrastrando}
          onDragOver={(e) => {
            e.preventDefault();
            setArrastrando(true);
          }}
          onDragLeave={() => setArrastrando(false)}
          onDrop={onDrop}
        >
          <svg className={styles.dropIcon} viewBox="0 0 48 48" aria-hidden="true">
            <rect x="6" y="12" width="36" height="28" rx="6" fill="none" stroke="currentColor" strokeWidth="2.5" />
            <path d="M17 12l3-5h8l3 5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
            <circle cx="24" cy="26" r="7" fill="none" stroke="currentColor" strokeWidth="2.5" />
          </svg>
          <p className={styles.dropTexto}>
            {estado.tipo === "comprimiendo" ? "Preparando la imagen…" : "Arrastrá una foto acá o elegila de tus archivos"}
          </p>
          <p className={styles.dropFormatos}>JPG, PNG o WEBP</p>

          <div className={styles.acciones}>
            <button
              type="button"
              className="btn btnCoral"
              onClick={() => subirRef.current?.click()}
              disabled={estado.tipo === "comprimiendo"}
            >
              Subir imagen
            </button>
            {esTactil && (
              <button
                type="button"
                className="btn btnGhost"
                onClick={() => camaraRef.current?.click()}
                disabled={estado.tipo === "comprimiendo"}
              >
                Sacar foto
              </button>
            )}
          </div>

          <input
            ref={subirRef}
            type="file"
            accept={ACCEPT_ATTR}
            className="visuallyHidden"
            tabIndex={-1}
            aria-hidden="true"
            onChange={(e) => {
              onArchivo(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          {esTactil && (
            <input
              ref={camaraRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="visuallyHidden"
              tabIndex={-1}
              aria-hidden="true"
              onChange={(e) => {
                onArchivo(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          )}
        </div>
      )}

      {estado.tipo === "error" && (
        <p className={styles.errorInline} role="alert">
          {estado.mensaje}
        </p>
      )}

      <p className={styles.aviso}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3l9 16H3z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <path d="M12 10v4M12 17v.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        No subas fotos con datos personales.
      </p>
    </div>
  );
}
