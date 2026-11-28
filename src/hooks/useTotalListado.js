import useListadoPaginado from "./useListadoPaginado.js";

export default function useTotalListado(cargar, filtros = {}, { version = 0, habilitada = true } = {}) {
  const { paginacion, cargando, error } = useListadoPaginado(cargar, { filtros, limite: 1, version, habilitada });
  return cargando || error ? "—" : paginacion?.total ?? "—";
}
