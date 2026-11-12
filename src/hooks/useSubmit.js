import { useEffect, useRef, useState } from "react";

// Maneja los estados del botón de envío: "inactivo" -> "enviando" -> "listo" -> "inactivo"
export default function useSubmit(readyDuration = 1600) {
  const [estado, setEstado] = useState("inactivo");
  const montado = useRef(false);

  useEffect(() => {
    montado.current = true;

    return () => {
      montado.current = false;
    };
  }, []);

  const enviar = async (peticion) => {
    if (estado !== "inactivo") return;

    setEstado("enviando");

    try {
      await peticion();
      if (!montado.current) return;

      setEstado("listo");
      setTimeout(() => {
        if (montado.current) setEstado("inactivo");
      }, readyDuration);
    } catch {
      if (montado.current) setEstado("inactivo");
    }
  };

  return [estado, enviar];
}
