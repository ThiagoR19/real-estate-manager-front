import axios from "axios";
import { limpiarSesion, obtenerSesion } from "./sesion.js";

export const apiBase = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");
export const http = axios.create({ baseURL: apiBase });

export async function request(path, { method = "GET", body, auth = true, signal } = {}) {
  const headers = {};
  if (auth) {
    const token = obtenerSesion()?.token;
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  try {
    const { data: result } = await http.request({ url: path, method, data: body, headers, signal });
    if (result.status !== "success") {
      const details = result.error?.detalles?.map(({ campo, problema }) => `${campo}: ${problema}`).join("; ");
      throw new Error(
        details || result.error?.mensaje || "La API devolvió una respuesta inválida.",
      );
    }
    return result;
  } catch (error) {
    if (axios.isCancel(error)) throw error;
    const status = error.response?.status;
    if (status === 401 && auth) {
      limpiarSesion();
      window.location.assign("/login");
    }
    if (error instanceof Error && !axios.isAxiosError(error)) throw error;
    const payload = error.response?.data;
    const details = payload?.error?.detalles
      ?.map(({ campo, problema }) => `${campo}: ${problema}`)
      .join("; ");
    throw new Error(
      details ||
      payload?.error?.mensaje ||
      (status ? `Error HTTP ${status}` : "No se pudo conectar con el servidor."),
      { cause: error },
    );
  }
}
