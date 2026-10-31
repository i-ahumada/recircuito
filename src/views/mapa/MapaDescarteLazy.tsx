"use client";

import dynamic from "next/dynamic";
import styles from "./MapaDescarte.module.css";

/** Leaflet necesita window: se carga solo en el navegador. */
export const MapaDescarteLazy = dynamic(() => import("./MapaDescarte").then((m) => m.MapaDescarte), {
  ssr: false,
  loading: () => (
    <div className={styles.cargando} role="status">
      Cargando el mapa…
    </div>
  ),
});
