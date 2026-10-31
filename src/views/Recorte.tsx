import Image from "next/image";
import styles from "./Recorte.module.css";

/** Zona de la imagen a mostrar, en % de la imagen original: [x0, y0, x1, y1]. */
export type Caja = readonly [number, number, number, number];

type Props = {
  src: string;
  alt: string;
  /** Tamaño natural del archivo. */
  width: number;
  height: number;
  caja: Caja;
  /** Ancho aproximado con que se ve el recorte (se usa para pedir el tamaño justo). */
  sizes: string;
  priority?: boolean;
  className?: string;
  /** Desvanece los bordes contra el fondo. "fuerte" para imágenes cuyo fondo es más oscuro que la página. */
  fundido?: boolean | "fuerte";
  /** Marca la imagen como lugar donde un brote del hilo puede pasar por detrás (ver Hilo.tsx). */
  brote?: boolean;
  children?: React.ReactNode;
};

/**
 * Muestra solo la parte de la imagen que tiene contenido. Las imágenes tienen mucho
 * fondo vacío; en lugar de editarlas, se recortan con CSS.
 */
export function Recorte({
  src,
  alt,
  width,
  height,
  caja,
  sizes,
  priority,
  className,
  fundido = true,
  brote,
  children,
}: Props) {
  const [x0, y0, x1, y1] = caja;
  const anchoPct = x1 - x0;
  const altoPct = y1 - y0;
  const style = {
    aspectRatio: `${(anchoPct * width).toFixed(0)} / ${(altoPct * height).toFixed(0)}`,
    "--rw": `${(10000 / anchoPct).toFixed(3)}%`,
    "--rx": `${((-100 * x0) / anchoPct).toFixed(3)}%`,
    "--ry": `${((-100 * y0) / altoPct).toFixed(3)}%`,
  } as React.CSSProperties;

  return (
    <div
      className={`${styles.recorte} ${fundido === "fuerte" ? "fundido fundidoFuerte" : fundido ? "fundido" : ""} ${className ?? ""}`}
      style={style}
      {...(brote ? { "data-brote": "" } : {})}
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        priority={priority}
        fetchPriority={priority ? "high" : undefined}
        loading={priority ? undefined : "lazy"}
        className={styles.img}
      />
      {children}
    </div>
  );
}

/** Convierte un punto en % de la imagen original a % del recorte. */
export function enRecorte(caja: Caja, x: number, y: number) {
  const [x0, y0, x1, y1] = caja;
  return { left: `${(((x - x0) / (x1 - x0)) * 100).toFixed(2)}%`, top: `${(((y - y0) / (y1 - y0)) * 100).toFixed(2)}%` };
}
