import styles from "./Header.module.css";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";

// Mismo orden que la página.
export const NAV = [
  { href: "#como-funciona", label: "Cómo funciona" },
  { href: "#dispositivos", label: "Dispositivos" },
  { href: "#impacto", label: "Impacto" },
  { href: "#tasador", label: "Tasador" },
];

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.avance} aria-hidden="true" />
      <div className={`container ${styles.inner}`}>
        <Logo />
        <nav className={styles.nav} aria-label="Principal">
          <ul>
            {NAV.map((item) => (
              <li key={item.href}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
          <a href="#tasador" className="btn btnCoral btnSmall">
            Tasá tu dispositivo
          </a>
        </nav>
        <MobileMenu items={NAV} />
      </div>
    </header>
  );
}
