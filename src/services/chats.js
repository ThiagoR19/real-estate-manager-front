import { request } from "../utils/request.js";

export const conversaciones = () => request("/chat").then(({ data }) => data);
export const contactos = () => request("/chat/contactos").then(({ data }) => data);
export const mensajes = (id) => request(`/chat/${id}/mensajes`);
export const enviarMensaje = (id, contenido) => request(`/chat/${id}/mensajes`, { method: "POST", body: { contenido } }).then(({ data }) => data);
export const iniciarConversacion = (idUsuario, mensaje) => request("/chat", { method: "POST", body: { idUsuario, mensaje } }).then(({ data }) => data);
export const marcarLeido = (id) => request(`/chat/${id}/leida`, { method: "PATCH" });
