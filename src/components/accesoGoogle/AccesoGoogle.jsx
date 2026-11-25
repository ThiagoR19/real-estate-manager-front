import { useEffect, useRef, useState } from "react";
import { mostrarAviso } from "../avisos/almacenAvisos";
import { loginGoogleIcon } from "../../assets/icons";
import "./AccesoGoogle.css";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const clientIdValido = /^[^\s]+\.apps\.googleusercontent\.com$/.test(clientId ?? "");
const callbacks = new Map();
let scriptPromise;
let initialized = false;

function cargarGoogle() {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error("No se pudo cargar Google"));
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
}

function cubrirBoton(capa) {
  if (!capa?.offsetWidth || !capa.offsetHeight) return;
  const { offsetWidth: ancho, offsetHeight: alto } = capa.parentElement;
  capa.style.transform = `scale(${ancho / capa.offsetWidth}, ${alto / capa.offsetHeight})`;
}

export default function AccesoGoogle({ texto, className = "", onCredential, onError, modo }) {
  const container = useRef(null);
  const [unavailable, setUnavailable] = useState(false);
  const disponible = clientIdValido && !unavailable;
  const mensajeNoDisponible = !clientId
    ? "Falta configurar VITE_GOOGLE_CLIENT_ID en el .env del frontend. Reiniciá Vite después de agregarla."
    : !clientIdValido
      ? "VITE_GOOGLE_CLIENT_ID debe ser el ID de cliente web (...apps.googleusercontent.com), no el secreto. Reiniciá Vite después de corregirlo."
      : "No se pudo cargar Google. Revisá la conexión y el Client ID configurado.";
  const credentialHandler = useRef(onCredential);
  const errorHandler = useRef(onError);
  useEffect(() => {
    credentialHandler.current = onCredential;
    errorHandler.current = onError;
  }, [onCredential, onError]);

  useEffect(() => {
    if (!clientIdValido) return;
    const handler = (credential) => credentialHandler.current?.(credential);
    callbacks.set(modo, handler);
    let active = true;
    let observador;
    cargarGoogle().then(() => {
      if (!active || !container.current) return;
      if (!initialized) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: ({ credential }) => callbacks.get(window.location.pathname)?.(credential),
        });
        initialized = true;
      }
      window.google.accounts.id.renderButton(container.current, {
        type: "standard", theme: "outline", size: "large", text: "continue_with",
        shape: "rectangular", width: 400,
      });
      const capa = container.current;
      observador = new ResizeObserver(() => cubrirBoton(capa));
      observador.observe(capa.parentElement);
      observador.observe(capa);
    }).catch((error) => {
      if (active) {
        setUnavailable(true);
        errorHandler.current?.(error.message);
        mostrarAviso({ tipo: "error", titulo: "No se pudo cargar Google", mensaje: error.message || "Revisá la conexión y volvé a intentar." });
      }
    });
    return () => {
      active = false;
      observador?.disconnect();
      if (callbacks.get(modo) === handler) callbacks.delete(modo);
    };
  }, [modo]);

  return (
    <div className={`AccesoGoogle ${className}`}>
      {texto && <div className="AccesoGoogle__separador"><span>{texto}</span></div>}
      <div className="AccesoGoogle__contenedor">
        <button className="AccesoGoogle__boton" type="button" disabled={!disponible} tabIndex={-1} aria-hidden={disponible}>
          <span className="AccesoGoogle__icono"><img src={loginGoogleIcon} alt="" /></span>Google
        </button>
        {disponible && <div className="AccesoGoogle__capaGoogle" ref={container} />}
      </div>
      {!disponible && <p className="AccesoGoogle__noDisponible">{mensajeNoDisponible}</p>}
    </div>
  );
}
