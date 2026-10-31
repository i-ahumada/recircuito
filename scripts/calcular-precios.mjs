// Calcula precios de referencia a partir de publicaciones extraídas y actualiza
// src/data/precios-referencia.json. Método: precio por unidad, si hay 5 o más se
// descartan el más caro y el más barato, y se usa la mediana.
// Uso: node scripts/calcular-precios.mjs [listings.json]
import { readFile, writeFile } from "node:fs/promises";

const ENTRADA = process.argv[2] ?? "src/data/precios/listings-todos.json";
const SALIDA = "src/data/precios-referencia.json";
/** Por debajo de esta cantidad la entrada queda con "verificar": true. */
const MUESTRAS_CONFIABLES = 5;
/** Una entrada de modelo puntual necesita al menos esta cantidad de publicaciones. */
const MUESTRAS_MINIMAS = 2;

const GAMA_BAJA = [/galaxy a0\d/i, /galaxy j\d/i, /moto g\d\b/i, /moto g7/i];
const GAMA_MEDIA = [/galaxy a5\d/i, /galaxy s9/i];

const GRUPOS = [
  {
    id: "celular-basico-teclas",
    categoria: "celular",
    nombre: "Celular básico de teclas (Nokia y similares)",
    palabrasClave: ["nokia", "celular de teclas", "celular básico", "asha"],
    match: (l) => l.marca === "Nokia" || /nokia/i.test(l.modelo),
  },
  {
    id: "celular-gama-baja-generico",
    categoria: "celular",
    nombre: "Celular gama baja genérico",
    palabrasClave: ["celular", "android", "motorola e", "moto g", "samsung a0", "xiaomi redmi a"],
    match: (l) => GAMA_BAJA.some((re) => re.test(l.modelo)),
  },
  {
    id: "celular-gama-media-generico",
    categoria: "celular",
    nombre: "Celular gama media genérico",
    palabrasClave: ["celular", "android", "samsung a5", "redmi note", "moto g"],
    match: (l) => GAMA_MEDIA.some((re) => re.test(l.modelo)),
  },
  {
    id: "samsung-galaxy-a04-128",
    categoria: "celular",
    nombre: "Samsung Galaxy A04 128 GB",
    palabrasClave: ["samsung", "galaxy a04", "a04"],
    match: (l) => /galaxy a04/i.test(l.modelo),
  },
  {
    id: "samsung-galaxy-a55-5g",
    categoria: "celular",
    nombre: "Samsung Galaxy A55 5G",
    palabrasClave: ["samsung", "galaxy a55", "a55"],
    match: (l) => /galaxy a55/i.test(l.modelo),
  },
  {
    id: "samsung-galaxy-a54-5g",
    categoria: "celular",
    nombre: "Samsung Galaxy A54 5G",
    palabrasClave: ["samsung", "galaxy a54", "a54"],
    match: (l) => /galaxy a54/i.test(l.modelo),
  },
];

// El precio de referencia es de un equipo usado y funcionando.
const ESTADOS_VALIDOS = new Set(["usado", "usado_buen_estado", "usado_como_nuevo", "usado_con_detalles"]);
// Alertas que indican una publicación dudosa (posible estafa o precio que no es real).
const ALERTAS_DESCARTE = [/precio muy por debajo/i, /fotos oficiales/i, /moneda .* ambigua/i];

function utilizable(l) {
  return (
    l.precio_valido &&
    l.precio_ars > 0 &&
    ESTADOS_VALIDOS.has(l.estado) &&
    !(l.alertas ?? []).some((a) => ALERTAS_DESCARTE.some((re) => re.test(a)))
  );
}

function mediana(nums) {
  const s = [...nums].sort((a, b) => a - b);
  const recortado = s.length >= 5 ? s.slice(1, -1) : s;
  const m = Math.floor(recortado.length / 2);
  return recortado.length % 2 ? recortado[m] : (recortado[m - 1] + recortado[m]) / 2;
}

const listings = JSON.parse(await readFile(ENTRADA, "utf8"));
const referencias = JSON.parse(await readFile(SALIDA, "utf8"));
const hoy = new Date().toISOString().slice(0, 10);

for (const g of GRUPOS) {
  const usados = listings.filter((l) => g.match(l) && utilizable(l));
  const esGenerico = g.id.endsWith("-generico") || g.id === "celular-basico-teclas";
  if (usados.length < (esGenerico ? 1 : MUESTRAS_MINIMAS)) {
    console.log(`- ${g.id}: ${usados.length} publicaciones, no alcanza`);
    continue;
  }
  const precios = usados.map((l) => Math.round(l.precio_ars / Math.max(1, l.cantidad ?? 1)));
  const precio = Math.round(mediana(precios) / 500) * 500;
  const fechas = usados.map((l) => l.publicado_aprox).filter(Boolean).sort();
  const entrada = {
    id: g.id,
    categoria: g.categoria,
    nombre: g.nombre,
    palabrasClave: g.palabrasClave,
    precioReferenciaARS: precio,
    muestras: usados.length,
    actualizado: fechas.at(-1) ?? hoy,
    verificar: usados.length < MUESTRAS_CONFIABLES,
  };
  const i = referencias.findIndex((r) => r.id === g.id);
  if (i >= 0) referencias[i] = entrada;
  else referencias.push(entrada);
  console.log(`✓ ${g.id}: $${precio.toLocaleString("es-AR")} (${usados.length} publicaciones: ${precios.join(", ")})`);
}

await writeFile(
  SALIDA,
  "[\n" + referencias.map((r) => "  " + JSON.stringify(r).replace(/,"/g, ', "').replace(/":/g, '": ')).join(",\n") + "\n]\n",
);
console.log(`${referencias.length} referencias → ${SALIDA}`);
