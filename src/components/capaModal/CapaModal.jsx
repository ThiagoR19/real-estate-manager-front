import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import "./CapaModal.css";



export default function CapaModal({
  abierto,
  onCerrar,
  posicion = "centro",
  etiqueta,
  children,
}) {
  const contenidoRef = useRef(null);


  const onCerrarRef = useRef(onCerrar);

  useEffect(() => {
    onCerrarRef.current = onCerrar;
  });

  useEffect(() => {
    if (!abierto) return;

    const enfocadoAntes = document.activeElement;
    const scrollAntes = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    contenidoRef.current?.focus();

    const alPresionar = (e) => {
      if (e.key === "Escape") onCerrarRef.current();
    };
    document.addEventListener("keydown", alPresionar);

    return () => {
      document.removeEventListener("keydown", alPresionar);
      document.body.style.overflow = scrollAntes;
      enfocadoAntes?.focus?.();
    };
  }, [abierto]);

  return createPortal(
    <div
      className={`CapaModal ${abierto ? "CapaModal--abierta" : ""}`}
      aria-hidden={!abierto}
      inert={!abierto}
    >
      <div className="CapaModal__fondo" onClick={onCerrar}></div>

      <div
        ref={contenidoRef}
        className={`CapaModal__contenido CapaModal__contenido--${posicion}`}
        role="dialog"
        aria-modal="true"
        aria-label={etiqueta}
        tabIndex={-1}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
