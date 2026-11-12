import { request } from "../utils/request";

export const profile = () => request(`/perfil`).then(({ data }) => data);
export const updateProfile = (body) => request(`/perfil`, { method: "PATCH", body }).then(({ data }) => data);
export const updatePassword = (body) => request(`/perfil/contrasena`, { method: "PATCH", body }).then(({ data }) => data);

export const updateProfilePhoto = (file) => {
  const body = new FormData();
  body.append("fotoPerfil", file);
  return request("/perfil/foto", { method: "PUT", body }).then(({ data }) => data);
};

// export const profileFiles = (id) => request(`/propiedades/${id}/archivos`).then(({ data }) => data);
// export const createProfile = (body) => request("/propiedades", { method: "POST", body }).then(({ data }) => data);
// export const deleteProfile = (id) => request(`/propiedades/${id}`, { method: "DELETE" });

// export function uploadPropertyFiles(id, kind, files) {
//   const body = new FormData();
//   for (const file of files) body.append(kind, file);
//   return request(`/propiedades/${id}/archivos/${kind}`, { method: "POST", body });
// }
