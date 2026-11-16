import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useLocation } from "wouter";

export default function useBuscadorZona(filtro = "buy") {
  const [, navegar] = useLocation();
  const [texto, setTexto] = useState("");
  const [abierto, setAbierto] = useState(false);
  const inputRef = useRef(null);

  const buscar = (event) => {
    event.preventDefault();
    const zona = texto.trim();

    if (!zona) {
      flushSync(() => setAbierto(true));
      inputRef.current?.focus();
      return;
    }

    const params = new URLSearchParams({ filter: filtro, ubicacion: zona });
    navegar(`/propiedades-publicas?${params}`);
    setTexto("");
    setAbierto(false);
  };

  const cerrarSiSale = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setAbierto(false);
  };

  const cerrarConEscape = (event) => {
    if (event.key === "Escape") setAbierto(false);
  };

  return { texto, setTexto, abierto, inputRef, buscar, cerrarSiSale, cerrarConEscape };
}
