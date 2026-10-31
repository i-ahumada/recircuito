import styles from "./Logo.module.css";

export function Logo() {
  return (
    <a href="#inicio" className={styles.logo} aria-label="ReCircuito, ir al inicio">
      <svg className={styles.mark} viewBox="0 0 40 44" aria-hidden="true">
        <defs>
          <linearGradient id="logo-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#5abdcf" />
            <stop offset="1" stopColor="#85d463" />
          </linearGradient>
        </defs>
        <path
          d="M6 40V5h14a10 10 0 0 1 0 20H12m8 0 11 12"
          fill="none"
          stroke="url(#logo-grad)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M12 40V11h8a4 4 0 0 1 0 8h-4" fill="none" stroke="url(#logo-grad)" strokeWidth="2" strokeLinecap="round" />
        <circle cx="34" cy="40" r="3.5" fill="#85d463" />
      </svg>
      <span className={styles.text}>ReCircuito</span>
    </a>
  );
}
