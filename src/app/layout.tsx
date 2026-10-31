import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin", "latin-ext"],
  variable: "--font-outfit",
  display: "swap",
});

const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";
const descripcion =
  "Tasá con IA ese celular, notebook o tablet que ya no usás y vendéselo a compradores verificados. Publicar es gratis. Si no tiene valor, te mostramos dónde dejarlo.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "ReCircuito · Vaciá el cajón",
  description: descripcion,
  keywords: ["vender celular usado", "residuos electrónicos", "RAEE", "tasador", "reciclaje", "Argentina"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "/",
    siteName: "ReCircuito",
    title: "ReCircuito · Vaciá el cajón",
    description: descripcion,
    images: [
      {
        url: "/img/hero-cajon.webp",
        width: 1600,
        height: 893,
        alt: "Cajón abierto con celulares, tablets y cables viejos de los que salen brotes verdes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ReCircuito · Vaciá el cajón",
    description: descripcion,
    images: ["/img/hero-cajon.webp"],
  },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#edf1f3",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-AR" className={outfit.variable}>
      <body>{children}</body>
    </html>
  );
}
