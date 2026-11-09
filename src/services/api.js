const apiBase = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

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

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = {};
  if (auth) {
    const token = getSession()?.token;
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  if (body && !(body instanceof FormData)) headers["Content-Type"] = "application/json";
  let response;
  try {
    response = await fetch(`${apiBase}${path}`, {
      method, headers, body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("No se pudo conectar con el servidor.");
  }
  let result;
  try { result = await response.json(); }
  catch { throw new Error(`El servidor respondió con HTTP ${response.status}.`); }
  if (!response.ok || result.status !== "success") {
    if (response.status === 401 && auth) {
      clearSession();
      window.location.assign("/login");
    }
    const details = result.error?.detalles?.map(({ campo, problema }) => `${campo}: ${problema}`).join("; ");
    throw new Error(details || result.error?.mensaje || `Error HTTP ${response.status}`);
  }
  return result;
}

export const api = {
  login: (usuario, password) => request("/auth/login", { method: "POST", body: { usuario, password }, auth: false }).then(({ data }) => data),
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
    const response = await fetch(`${apiBase}/propiedades/${id}/archivos/documentos/${file.id}`, {
      headers: { Authorization: `Bearer ${getSession()?.token || ""}` },
    });
    if (response.status === 401) {
      clearSession();
      window.location.assign("/login");
      return;
    }
    if (!response.ok) throw new Error("No se pudo descargar el documento.");
    const url = URL.createObjectURL(await response.blob());
    const link = window.document.createElement("a");
    link.href = url;
    link.download = file.fileName;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  },
};
