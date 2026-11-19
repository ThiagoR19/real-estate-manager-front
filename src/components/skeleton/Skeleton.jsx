import { useRef } from "react";

import "./Skeleton.css";

import useLoadComplete from "../../hooks/useLoadComplete";

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
