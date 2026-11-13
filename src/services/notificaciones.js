import { request } from "../utils/request.js";

export const notificaciones = () => request("/notificaciones").then(({ data }) => data);

export const marcarNotificacionLeida = (id) =>
  request(`/notificaciones/${id}/leida`, { method: "PATCH" }).then(({ data }) => data);
