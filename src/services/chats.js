import { http, request } from "../utils/request.js";
import { obtenerSesion } from "./login.js";

export const conversaciones = () => request("/chat").then(({ data }) => data);
export const contactos = () => request("/chat/contactos").then(({ data }) => data);
export const mensajes = (id, { before } = {}) => {
  const cursor = before ? `&before=${before}` : "";
  return request(`/chat/${id}/mensajes?limit=10${cursor}`);
};
export const enviarMensaje = (id, contenido, files = []) => {
  const body = new FormData();
  if (contenido) body.append("contenido", contenido);
  for (const file of files) body.append("adjunto", file);
  return request(`/chat/${id}/mensajes`, { method: "POST", body }).then(({ data }) => data);
};
export const iniciarConversacion = (idUsuario, mensaje) => request("/chat", { method: "POST", body: { idUsuario, mensaje } }).then(({ data }) => data);
export const marcarLeido = (id) => request(`/chat/${id}/leida`, { method: "PATCH" });

export async function descargarAdjunto(id, attachment) {
  const { data } = await http.get(`/chat/${id}/adjuntos/${attachment.id}`, {
    headers: { Authorization: `Bearer ${obtenerSesion()?.token || ""}` },
    responseType: "blob",
  });
  const url = URL.createObjectURL(data);
  const link = document.createElement("a");
  link.href = url;
  link.download = attachment.nombreArchivo;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
