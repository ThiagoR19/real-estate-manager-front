import { request } from "../utils/request.js";
import { assetUrl } from "../utils/assetUrl.js";

// Inmobiliaria de esta instancia del front (se define en el .env de cada despliegue)
const ID_INMOBILIARIA = import.meta.env.VITE_ID_INMOBILIARIA;

// GET /infoInmobiliaria/:id (público, no necesita sesión): datos de la inmobiliaria para la landing.
// Devuelve { id, aniosExperiencia, propiedadesVendidas, propiedadesActivas, urlLogo, urlBanner, urlPrincipal, ... }
// con las URLs de las imágenes completas (o null). Usa auth: false para que un error nunca mande al visitante al login.
export function infoInmobiliaria(id = ID_INMOBILIARIA) {
  if (!id) {
    return Promise.reject(new Error("Falta VITE_ID_INMOBILIARIA en el .env"));
  }
  return request(`/infoInmobiliaria/${id}`, { auth: false }).then(({ data }) => ({
    ...data,
    urlLogo: data.urlLogo ? assetUrl(data.urlLogo) : null,
    urlBanner: data.urlBanner ? assetUrl(data.urlBanner) : null,
    urlPrincipal: data.urlPrincipal ? assetUrl(data.urlPrincipal) : null,
  }));
}

// GET /infoInmobiliaria/:id/propiedades?limit=N (público): propiedades publicadas para la landing,
// ya con la forma que usa TarjetaPropiedad. limite: de 1 a 12 (6 por defecto).
export function propiedadesDestacadas(limite = 6, id = ID_INMOBILIARIA) {
  if (!id) {
    return Promise.reject(new Error("Falta VITE_ID_INMOBILIARIA en el .env"));
  }
  return request(`/infoInmobiliaria/${id}/propiedades?limit=${limite}`, { auth: false }).then(({ data }) =>
    data.map((propiedad) => ({
      id: propiedad.id,
      titulo: propiedad.nombre,
      direccion: propiedad.ubicacion || "Ubicación a consultar",
      imagen: propiedad.urlImagen ? assetUrl(propiedad.urlImagen) : null,
      dormitorios: propiedad.habitaciones ?? 0,
      banos: propiedad.banios ?? 0,
      superficie: propiedad.tamanio ?? "-",
      operacion: propiedad.operacion,
      estadoComercial: propiedad.estadoComercial,
      tipo: propiedad.tipo,
      precio: propiedad.precio,
      moneda: propiedad.moneda,
    })),
  );
}

const PARAMS_CATALOGO = ["ubicacion", "tipo", "moneda", "precioMin", "precioMax", "habitaciones", "orden", "pagina"];

export function catalogoPropiedades(params, id = ID_INMOBILIARIA) {
  if (!id) {
    return Promise.reject(new Error("Falta VITE_ID_INMOBILIARIA en el .env"));
  }

  const query = new URLSearchParams({
    operacion: params.get("filter") === "rent" ? "Alquiler" : "Venta",
    limite: 12,
  });
  PARAMS_CATALOGO.forEach((clave) => {
    const valor = params.get(clave);
    if (valor) query.set(clave, valor);
  });
  if ((query.has("precioMin") || query.has("precioMax")) && !query.has("moneda")) {
    query.set("moneda", "ARS");
  }

  return request(`/infoInmobiliaria/${id}/catalogo?${query}`, { auth: false }).then(({ data }) => ({
    propiedades: data.items.map((propiedad) => ({
      id: propiedad.id,
      title: propiedad.nombre,
      location: propiedad.ubicacion || "Ubicación a consultar",
      image: assetUrl(propiedad.urlImagen),
      rooms: propiedad.habitaciones ?? "-",
      baths: propiedad.banios ?? "-",
      area: propiedad.tamanio ?? "-",
      operation: propiedad.operacion === "Alquiler" ? "rent" : "buy",
      status: propiedad.estadoComercial,
    })),
    paginacion: data.paginacion,
    tipos: data.tipos,
  }));
}

export function propiedadPublica(idPropiedad, id = ID_INMOBILIARIA) {
  if (!id) {
    return Promise.reject(new Error("Falta VITE_ID_INMOBILIARIA en el .env"));
  }
  return request(`/infoInmobiliaria/${id}/propiedades/${idPropiedad}`, { auth: false }).then(({ data }) => ({
    ...data,
    imagenes: data.imagenes.map(assetUrl),
  }));
}
