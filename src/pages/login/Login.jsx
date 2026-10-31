import { useEffect, useState } from "react";
import { Link } from "wouter";

import Skeleton from "../../components/skeleton/Skeleton";
import ImagePanel from "../../components/imagePanel/ImagePanel";
import TextField from "../../components/textField/TextField";
import PrimaryButton from "../../components/primaryButton/PrimaryButton";
import GoogleSignIn from "../../components/googleSignIn/GoogleSignIn";
import LegalText from "../../components/legalText/LegalText";

import useSubmit from "../../hooks/useSubmit";
import wait from "../../utils/wait";

import mailIcon from "../../assets/icons/loginMail.svg"
import lockIcon from "../../assets/icons/loginLock.svg"
import fondo from "../../assets/loginFondo.png"

import "./Login.css"

export default function Login() {
    const [submitState, submit] = useSubmit();

    // Si venimos de la animación de Register, el hero ya está en pantalla: solo falta el panel
    const [fromRegister] = useState(() => window.history.state?.fromRegister === true);

    useEffect(() => {
        if (fromRegister) window.history.replaceState(null, "");
    }, [fromRegister]);

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: reemplazar por la petición real a la API
        submit(() => wait(1800));
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
                        label="Correo electrónico"
                        tipo="email"
                        placeholder="ejemplo@gmail.com"
                        icono={mailIcon}
                        autoComplete="email"
                        className="login__field"
                    />

                    <TextField
                        id="password"
                        label="Contraseña"
                        tipo="password"
                        placeholder="Ingresa tu contraseña"
                        icono={lockIcon}
                        autoComplete="current-password"
                        conOjo
                        className="login__field Login-pass"
                    >
                        <a href="#" className="login__forgot">¿Olvidaste tu contraseña?</a>
                    </TextField>

                    <PrimaryButton
                        texto="Ingresar"
                        textoEnviando="Ingresando"
                        estado={submitState}
                        className="login__submit"
                    />

                    <GoogleSignIn texto="o continúa con" />
                </form>

                <div className="login__footer">
                    <LegalText className="login__terms" />
                    <p className="login__register">¿No tienes una cuenta? <Link href="/register">Regístrate</Link></p>
                </div>
            </section>
        </Skeleton>
    );
}
