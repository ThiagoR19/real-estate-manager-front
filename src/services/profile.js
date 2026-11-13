import { request } from "../utils/request";

export const profile = () => request(`/perfil`).then(({ data }) => data);
export const updateProfile = (body) => request(`/perfil`, { method: "PATCH", body }).then(({ data }) => data);
export const updatePassword = (body) => request(`/perfil/contrasena`, { method: "PATCH", body }).then(({ data }) => data);

export const updateProfilePhoto = (file) => {
  const body = new FormData();
  body.append("fotoPerfil", file);
  return request("/perfil/foto", { method: "PUT", body }).then(({ data }) => data);
};