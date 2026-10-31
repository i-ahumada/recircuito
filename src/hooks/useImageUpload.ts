"use client";

import imageCompression from "browser-image-compression";
import { useCallback, useEffect, useState } from "react";

export const FORMATOS_ACEPTADOS = ["image/jpeg", "image/png", "image/webp"];
export const ACCEPT_ATTR = ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp";

type Estado =
  | { tipo: "vacio" }
  | { tipo: "comprimiendo" }
  | { tipo: "lista"; previewUrl: string; base64: string }
  | { tipo: "error"; mensaje: string };

function aBase64(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function mensajeFormato(file: File): string {
  const nombre = file.name.toLowerCase();
  if (file.type.includes("heic") || file.type.includes("heif") || /\.(heic|heif)$/.test(nombre)) {
    return "Esa foto está en formato HEIC (el de los iPhone). Subila en JPG, PNG o WEBP. En el iPhone podés elegir «Más compatible» en Ajustes › Cámara › Formatos.";
  }
  return "Ese formato no lo podemos leer. Subí una imagen JPG, PNG o WEBP.";
}

/** Valida, comprime en el navegador y deja lista la imagen en base64. Nada se guarda en disco. */
export function useImageUpload() {
  const [estado, setEstado] = useState<Estado>({ tipo: "vacio" });

  const previewUrl = estado.tipo === "lista" ? estado.previewUrl : null;
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const cargar = useCallback(async (file: File | undefined) => {
    if (!file) return;
    if (!FORMATOS_ACEPTADOS.includes(file.type)) {
      setEstado({ tipo: "error", mensaje: mensajeFormato(file) });
      return;
    }
    setEstado({ tipo: "comprimiendo" });
    try {
      const comprimido = await imageCompression(file, {
        maxWidthOrHeight: 1024,
        maxSizeMB: 1,
        fileType: "image/jpeg",
        useWebWorker: true,
      });
      const base64 = await aBase64(comprimido);
      setEstado({ tipo: "lista", previewUrl: URL.createObjectURL(comprimido), base64 });
    } catch {
      setEstado({ tipo: "error", mensaje: "No pudimos procesar la imagen. Probá con otra." });
    }
  }, []);

  const reiniciar = useCallback(() => setEstado({ tipo: "vacio" }), []);

  return { estado, cargar, reiniciar };
}
