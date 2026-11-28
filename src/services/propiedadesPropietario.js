import { crearListadoPaginado } from "./listadoPaginado.js";

export const contratos = crearListadoPaginado("/contratos", { admiteBusqueda: false, filtrosPermitidos: ["tipo", "estado", "idPropiedad", "desde", "hasta"] });
export const reportes = crearListadoPaginado("/reportes", { limitePredeterminado: 5, filtrosPermitidos: ["idInmobiliaria"] });
