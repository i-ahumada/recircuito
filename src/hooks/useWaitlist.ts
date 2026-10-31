"use client";

import { useState } from "react";
import type { WaitlistRequest } from "@/lib/schemas";
import { ApiError } from "@/services/apiClient";
import { sumarseAWaitlist } from "@/services/waitlistService";

type Estado = { tipo: "inicial" } | { tipo: "enviando" } | { tipo: "exito" } | { tipo: "error"; mensaje: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function useWaitlist() {
  const [estado, setEstado] = useState<Estado>({ tipo: "inicial" });

  async function enviar(datos: WaitlistRequest) {
    if (!EMAIL_RE.test(datos.email)) {
      setEstado({ tipo: "error", mensaje: "Revisá el email, parece que le falta algo." });
      return;
    }
    setEstado({ tipo: "enviando" });
    try {
      await sumarseAWaitlist(datos);
      setEstado({ tipo: "exito" });
    } catch (err) {
      setEstado({
        tipo: "error",
        mensaje: err instanceof ApiError ? err.message : "No pudimos anotarte. Probá de nuevo.",
      });
    }
  }

  return { estado, enviar };
}
