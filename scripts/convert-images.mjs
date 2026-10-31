// Convierte assets/img/*.jpeg a public/img/*.webp (solo formato y tamaño, sin tocar el contenido).
// Uso: npm run images
import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SRC = "assets/img";
const OUT = "public/img";
const SKIP = /^Gemini_Generated_Image_/;
const RENAME = { "vacio-ofertas": "gracias-lista-espera" };
// logo.jpeg tiene fondo blanco: sus variantes con transparencia las genera scripts/generar-logo.mjs.
const NO_USAR = new Set(["vacio-publicaciones", "logo"]);

await mkdir(OUT, { recursive: true });

for (const file of await readdir(SRC)) {
  if (!/\.jpe?g$/i.test(file) || SKIP.test(file)) continue;
  const base = path.parse(file).name;
  if (NO_USAR.has(base)) continue;
  const img = sharp(path.join(SRC, file));
  const { width, height } = await img.metadata();
  const square = width === height;
  const max = square ? 800 : 1600;
  const outName = `${RENAME[base] ?? base}.webp`;
  const info = await img
    .resize({ width: max, height: max, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 78 })
    .toFile(path.join(OUT, outName));
  console.log(`${outName}: ${info.width}x${info.height}, ${(info.size / 1024).toFixed(0)} KB`);
}
