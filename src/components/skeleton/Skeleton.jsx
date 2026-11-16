import { useRef } from "react";

import "./Skeleton.css";

import useLoadComplete from "../../hooks/useLoadComplete";

// Envuelve la raíz de cualquier vista: mientras cargan fuentes e imágenes,
// sus textos, imágenes, botones e inputs se muestran como skeleton.
//
// Uso:  <Skeleton as="main" className="Inicio" fondos={[fondoHero]}> ... </Skeleton>
//
// - data-sk           -> fuerza a un elemento a verse como bloque
// - data-sk-fondo     -> oculta su imagen de fondo mientras carga
// - className="Skeleton-no" -> excluye ese elemento y su contenido
// - cargando          -> lo mantiene en skeleton mientras la vista espera sus datos
export default function Skeleton({
  as: Etiqueta = "div",
  className = "",
  fondos = [],
  cargando = false,
  children,
  ...props
}) {
  const ref = useRef(null);
  const loaded = useLoadComplete(ref, fondos) && !cargando;

  return (
    <Etiqueta
      ref={ref}
      className={`${className} ${loaded ? "" : "Skeleton"}`}
      aria-busy={!loaded}
      {...props}
    >
      {children}
    </Etiqueta>
  );
}
