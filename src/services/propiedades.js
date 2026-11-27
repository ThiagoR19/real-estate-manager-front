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
  const [raw, files] = await Promise.all([propiedad(id), archivosPropiedad(id)]);
  return { ...raw, imagenes: files.imagenes || [], documentos: files.documentos || [] };
}

export function subirArchivosPropiedad(id, kind, files, titulo) {
  const body = new FormData();
  for (const file of files) body.append(kind, file);
  if (titulo) body.append("titulo", titulo);
  return request(`/propiedades/${id}/archivos/${kind}`, { method: "POST", body });
}

export const renombrarDocumentoPropiedad = (id, fileId, titulo) => request(`/propiedades/${id}/archivos/documentos/${fileId}`, { method: "PATCH", body: { titulo } });

export const eliminarArchivoPropiedad = (id, kind, fileId) => request(`/propiedades/${id}/archivos/${kind}/${fileId}`, { method: "DELETE" });

export async function descargarDocumentoPropiedad(id, file) {
  try {
    const { data } = await http.get(`/propiedades/${id}/archivos/documentos/${file.id}`, {
      headers: { Authorization: `Bearer ${obtenerSesion()?.token || ""}` },
      responseType: "blob",
    });
    const url = URL.createObjectURL(data);
    const link = window.document.createElement("a");
    link.href = url;
    link.download = file.nombreArchivo;
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
