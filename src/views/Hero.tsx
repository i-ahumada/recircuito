import Image from "next/image";
import styles from "./Hero.module.css";
import { WaitlistForm } from "./WaitlistForm";

export function Hero() {
  return (
    <section id="inicio" className={styles.hero} aria-labelledby="hero-title">
      <div className={`container ${styles.grid}`}>
        <div className={styles.texto}>
          <h1 id="hero-title" className={styles.titulo}>
            Vaciá el <span className={styles.nowrap}>cajón.</span>
          </h1>
          <p className={styles.sub}>
            Esa pila de tecnología que ya no usás vale plata. Tasala al instante con nuestra IA y dale una segunda
            oportunidad.
          </p>
          <div className={styles.ctas}>
            <a href="#tasador" className="btn btnCoral">
              Sacá una foto
            </a>
            <span className={styles.gratis}>Publicar es gratis</span>
          </div>
          <div className={styles.waitlist}>
            <p className={styles.waitlistLabel}>Todavía no abrimos. Dejanos tu email y te avisamos.</p>
            <WaitlistForm origen="hero" cta="Avisame" />
          </div>
        </div>
        <div className={styles.media}>
          <Image
            src="/img/hero-cajon.webp"
            alt="Cajón abierto con celulares, tablets y cables viejos de los que salen brotes verdes"
            width={1600}
            height={893}
            priority
            fetchPriority="high"
            sizes="(min-width: 900px) 60vw, 100vw"
            className={styles.img}
          />
        </div>
      </div>
    </section>
  );
}
