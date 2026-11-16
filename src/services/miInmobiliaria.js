import { request } from "../utils/request.js";
import { assetUrl } from "../utils/assetUrl.js";

const CAMPOS = ["nombre", "telefono", "ubicacion", "dominio"];
const IMAGENES = ["logo", "banner", "principal"];

// El backend devuelve rutas relativas (/uploads/...); acá se completan con el origen del servidor
const conUrls = (inmobiliaria) => ({
  ...inmobiliaria,
  urlLogo: inmobiliaria.urlLogo ? assetUrl(inmobiliaria.urlLogo) : null,
  urlBanner: inmobiliaria.urlBanner ? assetUrl(inmobiliaria.urlBanner) : null,
  urlPrincipal: inmobiliaria.urlPrincipal ? assetUrl(inmobiliaria.urlPrincipal) : null,
});

// GET /inmobiliarias/mia (solo admin)
export const miInmobiliaria = () => request("/inmobiliarias/mia").then(({ data }) => conUrls(data));

// PUT /inmobiliarias/mia (solo admin): actualización parcial
// datos: { nombre?, telefono?, ubicacion?, dominio? } → solo se mandan los definidos ("" borra el dato)
// imagenes: { logo?, banner?, principal? } → File de imagen (jpeg, png o webp, hasta 2 MB)
//   (por compatibilidad, si se pasa un File solo se toma como logo)
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
