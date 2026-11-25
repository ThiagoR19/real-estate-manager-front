import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "wouter";

import { Skeleton, Marca, PanelImagen, CampoTexto, BotonPrincipal, TextoLegal, AccesoGoogle, mostrarAviso } from "../../components";
import Login from "../login/Login";
import { limpiarBorradorRegistro, obtenerBorradorRegistro } from "../../services/borradorRegistro.js";
import { api } from "../../services/api.js";

import { loginMailIcon, loginLockIcon } from "../../assets/icons";

import "./Registro.css";

const DURACION_SALIDA = 900;

export default function Registro() {
  const panelRef = useRef(null);

  const [saliendo, setSaliendo] = useState(false);
  const [variablesSalida, setVariablesSalida] = useState({});
  const [error, setError] = useState("");
  const [status, setStatus] = useState("inactivo");
  const draft = obtenerBorradorRegistro();
  const [, navegar] = useLocation();


  useEffect(() => {
    if (!saliendo) return;

    const temporizador = setTimeout(() => {
      navegar("/login", { state: { fromRegister: true } });
    }, DURACION_SALIDA);

    return () => clearTimeout(temporizador);
  }, [saliendo, navegar]);

  const enviarFormulario = async (e) => {
    e.preventDefault();
    if (!draft?.verificacion) return;
    const form = new FormData(e.currentTarget);
    const password = String(form.get("registro-password") || "");
    const confirmation = String(form.get("registro-confirmar") || "");
    const usuario = String(form.get("registro-usuario") || "").trim();
    if (password !== confirmation) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setError("");
    setStatus("enviando");
    try {
      const session = await api.registrar({ verificacion: draft.verificacion, usuario, password });
      api.guardarSesion(session);
      limpiarBorradorRegistro();
      window.location.assign("/perfil");
    } catch (cause) {
      mostrarAviso({ tipo: "error", titulo: "No se pudo crear la cuenta", mensaje: cause.message });
      setStatus("inactivo");
    }
  };

  const registrarConGoogle = useCallback(async (credential) => {
    if (!draft?.verificacion) return;
    setError("");
    setStatus("enviando");
    try {
      const session = await api.registrarGoogle(draft.verificacion, credential);
      api.guardarSesion(session);
      limpiarBorradorRegistro();
      window.location.assign("/perfil");
    } catch (cause) {
      mostrarAviso({ tipo: "error", titulo: "No se pudo crear la cuenta con Google", mensaje: cause.message });
      setStatus("inactivo");
    }
  }, [draft?.verificacion]);

  const irALogin = (e) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    e.preventDefault();
    if (saliendo) return;

    const panel = panelRef.current;
    const marca = panel.querySelector(".Registro__marca").getBoundingClientRect();
    const esMobile = window.matchMedia("(max-width: 768px)").matches;


    const destinoX = esMobile ? 12 : Math.min(Math.max(24, window.innerWidth * 0.038), 58);
    const destinoY = esMobile ? 14 : Math.min(Math.max(20, window.innerHeight * 0.043), 27);

    setVariablesSalida({
      "--salida": `${esMobile ? panel.offsetLeft + panel.offsetWidth : panel.offsetWidth}px`,
      "--marca-dx": `${destinoX - marca.left}px`,
      "--marca-dy": `${destinoY - marca.top}px`,
      "--duracion-salida": `${DURACION_SALIDA}ms`,
    });
    setSaliendo(true);
  };

  return (
    <Skeleton
      as="main"
      className={`Registro ${saliendo ? "Registro--saliendo" : ""}`}
      style={variablesSalida}
    >
      <section className="Registro__panel" ref={panelRef}>
        <Marca oscura className="Registro__marca" />

        <form className="Registro__formulario" onSubmit={enviarFormulario}>
          <header className="Registro__encabezado">
            <h1 className="Registro__titulo">Crear tu cuenta</h1>

            <p className="Registro__subtitulo">
              Elegí tu nombre de usuario y contraseña para activar tu cuenta.
            </p>
          </header>

          {draft?.verificacion ? <div className="Registro__campos">
            <CampoTexto
              id="registro-usuario"
              label="Nombre de usuario"
              placeholder="Elegí un nombre de usuario"
              icono={loginMailIcon}
              autoComplete="username"
              required
              className="Registro__campo-email"
            />

            <CampoTexto
              id="registro-password"
              label="Contraseña"
              tipo="password"
              placeholder="Ingresa tu contraseña"
              icono={loginLockIcon}
              autoComplete="new-password"
              required
              minLength={8}
              conOjo
            ><small>Al menos 8 caracteres, con mayúscula, minúscula y número.</small></CampoTexto>

            <CampoTexto
              id="registro-confirmar"
              label="Confirmar contraseña"
              tipo="password"
              placeholder="Repite tu contraseña"
              icono={loginLockIcon}
              autoComplete="new-password"
              required
              minLength={8}
              conOjo
            />
          </div> : <p className="Registro__error">Para crear tu cuenta, abrí el enlace de invitación y verificá tu DNI.</p>}

          {error && <p className="Registro__error" role="alert">{error}</p>}
          {draft?.verificacion && <BotonPrincipal texto="Crear cuenta" textoEnviando="Creando cuenta" estado={status} className="Registro__boton" />}
        </form>

        {draft?.verificacion && <AccesoGoogle texto="o regístrate con" modo="/registro" onCredential={registrarConGoogle} />}

        <footer className="Registro__pie">
          <TextoLegal className="Registro__legal" />

          <p className="Registro__cuenta">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" onClick={irALogin} className="Registro__cuenta-link">
              Inicia sesión
            </Link>
          </p>
        </footer>
      </section>

      <PanelImagen className="Registro__imagen" />

      { }
      {saliendo &&
        createPortal(
          <div
            className="Registro__login-previo Skeleton"
            style={variablesSalida}
            aria-hidden="true"
            inert
          >
            <Login />
          </div>,
          document.body,
        )}
    </Skeleton>
  );
}
