import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../services/api";
import { mostrarAviso } from "../components";

export const FORMATOS_IMAGEN = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 2 * 1024 * 1024;

const CAMPOS_VACIOS = { nombre: "", telefono: "", ubicacion: "" };
const SIN_ARCHIVOS = { logo: null, banner: null, principal: null };

function imagenValida(file) {
  if (!FORMATOS_IMAGEN.includes(file.type)) {
    mostrarAviso({ tipo: "advertencia", titulo: "Formato no permitido", mensaje: "La imagen debe ser JPG, PNG o WEBP" });
    return false;
  }
  if (file.size > MAX_BYTES) {
    mostrarAviso({ tipo: "advertencia", titulo: "Imagen muy pesada", mensaje: "La imagen no puede superar los 2 MB" });
    return false;
  }
  return true;
}

function leerRespuesta(data) {
  return {
    guardado: { nombre: data.nombre || "", telefono: data.telefono || "", ubicacion: data.ubicacion || "" },
    imagenes: { logo: data.urlLogo || "", banner: data.urlBanner || "", principal: data.urlPrincipal || "" },
  };
}

export default function useMiInmobiliaria() {
  const [guardado, setGuardado] = useState(CAMPOS_VACIOS);
  const [campos, setCampos] = useState(CAMPOS_VACIOS);
  const [imagenes, setImagenes] = useState({ logo: "", banner: "", principal: "" });
  const [archivos, setArchivos] = useState(SIN_ARCHIVOS);
  const [estado, setEstado] = useState("cargando");
  const vistasPrevias = useRef([]);

  const cargar = useCallback(() => {
    let activo = true;
    api.miInmobiliaria()
      .then((data) => {
        if (!activo) return;
        const respuesta = leerRespuesta(data);
        setGuardado(respuesta.guardado);
        setImagenes(respuesta.imagenes);
      })
      .catch((causa) => activo && mostrarAviso({ tipo: "error", titulo: "No se pudo cargar la inmobiliaria", mensaje: causa.message }))
      .finally(() => activo && setEstado("listo"));
    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => cargar(), [cargar]);

  useEffect(() => () => vistasPrevias.current.forEach((url) => URL.revokeObjectURL(url)), []);

  function cambiarCampo(event) {
    const { name, value } = event.target;
    setCampos((actual) => ({ ...actual, [name]: value }));
    setEstado("listo");
  }

  function cambiarImagen(nombre, file) {
    if (!imagenValida(file)) return;
    const url = URL.createObjectURL(file);
    vistasPrevias.current.push(url);
    setImagenes((actual) => ({ ...actual, [nombre]: url }));
    setArchivos((actual) => ({ ...actual, [nombre]: file }));
    setEstado("listo");
  }

  async function guardar(event) {
    event?.preventDefault();
    if (estado === "cargando" || estado === "guardando") return;

    const datos = Object.fromEntries(Object.keys(campos).map((campo) => [campo, campos[campo].trim() || guardado[campo]]));
    if (!datos.nombre) {
      mostrarAviso({ tipo: "advertencia", titulo: "Falta el nombre", mensaje: "La inmobiliaria tiene que tener un nombre" });
      return;
    }

    setEstado("guardando");
    try {
      const respuesta = leerRespuesta(await api.actualizarMiInmobiliaria(datos, archivos));
      setGuardado(respuesta.guardado);
      setImagenes(respuesta.imagenes);
      setCampos(CAMPOS_VACIOS);
      setArchivos(SIN_ARCHIVOS);
      setEstado("guardado");
      mostrarAviso({ tipo: "exito", titulo: "Cambios guardados", mensaje: "Los datos de la inmobiliaria se actualizaron" });
    } catch (causa) {
      setEstado("listo");
      mostrarAviso({ tipo: "error", titulo: "No se pudieron guardar los cambios", mensaje: causa.message });
    }
  }

  return { guardado, campos, imagenes, estado, cambiarCampo, cambiarImagen, guardar };
}
