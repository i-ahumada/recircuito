import { ComoFunciona } from "@/views/ComoFunciona";
import { CompradoresVerificados } from "@/views/CompradoresVerificados";
import { Dispositivos } from "@/views/Dispositivos";
import { Footer } from "@/views/Footer";
import { Header } from "@/views/Header";
import { Hero } from "@/views/Hero";
import { Hilo } from "@/views/Hilo";
import { Impacto } from "@/views/Impacto";
import { TasadorSection } from "@/views/TasadorSection";

// Recorrido de un dispositivo: cajón lleno → cómo se vende → a quién va → qué entra →
// por qué importa → lo probás con el tuyo (el tasador cierra la página).
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
        <ComoFunciona />
        <CompradoresVerificados />
        <Dispositivos />
        <Impacto />
        <TasadorSection />
      </main>
      <Footer />
    </>
  );
}
