import { useEffect, useState } from "react";
import { Link } from "wouter";

import { Skeleton, ImagePanel, TextField, PrimaryButton, LegalText } from "../../components";

import { api } from "../../services/api.js";

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
      api.saveSession(session);
      setSubmitState("listo");
      const role = session.usuario.rol;
      window.location.assign(
        role === 1
          ? "/super-admin"
          : role === 4
            ? "/owner-dashboard"
            : role === 5
              ? "/tenant-dashboard"
              : "/properties",
      );
    } catch (cause) {
      setError(cause.message);
      setSubmitState("inactivo");
    }
  };

  return (
    <Skeleton as="main" className="login" fondos={[fondo]}>
      <ImagePanel conBrand className={`login__hero ${fromRegister ? "Skeleton-no" : ""}`} />
      <section className="login__panel">
        <form className="login__form" onSubmit={handleSubmit}>
          <header className="login__header">
            <h1 className="login__title">Bienvenido de nuevo</h1>
            <p className="login__subtitle">Ingresa tus datos para continuar</p>
          </header>

          <TextField
            id="email"
            label="Usuario"
            tipo="text"
            placeholder="Tu usuario"
            icono={mailIcon}
            autoComplete="username"
            required
            className="login__field"
          />

          <TextField
            id="password"
            label="Contraseña"
            tipo="password"
            placeholder="Ingresa tu contraseña"
            icono={lockIcon}
            autoComplete="current-password"
            required
            conOjo
            className="login__field Login-pass"
          ></TextField>

          <PrimaryButton
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
          <LegalText className="login__terms" />
          <p className="login__register">
            ¿No tienes una cuenta? <Link href="/register">Regístrate</Link>
          </p>
        </div>
      </section>
    </Skeleton>
  );
}
