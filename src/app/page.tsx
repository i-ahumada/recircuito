import { Cierre } from "@/views/Cierre";
import { ComoFunciona } from "@/views/ComoFunciona";
import { CompradoresVerificados } from "@/views/CompradoresVerificados";
import { Dispositivos } from "@/views/Dispositivos";
import { Footer } from "@/views/Footer";
import { Header } from "@/views/Header";
import { Hero } from "@/views/Hero";
import { Hilo } from "@/views/Hilo";
import { Impacto } from "@/views/Impacto";
import { TasadorSection } from "@/views/TasadorSection";

// Estructura de pitch: el problema (Impacto) → la solución (Cómo funciona, Compradores,
// Tasador) → qué entra (Dispositivos) → cierre con la acción y la lista de espera.
export default function Home() {
  return (
    <>
      <a href="#contenido" className="skipLink">
        Saltar al contenido
      </a>
      <Header />
      <main id="contenido">
        <Hilo />
        <Hero />
        <Impacto />
        <ComoFunciona />
        <CompradoresVerificados />
        <TasadorSection />
        <Dispositivos />
        <Cierre />
      </main>
      <Footer />
    </>
  );
}
