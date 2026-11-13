import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "wouter";

import {
  Skeleton,
  Brand,
  ImagePanel,
  TextField,
  PrimaryButton,
  LegalText,
} from "../../components";
import Login from "../login/Login";
import { clearRegistrationDraft, getRegistrationDraft } from "../../services/registrationDraft.js";
import { api } from "../../services/api.js";

import mailIcono from "../../assets/icons/loginMail.svg";
import candadoIcono from "../../assets/icons/loginLock.svg";
import fondo from "../../assets/loginFondo.png";

import "./Register.css";

const DURACION_SALIDA = 900;

export default function Register() {
  const panelRef = useRef(null);

  const [saliendo, setSaliendo] = useState(false);
  const [variablesSalida, setVariablesSalida] = useState({});
  const [error, setError] = useState("");
  const [status, setStatus] = useState("inactivo");
  const draft = getRegistrationDraft();
  const [, navegar] = useLocation();

  // Cuando termina la animación del hero, cambia a Login
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
      const session = await api.register({ verificacion: draft.verificacion, usuario, password });
      api.saveSession(session);
      clearRegistrationDraft();
      window.location.assign("/profile");
    } catch (cause) {
      setError(cause.message);
      setStatus("inactivo");
    }
  };

  const irALogin = (e) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    e.preventDefault();
    if (saliendo) return;

    const panel = panelRef.current;
    const marca = panel.querySelector(".Registration__marca").getBoundingClientRect();
    const esMobile = window.matchMedia("(max-width: 768px)").matches;

    // Donde está la marca en Login (padding del hero)
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
      className={`Registration ${saliendo ? "Registration--saliendo" : ""}`}
      fondos={[fondo]}
      style={variablesSalida}
    >
      <section className="Registration__panel" ref={panelRef}>
        <Brand oscura className="Registration__marca" />

        <form className="Registration__formulario" onSubmit={enviarFormulario}>
          <header className="Registration__encabezado">
            <h1 className="Registration__titulo">Crear tu cuenta</h1>

            <p className="Registration__subtitulo">
              Elegí tu nombre de usuario y contraseña para activar tu cuenta.
            </p>
          </header>

          {draft?.verificacion ? <div className="Registration__campos">
            <TextField
              id="registro-usuario"
              label="Nombre de usuario"
              placeholder="Elegí un nombre de usuario"
              icono={mailIcono}
              autoComplete="username"
              required
              className="Registration__campo-email"
            />

            <TextField
              id="registro-password"
              label="Contraseña"
              tipo="password"
              placeholder="Ingresa tu contraseña"
              icono={candadoIcono}
              autoComplete="new-password"
              required
              minLength={8}
              conOjo
            ><small>Al menos 8 caracteres, con mayúscula, minúscula y número.</small></TextField>

            <TextField
              id="registro-confirmar"
              label="Confirmar contraseña"
              tipo="password"
              placeholder="Repite tu contraseña"
              icono={candadoIcono}
              autoComplete="new-password"
              required
              minLength={8}
              conOjo
            />
          </div> : <p className="Registration__error">Para crear tu cuenta, abrí el enlace de invitación y verificá tu DNI.</p>}

          {error && <p className="Registration__error" role="alert">{error}</p>}
          {draft?.verificacion && <PrimaryButton texto="Crear cuenta" textoEnviando="Creando cuenta" estado={status} className="Registration__boton" />}
        </form>

        <footer className="Registration__pie">
          <LegalText className="Registration__legal" />

          <p className="Registration__cuenta">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" onClick={irALogin} className="Registration__cuenta-link">
              Inicia sesión
            </Link>
          </p>
        </footer>
      </section>

      <ImagePanel className="Registration__imagen" />

      {/* Login en modo skeleton: lo descubre el hero mientras se desliza */}
      {saliendo &&
        createPortal(
          <div
            className="Registration__login-previo Skeleton"
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
