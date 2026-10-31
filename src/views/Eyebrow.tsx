/** Eyebrow de capítulo. Su punto es un nodo del hilo (ver Hilo.tsx). */
export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="eyebrow">
      <span className="nodo" data-hilo-nodo aria-hidden="true" />
      {children}
    </span>
  );
}
