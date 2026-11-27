import { http, request } from "../utils/request.js";
import { limpiarSesion, obtenerSesion } from "../utils/sesion.js";

export const catalogosPropiedades = () => request("/propiedades/catalogos").then(({ data }) => data);

export async function propiedades() {
  const items = [];
  let page = 1;
  let hasNext = true;
  while (hasNext) {
    const result = await request(`/propiedades?page=${page}&limit=12`);
    items.push(...result.data);
    hasNext = page < (result.paginacion?.paginas || 1);
    page++;
  }
  return items;
}

export const propiedad = (id) => request(`/propiedades/${id}`).then(({ data }) => data);
export const archivosPropiedad = (id) => request(`/propiedades/${id}/archivos`).then(({ data }) => data);
export const crearPropiedad = (body) => request("/propiedades", { method: "POST", body }).then(({ data }) => data);
export const actualizarPropiedad = (id, body) => request(`/propiedades/${id}`, { method: "PUT", body }).then(({ data }) => data);
export const eliminarPropiedad = (id) => request(`/propiedades/${id}`, { method: "DELETE" });

export async function obtenerPropiedad(id) {
  const [raw, archivos] = await Promise.all([propiedad(id), archivosPropiedad(id)]);
  return { ...raw, imagenes: archivos.imagenes || [], documentos: archivos.documentos || [] };
}

export function subirArchivosPropiedad(id, tipo, archivos, titulo) {
  const body = new FormData();
  for (const archivo of archivos) body.append(tipo, archivo);
  if (titulo) body.append("titulo", titulo);
  return request(`/propiedades/${id}/archivos/${tipo}`, { method: "POST", body });
}

export const renombrarDocumentoPropiedad = (id, archivoId, titulo) => request(`/propiedades/${id}/archivos/documentos/${archivoId}`, { method: "PATCH", body: { titulo } });

export const eliminarArchivoPropiedad = (id, tipo, archivoId) => request(`/propiedades/${id}/archivos/${tipo}/${archivoId}`, { method: "DELETE" });

export async function descargarDocumentoPropiedad(id, archivo) {
  try {
    const { data } = await http.get(`/propiedades/${id}/archivos/documentos/${archivo.id}`, {
      headers: { Authorization: `Bearer ${obtenerSesion()?.token || ""}` },
      responseType: "blob",
    });
    const url = URL.createObjectURL(data);
    const link = window.document.createElement("a");
    link.href = url;
    link.download = archivo.nombreArchivo;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (error) {
    const status = error.response?.status;
    if (status === 401) {
      limpiarSesion();
      window.location.assign("/login");
    }
    let payload = error.response?.data;
    if (payload instanceof Blob) {
      try {
        payload = JSON.parse(await payload.text());
      } catch (parseError) {
        console.log(parseError);
      }
    }
    throw new Error(
      payload?.error?.mensaje ||
      (status ? `Error HTTP ${status}` : "No se pudo conectar con el servidor."),
      { cause: error },
    );
  }
}
