import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'wouter';

import Esqueleto from '../../components/esqueleto/Esqueleto';
import Marca from '../../components/marca/Marca';
import PanelImagen from '../../components/panelImagen/PanelImagen';
import CampoTexto from '../../components/campoTexto/CampoTexto';
import BotonPrincipal from '../../components/botonPrincipal/BotonPrincipal';
import AccesoGoogle from '../../components/accesoGoogle/AccesoGoogle';
import TextoLegal from '../../components/textoLegal/TextoLegal';
import Login from '../login/Login';

import useEnvio from '../../hooks/useEnvio';
import esperar from '../../utils/esperar';

import mailIcono from '../../assets/icons/loginMail.svg';
import candadoIcono from '../../assets/icons/loginLock.svg';
import fondo from '../../assets/loginFondo.png';

import './Registro.css';

const DURACION_SALIDA = 900;

export default function Registro() {
    const panelRef = useRef(null);

    const [estadoEnvio, enviar] = useEnvio();

    const [saliendo, setSaliendo] = useState(false);
    const [variablesSalida, setVariablesSalida] = useState({});
    const [, navegar] = useLocation();

    // Cuando termina la animación del hero, cambia a Login
    useEffect(() => {
        if (!saliendo) return;

        const temporizador = setTimeout(() => {
            navegar("/login", { state: { desdeRegistro: true } });
        }, DURACION_SALIDA);

        return () => clearTimeout(temporizador);
    }, [saliendo, navegar]);

    const enviarFormulario = (e) => {
        e.preventDefault();
        // TODO: reemplazar por la petición real a la API
        enviar(() => esperar(1800));
    };

    const irALogin = (e) => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        e.preventDefault();
        if (saliendo) return;

        const panel = panelRef.current;
        const marca = panel.querySelector('.Registro__marca').getBoundingClientRect();
        const esMobile = window.matchMedia("(max-width: 768px)").matches;

        // Donde está la marca en Login (padding del hero)
        const destinoX = esMobile ? 12 : Math.min(Math.max(24, window.innerWidth * .038), 58);
        const destinoY = esMobile ? 14 : Math.min(Math.max(20, window.innerHeight * .043), 27);

        setVariablesSalida({
            "--salida": `${esMobile ? panel.offsetLeft + panel.offsetWidth : panel.offsetWidth}px`,
            "--marca-dx": `${destinoX - marca.left}px`,
            "--marca-dy": `${destinoY - marca.top}px`,
            "--duracion-salida": `${DURACION_SALIDA}ms`
        });
        setSaliendo(true);
    };

    return (
        <Esqueleto
            as="main"
            className={`Registro ${saliendo ? "Registro--saliendo" : ""}`}
            fondos={[fondo]}
            style={variablesSalida}
        >

            <section className='Registro__panel' ref={panelRef}>
                <Marca oscura className='Registro__marca' />

                <form className='Registro__formulario' onSubmit={enviarFormulario}>
                    <header className='Registro__encabezado'>
                        <h1 className='Registro__titulo'>Crear tu cuenta</h1>

                        <p className='Registro__subtitulo'>
                            Solo las personas con DNI autorizados pueden crear una cuenta
                        </p>
                    </header>

                    <div className='Registro__campos'>
                        <CampoTexto
                            id="registro-email"
                            label="Correo electrónico"
                            tipo="email"
                            placeholder="ejemplo@gmail.com"
                            icono={mailIcono}
                            autoComplete="email"
                            className='Registro__campo-email'
                        />

                        <CampoTexto
                            id="registro-password"
                            label="Contraseña"
                            tipo="password"
                            placeholder="Ingresa tu contraseña"
                            icono={candadoIcono}
                            autoComplete="new-password"
                        />

                        <CampoTexto
                            id="registro-confirmar"
                            label="Confirmar contraseña"
                            tipo="password"
                            placeholder="Repite tu contraseña"
                            icono={candadoIcono}
                            autoComplete="new-password"
                        />
                    </div>

                    <BotonPrincipal
                        texto="Crear"
                        textoEnviando="Creando"
                        estado={estadoEnvio}
                        className='Registro__boton'
                    />

                    <AccesoGoogle texto="Registrarse con" className='Registro__google' />
                </form>

                <footer className='Registro__pie'>
                    <TextoLegal className='Registro__legal' />

                    <p className='Registro__cuenta'>
                        ¿Ya tienes una cuenta? <Link href="/login" onClick={irALogin} className='Registro__cuenta-link'>Inicia sesión</Link>
                    </p>
                </footer>
            </section>

            <PanelImagen className='Registro__imagen' />

            {/* Login en modo skeleton: lo descubre el hero mientras se desliza */}
            {saliendo && createPortal(
                <div className='Registro__login-previo Esqueleto' style={variablesSalida} aria-hidden="true" inert>
                    <Login />
                </div>,
                document.body
            )}

        </Esqueleto>
    )
}
