import { request } from "../utils/request";

const CLAVE_TOKEN = "contaToken";

function leerToken() {
  try { return localStorage.getItem(CLAVE_TOKEN); }
  catch { return null; }
}

function guardarToken(token) {
  try {
    if (token) localStorage.setItem(CLAVE_TOKEN, token);
    else localStorage.removeItem(CLAVE_TOKEN);
  }
  catch {  }
}

export async function sumarVisita(idInmobiliaria) {
  const body = { idInmobiliaria: Number(idInmobiliaria) };
  const token = leerToken();
  if (token) body.token = token;

  const { data } = await request("/contVisitas", { method: "POST", body, auth: false });
  guardarToken(data.token);
  return data;
}
