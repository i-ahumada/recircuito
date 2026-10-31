"use client";

import { useState } from "react";
import { MapaDescarteLazy } from "./MapaDescarteLazy";

export function MapaPilasToggle() {
  const [visible, setVisible] = useState(false);

  if (!visible) {
    return (
      <button type="button" className="btn btnGhost" onClick={() => setVisible(true)}>
        Ver dónde dejarlas
      </button>
    );
  }
  return <MapaDescarteLazy filtroInicial="pilas" />;
}
