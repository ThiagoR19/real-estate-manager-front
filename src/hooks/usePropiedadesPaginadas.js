import { useCallback, useState } from "react";
import { propiedades } from "../services/propiedades.js";
import useListadoPaginado from "./useListadoPaginado.js";

export default function usePropiedadesPaginadas(filtros = {}) {
  const [busqueda, setBusqueda] = useState("");
  const listado = useListadoPaginado(propiedades, { busqueda, filtros, limite: 12 });
  const cambiarBusqueda = useCallback((valor) => setBusqueda(String(valor).slice(0, 255)), []);
  return {
    ...listado,
    propiedades: listado.datos,
    busqueda,
    cambiarBusqueda,
  };
}
