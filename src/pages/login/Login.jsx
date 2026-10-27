
import {
  ImagePanel,
  TextField,
  PrimaryButton,
  GoogleSignIn,
  LegalText
} from '../../components';


import mailIcon from "../../assets/icons/loginMail.svg"
import lockIcon from "../../assets/icons/loginLock.svg"

import "./Login.css"

export default function Login() {

  // Si venimos de la animación de Registration, el hero ya está en pantalla: solo falta el panel


  return (
    <>
      <ImagePanel conBrand className={`login__hero `} />
      <section className="login__panel">
        <form className="login__form" >
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
          />

          <GoogleSignIn texto="o continúa con" />
        </form>

        <LegalText className="login__terms" />
      </section>
    </>
  );
}
