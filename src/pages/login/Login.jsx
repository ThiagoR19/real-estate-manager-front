import { useEffect, useState } from "react";
import { Link } from "wouter";

import { Skeleton, PanelImagen, CampoTexto, BotonPrincipal, TextoLegal } from "../../components";

import { api } from "../../services/api.js";
import { dashboardPorRol } from "../../layouts/navegacion.js";

import mailIcon from "../../assets/icons/loginMail.svg";
import lockIcon from "../../assets/icons/loginLock.svg";
import fondo from "../../assets/loginFondo.png";

import "./Login.css";

export default function Login() {
  const [submitState, setSubmitState] = useState("inactivo");
  const [error, setError] = useState("");

  const [fromRegister] = useState(() => window.history.state?.fromRegister === true);

  useEffect(() => {
    if (fromRegister) window.history.replaceState(null, "");
  }, [fromRegister]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitState("enviando");
    setError("");
    const form = new FormData(e.currentTarget);
    try {
      const session = await api.login(
        String(form.get("email") || "").trim(),
        String(form.get("password") || ""),
      );
      api.guardarSesion(session);
      setSubmitState("listo");
      const destination = dashboardPorRol[Number(session.usuario?.rol)] ?? "/dashboard";
      window.location.assign(destination);
    } catch (cause) {
      setError(cause.message);
      setSubmitState("inactivo");
    }
  };

  return (
    <Skeleton as="main" className="login" fondos={[fondo]}>
      <PanelImagen conMarca className={`login__hero ${fromRegister ? "Skeleton-no" : ""}`} />
      <section className="login__panel">
        <form className="login__form" onSubmit={handleSubmit}>
          <header className="login__header">
            <h1 className="login__title">Bienvenido de nuevo</h1>
            <p className="login__subtitle">Ingresa tus datos para continuar</p>
          </header>

          <CampoTexto
            id="email"
            label="Usuario"
            tipo="text"
            placeholder="Tu usuario"
            icono={mailIcon}
            autoComplete="username"
            required
            className="login__field"
          />

          <CampoTexto
            id="password"
            label="Contraseña"
            tipo="password"
            placeholder="Ingresa tu contraseña"
            icono={lockIcon}
            autoComplete="current-password"
            required
            conOjo
            className="login__field Login-pass"
          ></CampoTexto>

          <BotonPrincipal
            texto="Ingresar"
            textoEnviando="Ingresando"
            estado={submitState}
            className="login__submit"
          />

          {error && (
            <p className="login__error" role="alert">
              {error}
            </p>
          )}
        </form>

        <div className="login__footer">
          <TextoLegal className="login__terminos" />
          <p className="login__register">
            ¿No tienes una cuenta? <Link href="/registro">Regístrate</Link>
          </p>
        </div>
      </section>
    </Skeleton>
  );
}
