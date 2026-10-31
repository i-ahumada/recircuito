// Genera las variantes del logo a partir de assets/img/logo.jpeg (logo horizontal sobre fondo blanco).
// Uso: node scripts/generar-logo.mjs
//
// Salidas:
//   public/img/logo.webp          logo horizontal, fondo transparente (header)
//   public/img/logo-blanco.webp   igual, con "Circuito" en blanco para fondos oscuros (footer)
//   public/img/logo-isotipo.webp  solo el isotipo "RC", fondo transparente
//   src/app/icon.png              favicon 512 px (Next lo publica solo)
//   src/app/apple-icon.png        ícono de iOS 180 px, fondo blanco
//   src/app/favicon.ico           16, 32 y 48 px
import { writeFile } from "node:fs/promises";
import sharp from "sharp";

const ORIGEN = "assets/img/logo.jpeg";
// Recortes medidos sobre el original de 1600 × 800 (tinta con algún canal < 200).
const ISOTIPO = { x0: 74, x1: 631, y0: 233, y1: 548 };
const TEXTO_X0 = 691; // desde acá empieza "ReCircuito"
const LOGO = { x0: 74, x1: 1534, y0: 233, y1: 548 };
const MARGEN = 12;

const { data, info } = await sharp(ORIGEN).raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels: C } = info;

/**
 * "Color a transparencia" contra blanco: la opacidad es cuánto se aleja el píxel del blanco,
 * y el color se des-mezcla para que los bordes suavizados no queden con halo claro.
 */
function aRgba() {
  const out = Buffer.alloc(W * H * 4);
  for (let i = 0, j = 0; i < data.length; i += C, j += 4) {
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
    let a = Math.max(255 - r, 255 - g, 255 - b) / 255;
    a = Math.min(1, Math.max(0, (a - 0.04) / 0.96)); // ruido del JPEG en el fondo
    if (a === 0) continue;
    const des = (c) => Math.round(Math.min(255, Math.max(0, (c - 255 * (1 - a)) / a)));
    out[j] = des(r);
    out[j + 1] = des(g);
    out[j + 2] = des(b);
    out[j + 3] = Math.round(a * 255);
  }
  return out;
}

/** Pasa a blanco el azul marino de "Circuito"; el verde de "Re" y el isotipo quedan igual. */
function conTextoBlanco(rgba) {
  const out = Buffer.from(rgba);
  for (let y = 0; y < H; y++) {
    for (let x = TEXTO_X0; x < W; x++) {
      const j = (y * W + x) * 4;
      const [r, g, b] = [out[j], out[j + 1], out[j + 2]];
      if (out[j + 3] && b > g && r < 90) out[j] = out[j + 1] = out[j + 2] = 255;
    }
  }
  return out;
}

function recorte(rgba, { x0, x1, y0, y1 }, margen = MARGEN) {
  const left = Math.max(0, x0 - margen);
  const top = Math.max(0, y0 - margen);
  return sharp(rgba, { raw: { width: W, height: H, channels: 4 } }).extract({
    left,
    top,
    width: Math.min(W, x1 + margen + 1) - left,
    height: Math.min(H, y1 + margen + 1) - top,
  });
}

/** El isotipo centrado en un cuadrado, con aire alrededor. */
async function isotipoCuadrado(rgba, lado, fondo) {
  const util = Math.round(lado * 0.84);
  const marca = await recorte(rgba, ISOTIPO, 0)
    .resize({ width: util, height: util, fit: "inside" })
    .png()
    .toBuffer();
  return sharp({
    create: { width: lado, height: lado, channels: 4, background: fondo ?? { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: marca, gravity: "center" }])
    .png();
}

/** ICO con PNGs adentro (lo aceptan todos los navegadores actuales). */
function ico(pngs) {
  const cabecera = Buffer.alloc(6 + 16 * pngs.length);
  cabecera.writeUInt16LE(0, 0);
  cabecera.writeUInt16LE(1, 2);
  cabecera.writeUInt16LE(pngs.length, 4);
  let offset = cabecera.length;
  pngs.forEach(({ lado, buf }, k) => {
    const e = 6 + 16 * k;
    cabecera.writeUInt8(lado >= 256 ? 0 : lado, e);
    cabecera.writeUInt8(lado >= 256 ? 0 : lado, e + 1);
    cabecera.writeUInt16LE(1, e + 4);
    cabecera.writeUInt16LE(32, e + 6);
    cabecera.writeUInt32LE(buf.length, e + 8);
    cabecera.writeUInt32LE(offset, e + 12);
    offset += buf.length;
  });
  return Buffer.concat([cabecera, ...pngs.map((p) => p.buf)]);
}

const rgba = aRgba();
const webp = { quality: 90, alphaQuality: 100, effort: 6 };

const salidas = [
  ["public/img/logo.webp", recorte(rgba, LOGO).resize({ width: 720 }).webp(webp)],
  ["public/img/logo-blanco.webp", recorte(conTextoBlanco(rgba), LOGO).resize({ width: 720 }).webp(webp)],
  ["public/img/logo-isotipo.webp", recorte(rgba, ISOTIPO).resize({ width: 400 }).webp(webp)],
  ["src/app/icon.png", await isotipoCuadrado(rgba, 512)],
  ["src/app/apple-icon.png", await isotipoCuadrado(rgba, 180, { r: 255, g: 255, b: 255, alpha: 1 })],
];

for (const [ruta, img] of salidas) {
  const { width, height, size } = await img.toFile(ruta);
  console.log(`${ruta}: ${width}x${height}, ${(size / 1024).toFixed(1)} KB`);
}

const pngs = await Promise.all(
  [16, 32, 48].map(async (lado) => ({ lado, buf: await (await isotipoCuadrado(rgba, lado)).toBuffer() })),
);
await writeFile("src/app/favicon.ico", ico(pngs));
console.log("src/app/favicon.ico: 16, 32 y 48 px");
