// Convierte el CSV de Puntos Verdes de data.buenosaires.gob.ar al formato del mapa.
// Uso: node scripts/importar-puntos-verdes.mjs [ruta.csv]
import { readFile, writeFile } from "node:fs/promises";

const ENTRADA = process.argv[2] ?? "src/data/ba_residuos/puntos_verdes.csv";
const SALIDA = "src/data/puntos-descarte.json";

/** Parser CSV mínimo: comillas dobles, comas y saltos de línea dentro de campos. */
function parseCsv(texto) {
  const filas = [];
  let fila = [];
  let campo = "";
  let comillas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (comillas) {
      if (c === '"' && texto[i + 1] === '"') {
        campo += '"';
        i++;
      } else if (c === '"') comillas = false;
      else campo += c;
    } else if (c === '"') comillas = true;
    else if (c === ",") {
      fila.push(campo);
      campo = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && texto[i + 1] === "\n") i++;
      fila.push(campo);
      if (fila.some((f) => f !== "")) filas.push(fila);
      fila = [];
      campo = "";
    } else campo += c;
  }
  if (campo || fila.length) filas.push([...fila, campo]);
  const [cabecera, ...resto] = filas;
  return resto.map((f) => Object.fromEntries(cabecera.map((h, i) => [h.trim(), (f[i] ?? "").trim()])));
}

const texto = (await readFile(ENTRADA, "utf8")).replace(/^﻿/, "");
const puntos = parseCsv(texto).flatMap((r) => {
  const m = r.geometry.match(/POINT \(([-\d.]+) ([-\d.]+)\)/);
  if (!m) return [];
  const materiales = r.materiales.toLowerCase();
  const tipos = [];
  if (materiales.includes("raee")) tipos.push("raee");
  if (materiales.includes("pilas")) tipos.push("pilas");
  if (tipos.length === 0) return [];
  return [
    {
      id: `punto-verde-${r.id}`,
      nombre: `Punto Verde ${r.nombre}`,
      direccion: r.direccion,
      barrio: r.barrio,
      lat: Number(Number(m[2]).toFixed(6)),
      lng: Number(Number(m[1]).toFixed(6)),
      tipos,
      horario: r.horario.replace(/^Horario de atención\s*/i, "").replace(/\.$/, "") || null,
      verificar: false,
    },
  ];
});

await writeFile(SALIDA, JSON.stringify(puntos, null, 2) + "\n");
console.log(`${puntos.length} puntos → ${SALIDA}`);
