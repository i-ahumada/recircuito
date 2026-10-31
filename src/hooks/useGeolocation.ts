"use client";

import { useState } from "react";

type Estado =
  | { tipo: "inicial" }
  | { tipo: "buscando" }
  | { tipo: "ok"; lat: number; lng: number }
  | { tipo: "error"; mensaje: string };

export function useGeolocation() {
  const [estado, setEstado] = useState<Estado>({ tipo: "inicial" });

  function pedir() {
    if (!("geolocation" in navigator)) {
      setEstado({ tipo: "error", mensaje: "Tu navegador no comparte la ubicación. Te mostramos todos los puntos." });
      return;
    }
    setEstado({ tipo: "buscando" });
    navigator.geolocation.getCurrentPosition(
      (pos) => setEstado({ tipo: "ok", lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setEstado({ tipo: "error", mensaje: "No tenemos permiso para ver tu ubicación. Te mostramos todos los puntos." }),
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 },
    );
  }

  return { estado, pedir };
}
