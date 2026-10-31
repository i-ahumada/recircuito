import { Cierre } from "@/views/Cierre";
import { ComoFunciona } from "@/views/ComoFunciona";
import { CompradoresVerificados } from "@/views/CompradoresVerificados";
import { Dispositivos } from "@/views/Dispositivos";
import { Footer } from "@/views/Footer";
import { Header } from "@/views/Header";
import { Hero } from "@/views/Hero";
import { Impacto } from "@/views/Impacto";
import { TasadorSection } from "@/views/TasadorSection";

export default function Home() {
  return (
    <>
      <a href="#contenido" className="skipLink">
        Saltar al contenido
      </a>
      <Header />
      <main id="contenido">
        <Hero />
        <TasadorSection />
        <ComoFunciona />
        <CompradoresVerificados />
        <Dispositivos />
        <Impacto />
        <Cierre />
      </main>
      <Footer />
    </>
  );
}
