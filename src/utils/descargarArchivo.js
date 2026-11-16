import { http } from "./request.js";
import { limpiarSesion, obtenerSesion } from "../services/login.js";

async function mensajeDeError(error) {
  let payload = error.response?.data;
  if (payload instanceof Blob) {
    try {
      payload = JSON.parse(await payload.text());
    } catch {
      payload = null;
    }
  }
  return payload?.error?.mensaje;
}

export async function descargarArchivo(ruta, nombre) {
  try {
    const { data } = await http.get(ruta, {
      headers: { Authorization: `Bearer ${obtenerSesion()?.token || ""}` },
      responseType: "blob",
    });
    const url = URL.createObjectURL(data);
    const link = document.createElement("a");
    link.href = url;
    link.download = nombre;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (error) {
    const status = error.response?.status;
    if (status === 401) {
      limpiarSesion();
      window.location.assign("/login");
    }
    throw new Error(
      (await mensajeDeError(error)) ||
        (status ? `Error HTTP ${status}` : "No se pudo conectar con el servidor."),
      { cause: error },
    );
  }
}
