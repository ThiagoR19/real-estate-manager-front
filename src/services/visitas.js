import { request } from "../utils/request.js";
import { crearListadoPaginado } from "./listadoPaginado.js";

export const visitas = crearListadoPaginado("/visitas", {
  admiteBusqueda: false, filtrosPermitidos: ["desde", "hasta", "idAgente", "idCliente", "idPropiedad", "estado"],
});

export async function visitasDelPeriodo({ filtros } = {}, { signal } = {}) {
  if (!filtros?.desde || !filtros?.hasta) throw new Error("Indicá el período de la agenda.");
  const filas = [];
  let paginacion;
  for (let pagina = 1; ; pagina++) {
    signal?.throwIfAborted();
    const resultado = await visitas({ pagina, filtros }, { signal });
    filas.push(...resultado.data);
    paginacion = resultado.paginacion;
    if (pagina >= paginacion.paginas) break;
  }
  return { data: filas, paginacion: { pagina: 1, limite: Math.max(1, filas.length), total: filas.length, paginas: filas.length ? 1 : 0 } };
}

export const clientesVisitas = () => request("/visitas/clientes").then(({ data }) => data);
export const crearClienteVisita = (body) => request("/visitas/clientes", { method: "POST", body }).then(({ data }) => data);
export const crearVisita = (body) => request("/visitas", { method: "POST", body }).then(({ data }) => data);
export const actualizarVisita = (id, body) => request(`/visitas/${id}`, { method: "PUT", body }).then(({ data }) => data);
export const cancelarVisita = (id, motivo) => request(`/visitas/${id}/cancelar`, { method: "PATCH", body: { motivo, confirmacion: true } }).then(({ data }) => data);
