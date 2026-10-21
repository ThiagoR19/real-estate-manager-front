import { Link } from 'wouter';

import Marca from '../../components/marca/Marca';
import PanelImagen from '../../components/panelImagen/PanelImagen';
import CampoTexto from '../../components/campoTexto/CampoTexto';
import BotonPrincipal from '../../components/botonPrincipal/BotonPrincipal';
import AccesoGoogle from '../../components/accesoGoogle/AccesoGoogle';
import TextoLegal from '../../components/textoLegal/TextoLegal';

import mailIcono from '../../assets/icons/loginMail.svg';
import candadoIcono from '../../assets/icons/loginLock.svg';

import './Registro.css';

export default function Registro() {

    const enviarFormulario = (e) => {
        e.preventDefault();
    };

    return (
        <main className='Registro'>

            <section className='Registro__panel'>
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

                    <BotonPrincipal texto="Crear" className='Registro__boton' />

                    <AccesoGoogle texto="Registrarse con" className='Registro__google' />
                </form>

                <footer className='Registro__pie'>
                    <TextoLegal className='Registro__legal' />

                    <p className='Registro__cuenta'>
                        ¿Ya tienes una cuenta? <Link href="/login" className='Registro__cuenta-link'>Inicia sesión</Link>
                    </p>
                </footer>
            </section>

            <PanelImagen className='Registro__imagen' />

        </main>
    )
}
