"use client";

import { useEffect, useMemo, useState } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";
import puntosData from "@/data/puntos-descarte.json";
import { useGeolocation } from "@/hooks/useGeolocation";
import type { TipoResiduo } from "@/lib/schemas";
import styles from "./MapaDescarte.module.css";

type Punto = {
  id: string;
  nombre: string;
  direccion: string;
  barrio?: string;
  lat: number;
  lng: number;
  tipos: TipoResiduo[];
  horario: string | null;
  verificar?: boolean;
};

const PUNTOS = puntosData as Punto[];
const CENTRO_CABA: [number, number] = [-34.6118, -58.4173];
const ZOOM_CABA = 12;

type Filtro = TipoResiduo | "todos";
const FILTROS: { valor: Filtro; etiqueta: string }[] = [
  { valor: "todos", etiqueta: "Todos" },
  { valor: "raee", etiqueta: "Electrónicos" },
  { valor: "pilas", etiqueta: "Pilas y baterías" },
];

function distanciaKm(a: [number, number], b: [number, number]) {
  const R = 6371;
  const rad = (x: number) => (x * Math.PI) / 180;
  const dLat = rad(b[0] - a[0]);
  const dLng = rad(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Link de ruta con los parámetros de Google Maps URLs (api=1). Sin origen, Maps arranca
 * desde la ubicación actual del teléfono; en el celular abre la app si está instalada.
 */
function urlRuta(destino: { lat: number; lng: number }, origen: [number, number] | null) {
  const params = new URLSearchParams({ api: "1", destination: `${destino.lat},${destino.lng}` });
  if (origen) params.set("origin", `${origen[0]},${origen[1]}`);
  return `https://www.google.com/maps/dir/?${params}`;
}

function LinkRuta({ punto, origen }: { punto: Punto; origen: [number, number] | null }) {
  return (
    <a
      href={urlRuta(punto, origen)}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.ruta}
      aria-label={`Cómo llegar a ${punto.nombre} en Google Maps (se abre en otra pestaña)`}
    >
      Cómo llegar ↗
    </a>
  );
}

function Recentrar({ lat, lng, zoom }: { lat: number; lng: number; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    const reducir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    map.setView([lat, lng], zoom, { animate: !reducir });
  }, [map, lat, lng, zoom]);
  return null;
}

export function MapaDescarte({ filtroInicial = "todos" }: { filtroInicial?: Filtro }) {
  const [filtro, setFiltro] = useState<Filtro>(filtroInicial);
  const geo = useGeolocation();

  const ubLat = geo.estado.tipo === "ok" ? geo.estado.lat : null;
  const ubLng = geo.estado.tipo === "ok" ? geo.estado.lng : null;
  const miUbicacion = useMemo<[number, number] | null>(
    () => (ubLat !== null && ubLng !== null ? [ubLat, ubLng] : null),
    [ubLat, ubLng],
  );

  const puntos = useMemo(() => {
    const filtrados = PUNTOS.filter((p) => filtro === "todos" || p.tipos.includes(filtro));
    if (!miUbicacion) return filtrados.map((p) => ({ ...p, km: null as number | null }));
    return filtrados
      .map((p) => ({ ...p, km: distanciaKm(miUbicacion, [p.lat, p.lng]) }))
      .sort((a, b) => (a.km ?? 0) - (b.km ?? 0));
  }, [filtro, miUbicacion]);

  const centro = miUbicacion ?? CENTRO_CABA;
  const zoom = miUbicacion ? 14 : ZOOM_CABA;
  const hayDatosDeEjemplo = PUNTOS.some((p) => p.verificar);

  return (
    <div className={styles.wrap}>
      <div className={styles.controles}>
        <div className={styles.filtros} role="group" aria-label="Filtrar por tipo de residuo">
          {FILTROS.map((f) => (
            <button
              key={f.valor}
              type="button"
              className={styles.chip}
              aria-pressed={filtro === f.valor}
              onClick={() => setFiltro(f.valor)}
            >
              {f.etiqueta}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="btn btnGhost btnSmall"
          onClick={geo.pedir}
          disabled={geo.estado.tipo === "buscando"}
        >
          {geo.estado.tipo === "buscando" ? "Buscando…" : "Usar mi ubicación"}
        </button>
      </div>
      {geo.estado.tipo === "error" && <p className={styles.nota}>{geo.estado.mensaje}</p>}
      {hayDatosDeEjemplo && (
        <p className={styles.notaEjemplo}>
          Puntos de ejemplo: todavía estamos cargando las direcciones reales.
        </p>
      )}

      <div className={styles.mapa}>
        <MapContainer center={CENTRO_CABA} zoom={ZOOM_CABA} scrollWheelZoom={false} className={styles.leaflet}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Recentrar lat={centro[0]} lng={centro[1]} zoom={zoom} />
          {puntos.map((p) => (
            <CircleMarker
              key={p.id}
              center={[p.lat, p.lng]}
              radius={9}
              pathOptions={{
                color: "#0f1b2d",
                weight: 2,
                fillColor: p.tipos.includes("raee") ? "#5abdcf" : "#85d463",
                fillOpacity: 0.95,
              }}
            >
              <Popup>
                <strong>{p.nombre}</strong>
                <br />
                {p.direccion}
                {p.horario && (
                  <>
                    <br />
                    {p.horario}
                  </>
                )}
                <br />
                <LinkRuta punto={p} origen={miUbicacion} />
              </Popup>
            </CircleMarker>
          ))}
          {miUbicacion && (
            <CircleMarker
              center={miUbicacion}
              radius={7}
              pathOptions={{ color: "#fff", weight: 3, fillColor: "#ff6b4a", fillOpacity: 1 }}
            >
              <Popup>Estás acá</Popup>
            </CircleMarker>
          )}
        </MapContainer>
      </div>

      <ul className={styles.lista} aria-label="Puntos de recolección">
        {puntos.map((p) => (
          <li key={p.id}>
            <span className={styles.listaNombre}>{p.nombre}</span>
            <span className={styles.listaDetalle}>
              {p.direccion}
              {p.horario ? ` · ${p.horario}` : ""}
              {p.km !== null ? ` · a ${p.km.toFixed(1).replace(".", ",")} km` : ""}
            </span>
            <LinkRuta punto={p} origen={miUbicacion} />
            <span className={styles.tipos}>
              {p.tipos.map((t) => (
                <span key={t} className={styles.tipo} data-tipo={t}>
                  {t === "raee" ? "Electrónicos" : "Pilas"}
                </span>
              ))}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
