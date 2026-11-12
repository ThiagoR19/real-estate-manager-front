import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "wouter";

import {
  Skeleton,
  Brand,
  ImagePanel,
  TextField,
  PrimaryButton,
  GoogleSignIn,
  LegalText,
} from "../../components";
import Login from "../login/Login";

import mailIcono from "../../assets/icons/loginMail.svg";
import candadoIcono from "../../assets/icons/loginLock.svg";
import fondo from "../../assets/loginFondo.png";

import "./Register.css";

const DURACION_SALIDA = 900;

export default function Register() {
  const panelRef = useRef(null);

  const [saliendo, setSaliendo] = useState(false);
  const [variablesSalida, setVariablesSalida] = useState({});
  const [, navegar] = useLocation();

  // Cuando termina la animación del hero, cambia a Login
  useEffect(() => {
    if (!saliendo) return;

    const temporizador = setTimeout(() => {
      navegar("/login", { state: { fromRegister: true } });
    }, DURACION_SALIDA);

    return () => clearTimeout(temporizador);
  }, [saliendo, navegar]);

  const enviarFormulario = (e) => {
    e.preventDefault();
    navegar("/confirm-register");
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
              Solo las personas con DNI autorizados pueden crear una cuenta
            </p>
          </header>

          <div className="Registration__campos">
            <TextField
              id="registro-email"
              label="Correo electrónico"
              tipo="email"
              placeholder="ejemplo@gmail.com"
              icono={mailIcono}
              autoComplete="email"
              className="Registration__campo-email"
            />

            <TextField
              id="registro-password"
              label="Contraseña"
              tipo="password"
              placeholder="Ingresa tu contraseña"
              icono={candadoIcono}
              autoComplete="new-password"
            />

            <TextField
              id="registro-confirmar"
              label="Confirmar contraseña"
              tipo="password"
              placeholder="Repite tu contraseña"
              icono={candadoIcono}
              autoComplete="new-password"
            />
          </div>

          <PrimaryButton texto="Crear" className="Registration__boton" />

          <GoogleSignIn texto="Registrarse con" className="Registration__google" />
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
