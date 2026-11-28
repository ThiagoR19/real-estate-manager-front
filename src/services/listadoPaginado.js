import { request } from "../utils/request.js";

export function crearListadoPaginado(ruta, { limitePredeterminado = 10, limiteMaximo = 10, admiteBusqueda = true, filtrosPermitidos = [], } = {}) {
  const configuracion = { limitePredeterminado, limiteMaximo, admiteBusqueda, filtrosPermitidos };

  return (consulta, opciones) => listarPagina(ruta, configuracion, consulta, opciones);
}

async function listarPagina(
  ruta,
  { limitePredeterminado, limiteMaximo, admiteBusqueda, filtrosPermitidos },
  {
    pagina = 1,
    limite = limitePredeterminado,
    busqueda = "",
    filtros = {},
  } = {},
  { signal } = {},
) {
  const paginaValida = Number.isInteger(pagina) && pagina >= 1;
  const limiteValido = Number.isInteger(limite) && limite >= 1 && limite <= limiteMaximo;

  if (!paginaValida || !limiteValido) { throw new Error("La página o el tamaño de página no son válidos."); }

  const parametros = new URLSearchParams({ page: pagina, limit: limite });
  const textoBusqueda = busqueda.trim();

  if (textoBusqueda && (!admiteBusqueda || textoBusqueda.length > 255)) { throw new Error("La búsqueda no está admitida por este listado."); }
  if (textoBusqueda) { parametros.set("q", textoBusqueda); }

  for (const [nombre, valor] of Object.entries(filtros)) {
    if (!filtrosPermitidos.includes(nombre)) { throw new Error(`Filtro no admitido: ${nombre}`); }
    const tieneValor = valor !== undefined && valor !== null && valor !== "";
    if (tieneValor) { parametros.set(nombre, valor); }
  }

  const { data, paginacion } = await request(`${ruta}?${parametros}`, { signal });

  validarRespuestaPaginada(data, paginacion);

  return { data, paginacion };
}

function validarRespuestaPaginada(data, paginacion) {
  if (!Array.isArray(data) || !paginacion) {
    throw new Error("La API devolvió una paginación inválida.");
  }

  const { pagina, limite, total, paginas } = paginacion;
  const paginaValida = Number.isInteger(pagina) && pagina >= 1;
  const limiteValido = Number.isInteger(limite) && limite >= 1;
  const totalValido = Number.isInteger(total) && total >= 0;
  const cantidadPaginasValida =
    Number.isInteger(paginas) && paginas === Math.ceil(total / limite);

  if (!paginaValida || !limiteValido || !totalValido || !cantidadPaginasValida) {
    throw new Error("La API devolvió una paginación inválida.");
  }
}
