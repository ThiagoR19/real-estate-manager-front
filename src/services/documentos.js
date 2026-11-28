import { http } from "../utils/request.js";
import { obtenerSesion } from "../utils/sesion.js";
import { crearListadoPaginado } from "./listadoPaginado.js";

export const documentosContrato = crearListadoPaginado("/documentos", {
  admiteBusqueda: false, filtrosPermitidos: ["idContrato", "tipo"],
});

export async function descargarDocumento(document) {
  const { data } = await http.get(`/documentos/${document.id}/descargar`, {
    headers: { Authorization: `Bearer ${obtenerSesion()?.token || ""}` },
    responseType: "blob",
  });
  const url = URL.createObjectURL(data);
  const link = window.document.createElement("a");
  link.href = url;
  link.download = document.nombreArchivo || `${document.titulo}.pdf`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
