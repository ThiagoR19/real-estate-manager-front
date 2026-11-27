import { request } from "../utils/request";

export const perfil = () => request(`/perfil`).then(({ data }) => data);
export const actualizarPerfil = (body) => request(`/perfil`, { method: "PATCH", body }).then(({ data }) => data);
export const actualizarContrasena = (body) => request(`/perfil/contrasena`, { method: "PATCH", body }).then(({ data }) => data);

export const actualizarFotoPerfil = (archivo) => {
  const body = new FormData();
  body.append("fotoPerfil", archivo);
  return request("/perfil/foto", { method: "PUT", body }).then(({ data }) => data);
};