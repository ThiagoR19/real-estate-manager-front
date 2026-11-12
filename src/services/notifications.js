import { request } from "../utils/request.js";

export const notifications = () => request("/notificaciones").then(({ data }) => data);

export const markNotificationRead = (id) =>
  request(`/notificaciones/${id}/leida`, { method: "PATCH" }).then(({ data }) => data);
