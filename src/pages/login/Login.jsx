import { useCallback, useEffect, useRef, useState } from "react";

import { Skeleton, PanelImagen, CampoTexto, BotonPrincipal, TextoLegal, AccesoGoogle } from "../../components";

import { api } from "../../services/api.js";
import { dashboardPorRol } from "../../layouts/navegacion.js";

import mailIcon from "../../assets/icons/loginMail.svg";
import lockIcon from "../../assets/icons/loginLock.svg";
import fondo from "../../assets/loginFondo.png";

import "./Login.css";

export default function Login() {
  const [submitState, setSubmitState] = useState("inactivo");
  const [error, setError] = useState("");
  const [googleCredential, setGoogleCredential] = useState("");
  const [cuentasGoogle, setCuentasGoogle] = useState([]);
  const [cuentasPassword, setCuentasPassword] = useState([]);
  const credencialesPassword = useRef(null);

  const [fromRegister] = useState(() => window.history.state?.fromRegister === true);

  useEffect(() => {
    if (fromRegister) window.history.replaceState(null, "");
  }, [fromRegister]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitState("enviando");
    setError("");
    setCuentasPassword([]);
    const form = new FormData(e.currentTarget);
    const usuario = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");
    credencialesPassword.current = { usuario, password };
    try {
      const session = await api.login(usuario, password);
      if (session.cuentas) {
        setCuentasPassword(session.cuentas);
        setSubmitState("inactivo");
        return;
      }
      api.guardarSesion(session);
      setSubmitState("listo");
      const destination = dashboardPorRol[Number(session.usuario?.rol)] ?? "/dashboard";
      window.location.assign(destination);
    } catch (cause) {
      setError(cause.message);
      setSubmitState("inactivo");
    }
  };

  const completarPassword = async (idUsuario) => {
    if (!credencialesPassword.current) return;
    setError("");
    setSubmitState("enviando");
    try {
      const { usuario, password } = credencialesPassword.current;
      const session = await api.login(usuario, password, idUsuario);
      api.guardarSesion(session);
      window.location.assign(dashboardPorRol[Number(session.usuario?.rol)] ?? "/dashboard");
    } catch (cause) {
      setError(cause.message);
      setSubmitState("inactivo");
    }
  };

  const completarGoogle = useCallback(async (credential, idUsuario) => {
    setError("");
    try {
      const result = await api.loginGoogle(credential, idUsuario);
      if (result.cuentas) {
        setGoogleCredential(credential);
        setCuentasGoogle(result.cuentas);
        return;
      }
      api.guardarSesion(result);
      window.location.assign(dashboardPorRol[Number(result.usuario?.rol)] ?? "/dashboard");
    } catch (cause) {
      setError(cause.message);
    }
  }, []);

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

        {cuentasPassword.length > 0 && <div className="login__organizaciones">
          <p>Elegí la inmobiliaria para continuar:</p>
          {cuentasPassword.map((cuenta) => <button key={cuenta.idUsuario} type="button"
            onClick={() => completarPassword(cuenta.idUsuario)} disabled={submitState === "enviando"}>{cuenta.inmobiliaria}</button>)}
        </div>}

        <AccesoGoogle texto="o continúa con" modo="/login" onCredential={completarGoogle} className="login__google" />
        {cuentasGoogle.length > 0 && <div className="login__organizaciones">
          <p>Elegí la inmobiliaria para continuar:</p>
          {cuentasGoogle.map((cuenta) => <button key={cuenta.idUsuario} type="button"
            onClick={() => completarGoogle(googleCredential, cuenta.idUsuario)}>{cuenta.inmobiliaria}</button>)}
        </div>}

        <div className="login__footer">
          <TextoLegal className="login__terminos" />
          <p className="login__register">
            ¿No tienes una cuenta? Solicitá un enlace de invitación a la inmobiliaria.
          </p>
        </div>
      </section>
    </Skeleton>
  );
}
