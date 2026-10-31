// Calcula precios de referencia a partir de publicaciones extraídas y actualiza
// src/data/precios-referencia.json. Método: precio por unidad, si hay 5 o más se
// descartan el más caro y el más barato, y se usa la mediana.
// Fuentes: las publicaciones extraídas (JSON) y las muestras cargadas a mano (CSV).
// Uso: node scripts/calcular-precios.mjs [listings.json] [muestras.csv]
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";

const ENTRADA = process.argv[2] ?? "src/data/precios/listings-todos.json";
const MUESTRAS_CSV = process.argv[3] ?? "src/data/precios/muestras.csv";
const SALIDA = "src/data/precios-referencia.json";
/** La app trabaja solo en pesos: las muestras en USD se pasan con el dólar blue venta (31/10/2026). */
const DOLAR_BLUE_ARS = 1565;
/** Por debajo de esta cantidad la entrada queda con "verificar": true. */
const MUESTRAS_CONFIABLES = 5;
/** Una entrada de modelo puntual necesita al menos esta cantidad de publicaciones. */
const MUESTRAS_MINIMAS = 2;

const GAMA_BAJA = [/galaxy a0\d/i, /galaxy j\d/i, /moto g\d\b/i, /moto g7/i];
const GAMA_MEDIA = [/galaxy a5\d/i, /galaxy s9/i];

/** Grupo armado a mano en muestras.csv: se identifica por la columna `grupo`. */
const curado = (id, categoria, nombre, palabrasClave, grupo = id) => ({
  id,
  categoria,
  nombre,
  palabrasClave,
  curado: true,
  match: (l) => l.grupo === grupo,
});

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
  curado("iphone-8", "celular", "iPhone 8", ["iphone 8", "apple"]),
  curado("iphone-xr-128", "celular", "iPhone XR 128 GB", ["iphone xr", "apple"]),
  curado("iphone-11-64", "celular", "iPhone 11 64 GB", ["iphone 11", "apple"]),
  curado("iphone-12-pro-128", "celular", "iPhone 12 Pro 128 GB", ["iphone 12 pro", "apple"]),
  curado("iphone-13-128", "celular", "iPhone 13 128 GB", ["iphone 13", "apple"]),
  curado("iphone-13-mini-128", "celular", "iPhone 13 mini 128 GB", ["iphone 13 mini", "apple"]),
  curado("iphone-14-128", "celular", "iPhone 14 128 GB", ["iphone 14", "apple"]),
  curado("iphone-15-pro-128", "celular", "iPhone 15 Pro", ["iphone 15 pro", "apple"], "iphone-15-pro"),
  curado("iphone-16-128", "celular", "iPhone 16 128 GB", ["iphone 16", "apple"]),
  curado("motorola-edge-20-lite-128", "celular", "Motorola Edge 20 Lite 128 GB", ["motorola edge 20 lite", "moto edge", "motorola"], "moto-edge-20-lite-128"),
  curado("notebook-economica", "notebook", "Notebook económica con Celeron", ["notebook", "celeron", "sky", "talent", "notebook económica"]),
  curado("notebook-antigua", "notebook", "Notebook o netbook antigua (más de 10 años)", ["notebook", "netbook", "core 2 duo", "atom", "thinkpad", "inspiron", "compaq", "toshiba"]),
  curado("notebook-media", "notebook", "Notebook gama media (Core i3 / i5 de 5.ª a 8.ª generación)", ["notebook", "laptop", "core i3", "core i5", "thinkpad", "latitude", "lenovo", "asus", "exo"]),
  curado("notebook-moderna", "notebook", "Notebook moderna (Core i5 10.ª gen. o Ryzen 5 en adelante)", ["notebook", "laptop", "core i5", "ryzen 5", "probook", "latitude", "vaio"]),
  curado("macbook-pro-intel", "notebook", "MacBook Pro con procesador Intel", ["macbook", "macbook pro", "apple", "intel"], "macbook"),
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

/**
 * Pasa muestras.csv al formato de las publicaciones. Solo los equipos que funcionan
 * dan precio de referencia; las filas "calib-*" (rotos) se usan para revisar las bandas.
 */
async function leerMuestras(ruta) {
  if (!existsSync(ruta)) return [];
  const [encabezado, ...filas] = (await readFile(ruta, "utf8")).trim().split(/\r?\n/);
  const columnas = encabezado.split(",");
  return filas.map((linea, i) => {
    const valores = linea.split(",");
    if (valores.length !== columnas.length) throw new Error(`${ruta}:${i + 2}: se esperaban ${columnas.length} columnas`);
    const m = Object.fromEntries(columnas.map((c, j) => [c, valores[j].trim()]));
    const precio = Number(m.precio_publicado);
    if (m.moneda !== "ARS" && m.moneda !== "USD") throw new Error(`${ruta}:${i + 2}: moneda desconocida "${m.moneda}"`);
    return {
      grupo: m.grupo,
      modelo: m.dispositivo,
      cantidad: 1,
      precio_ars: m.moneda === "USD" ? precio * DOLAR_BLUE_ARS : precio,
      precio_valido: Number.isFinite(precio) && precio > 0,
      estado: m.estado === "funcionando" ? "usado" : m.estado,
      alertas: [],
    };
  });
}

const listings = [...JSON.parse(await readFile(ENTRADA, "utf8")), ...(await leerMuestras(MUESTRAS_CSV))];
const referencias = JSON.parse(await readFile(SALIDA, "utf8"));
const hoy = new Date().toISOString().slice(0, 10);

for (const g of GRUPOS) {
  const usados = listings.filter((l) => g.match(l) && utilizable(l));
  const esGenerico = g.id.endsWith("-generico") || g.id === "celular-basico-teclas";
  // Las muestras del CSV ya están revisadas a mano: alcanza con una (queda con "verificar").
  if (usados.length < (esGenerico || g.curado ? 1 : MUESTRAS_MINIMAS)) {
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
