import { http, request } from "../utils/request.js";
import { getSession } from "./login.js";

export const conversations = () => request("/chat").then(({ data }) => data);
export const contacts = () => request("/chat/contactos").then(({ data }) => data);
export const messages = (id, page = 1) => request(`/chat/${id}/mensajes?page=${page}&limit=10`);
export const sendMessage = (id, contenido, files = []) => {
  const body = new FormData();
  if (contenido) body.append("contenido", contenido);
  for (const file of files) body.append("adjunto", file);
  return request(`/chat/${id}/mensajes`, { method: "POST", body }).then(({ data }) => data);
};
export const startConversation = (idUsuario, mensaje) => request("/chat", { method: "POST", body: { idUsuario, mensaje } }).then(({ data }) => data);
export const markRead = (id) => request(`/chat/${id}/leida`, { method: "PATCH" });

export async function downloadAttachment(id, attachment) {
  const { data } = await http.get(`/chat/${id}/adjuntos/${attachment.id}`, {
    headers: { Authorization: `Bearer ${getSession()?.token || ""}` },
    responseType: "blob",
  });
  const url = URL.createObjectURL(data);
  const link = document.createElement("a");
  link.href = url;
  link.download = attachment.nombreArchivo;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
