import axios from "axios";

const apiBase = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");
export const http = axios.create({ baseURL: apiBase });

export function assetUrl(path) {
  if (!path) return null;
  const origin = new URL(apiBase, window.location.origin).origin;
  return new URL(path, origin).href;
}

export function getSession() {
  try { return JSON.parse(localStorage.getItem("agi-session")); }
  catch { return null; }
}

export function saveSession(session) {
  localStorage.setItem("agi-session", JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem("agi-session");
}

/*export const api = {
  login: (usuario, password) => request("/auth/login", { method: "POST", body: { usuario, password }, auth: false }).then(({ data }) => data),
  logout: async () => {
    await request("/auth/logout", { method: "POST" });
    clearSession();
  },
  propertyCatalogs: () => request("/propiedades/catalogos").then(({ data }) => data),
  properties: async () => {
    const items = [];
    let page = 1;
    let hasNext = true;
    while (hasNext) {
      const result = await request(`/propiedades?page=${page}&limit=100`);
      items.push(...result.data);
      hasNext = page < (result.paginacion?.paginas || 1);
      page++;
    }
    return items;
  },
  property: (id) => request(`/propiedades/${id}`).then(({ data }) => data),
  propertyFiles: (id) => request(`/propiedades/${id}/archivos`).then(({ data }) => data),
  createProperty: (body) => request("/propiedades", { method: "POST", body }).then(({ data }) => data),
  updateProperty: (id, body) => request(`/propiedades/${id}`, { method: "PUT", body }).then(({ data }) => data),
  deleteProperty: (id) => request(`/propiedades/${id}`, { method: "DELETE" }),
  uploadPropertyFiles: (id, kind, files) => {
    const body = new FormData();
    for (const file of files) body.append(kind, file);
    return request(`/propiedades/${id}/archivos/${kind}`, { method: "POST", body });
  },
  deletePropertyFile: (id, kind, fileId) => request(`/propiedades/${id}/archivos/${kind}/${fileId}`, { method: "DELETE" }),
  downloadPropertyDocument: async (id, file) => {
    try {
      const { data } = await http.get(`/propiedades/${id}/archivos/documentos/${file.id}`, {
        headers: { Authorization: `Bearer ${getSession()?.token || ""}` },
        responseType: "blob",
      });
      const url = URL.createObjectURL(data);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = file.fileName;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      const status = error.response?.status;
      if (status === 401) {
        clearSession();
        window.location.assign("/login");
      }
      let payload = error.response?.data;
      if (payload instanceof Blob) {
        try { payload = JSON.parse(await payload.text()); }
        catch (e) { console.log(e) }
      }
      throw new Error(payload?.error?.mensaje || (status ? `Error HTTP ${status}` : "No se pudo conectar con el servidor."), { cause: error });
    }
  },
};*/