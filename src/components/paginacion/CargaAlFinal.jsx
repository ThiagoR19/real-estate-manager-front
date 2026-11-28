import { useEffect, useRef } from "react";

export default function CargaAlFinal({ activa, alLlegar }) {
  const marcador = useRef(null);

  useEffect(() => {
    if (!activa || !marcador.current) return undefined;
    const observador = new IntersectionObserver((entradas) => {
      if (entradas.some((entrada) => entrada.isIntersecting)) alLlegar();
    }, { rootMargin: "120px" });
    observador.observe(marcador.current);
    return () => observador.disconnect();
  }, [activa, alLlegar]);

  return <div ref={marcador} aria-hidden="true" style={{ width: "100%", height: 1 }} />;
}
