import { request } from "../utils/request.js";
import { assetUrl } from "../utils/assetUrl.js";

const CAMPOS = ["nombre", "telefono", "ubicacion", "dominio"];
const IMAGENES = ["logo", "banner", "principal"];

const conUrls = (inmobiliaria) => ({
  ...inmobiliaria,
  urlLogo: inmobiliaria.urlLogo ? assetUrl(inmobiliaria.urlLogo) : null,
  urlBanner: inmobiliaria.urlBanner ? assetUrl(inmobiliaria.urlBanner) : null,
  urlPrincipal: inmobiliaria.urlPrincipal ? assetUrl(inmobiliaria.urlPrincipal) : null,
});

export const miInmobiliaria = () => request("/inmobiliarias/mia").then(({ data }) => conUrls(data));

export function actualizarMiInmobiliaria(datos = {}, imagenes = {}) {
  const archivos = imagenes instanceof File ? { logo: imagenes } : imagenes || {};
  const campos = Object.fromEntries(CAMPOS.filter((campo) => datos[campo] !== undefined).map((campo) => [campo, datos[campo] ?? ""]));
  const conArchivos = IMAGENES.filter((nombre) => archivos[nombre]);

  let body = campos;
  if (conArchivos.length) {
    body = new FormData();
    Object.entries(campos).forEach(([campo, valor]) => body.append(campo, valor));
    conArchivos.forEach((nombre) => body.append(nombre, archivos[nombre]));
  }

  return request("/inmobiliarias/mia", { method: "PUT", body }).then(({ data }) => conUrls(data));
}
