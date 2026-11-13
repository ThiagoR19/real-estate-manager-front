import { http, request } from "../utils/request.js";
import { obtenerSesion } from "./login.js";

export async function documentosContrato(idContrato) {
  const items = [];
  for (let page = 1; ; page++) {
    const result = await request(`/documentos?idContrato=${idContrato}&tipo=CONTRATO&page=${page}&limit=10`);
    items.push(...result.data);
    if (page >= (result.paginacion?.paginas || 1)) return items;
  }
}

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
