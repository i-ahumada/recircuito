/** Íconos de línea simples, heredan el color del texto. */
type P = { className?: string };
const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const IconoCelular = (p: P) => (
  <svg {...base} {...p}>
    <rect x="6" y="2.5" width="12" height="19" rx="2.5" />
    <path d="M10.5 18.5h3" />
  </svg>
);
export const IconoNotebook = (p: P) => (
  <svg {...base} {...p}>
    <rect x="4" y="4.5" width="16" height="11" rx="1.5" />
    <path d="M2 19.5h20" />
  </svg>
);
export const IconoTablet = (p: P) => (
  <svg {...base} {...p}>
    <rect x="4" y="2.5" width="16" height="19" rx="2.5" />
    <circle cx="12" cy="18" r="0.6" fill="currentColor" />
  </svg>
);
export const IconoConsola = (p: P) => (
  <svg {...base} {...p}>
    <path d="M7 8h10a5 5 0 0 1 4.6 7l-.6 1.4a2.5 2.5 0 0 1-4.3.4L15 15H9l-1.7 1.8a2.5 2.5 0 0 1-4.3-.4L2.4 15A5 5 0 0 1 7 8Z" />
    <path d="M7.5 10.5v3M6 12h3" />
    <circle cx="16" cy="11" r="0.7" fill="currentColor" />
    <circle cx="17.5" cy="13" r="0.7" fill="currentColor" />
  </svg>
);
export const IconoMonitor = (p: P) => (
  <svg {...base} {...p}>
    <rect x="3" y="3.5" width="18" height="12.5" rx="1.5" />
    <path d="M9 20.5h6M12 16v4.5" />
  </svg>
);
export const IconoOtros = (p: P) => (
  <svg {...base} {...p}>
    <path d="M9 3v4M15 3v4M7 7h10v4a5 5 0 0 1-10 0V7Z" />
    <path d="M12 16v5" />
  </svg>
);
export const IconoPila = (p: P) => (
  <svg {...base} {...p}>
    <rect x="7" y="4" width="10" height="17" rx="2" />
    <path d="M10 2.5h4M12 9v5M9.5 11.5h5" />
  </svg>
);
export const IconoReuso = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4 12a8 8 0 0 1 13.7-5.6L20 8.5M20 4v4.5h-4.5M20 12a8 8 0 0 1-13.7 5.6L4 15.5M4 20v-4.5h4.5" />
  </svg>
);
export const IconoPartes = (p: P) => (
  <svg {...base} {...p}>
    <rect x="6" y="6" width="12" height="12" rx="1.5" />
    <rect x="9.5" y="9.5" width="5" height="5" />
    <path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3" />
  </svg>
);
export const IconoReciclaje = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 21c-5 0-8-3.5-8-8 4 0 8 1.5 8 8Zm0 0c0-6.5 3-11 8-12 0 6-3 12-8 12Zm0-8V7" />
  </svg>
);

export const CATEGORIAS_ICONOS = [
  { nombre: "Celular", Icono: IconoCelular },
  { nombre: "Notebook", Icono: IconoNotebook },
  { nombre: "Tablet", Icono: IconoTablet },
  { nombre: "Consola", Icono: IconoConsola },
  { nombre: "Monitor", Icono: IconoMonitor },
  { nombre: "Otros", Icono: IconoOtros },
];
