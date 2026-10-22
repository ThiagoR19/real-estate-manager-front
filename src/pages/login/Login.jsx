import { useEffect, useRef, useState } from "react";

import PanelImagen from "../../components/panelImagen/PanelImagen";
import CampoTexto from "../../components/campoTexto/CampoTexto";
import BotonPrincipal from "../../components/botonPrincipal/BotonPrincipal";
import AccesoGoogle from "../../components/accesoGoogle/AccesoGoogle";
import TextoLegal from "../../components/textoLegal/TextoLegal";
import SkeletonAuth from "../../components/skeletonAuth/SkeletonAuth";

import useCargaCompleta from "../../hooks/useCargaCompleta";
import useEnvio from "../../hooks/useEnvio";
import esperar from "../../utils/esperar";

import mailIcon from "../../assets/icons/loginMail.svg"
import lockIcon from "../../assets/icons/loginLock.svg"
import fondo from "../../assets/loginFondo.png"

import "./Login.css"

export default function Login() {
    const vistaRef = useRef(null);
    const cargado = useCargaCompleta(vistaRef, [fondo]);
    const [estadoEnvio, enviar] = useEnvio();

    // Si venimos de la animación de Registro, el hero ya está en pantalla: solo falta el panel
    const [desdeRegistro] = useState(() => window.history.state?.desdeRegistro === true);

    useEffect(() => {
        if (desdeRegistro) window.history.replaceState(null, "");
    }, [desdeRegistro]);

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: reemplazar por la petición real a la API
        enviar(() => esperar(1800));
    };

    return (
        <main className="login" ref={vistaRef}>
            <PanelImagen conMarca className="login__hero" />
            <section className="login__panel">
                <form className="login__form" onSubmit={handleSubmit}>
                    <header className="login__header">
                        <h1 className="login__title">Bienvenido de nuevo</h1>
                        <p className="login__subtitle">Ingresa tus datos para continuar</p>
                    </header>

                    <CampoTexto
                        id="email"
                        label="Correo electrónico"
                        tipo="email"
                        placeholder="ejemplo@gmail.com"
                        icono={mailIcon}
                        autoComplete="email"
                        className="login__field"
                    />

                    <CampoTexto
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
                    </CampoTexto>

                    <BotonPrincipal
                        texto="Ingresar"
                        textoEnviando="Ingresando"
                        estado={estadoEnvio}
                        className="login__submit"
                    />

                    <AccesoGoogle texto="o continúa con" />
                </form>

                <TextoLegal className="login__terms" />
            </section>

            <SkeletonAuth variante="login" sinHero={desdeRegistro} oculto={cargado} />
        </main>
    );
}
