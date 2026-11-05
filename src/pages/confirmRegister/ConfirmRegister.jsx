import { useLocation } from "wouter";

import { Skeleton, ImagePanel, TextField, PrimaryButton, LegalText } from "../../components";
import useSubmit from "../../hooks/useSubmit";
import wait from "../../utils/wait";

import addressCardIcon from "../../assets/icons/address-card-regular-full.svg";
import background from "../../assets/loginFondo.png";

import "./ConfirmRegister.css";

export default function ConfirmRegister() {
  const [, navigate] = useLocation();
  const [submitState, submit] = useSubmit();

  function handleSubmit(event) {
    event.preventDefault();
    submit(async () => {
      await wait(700);
      navigate("/login");
    });
  }

  return (
    <Skeleton as="main" className="confirm-register" fondos={[background]}>
      <ImagePanel conBrand className="confirm-register__background" />

      <section className="confirm-register__card" aria-labelledby="confirm-register-title">
        <form className="confirm-register__form" onSubmit={handleSubmit}>
          <header className="confirm-register__header">
            <h1 id="confirm-register-title">Verificación</h1>
            <p>Ingrese el DNI que está como titular en el contrato para poder acceder a administrar del inmueble</p>
          </header>

          <TextField
            id="authorized-id"
            label="DNI autorizado"
            placeholder="DNI"
            icono={addressCardIcon}
            autoComplete="off"
            className="confirm-register__field"
          >
            <small>Solo tiene 3 intentos, si los falla pídale un nuevo enlace a la inmobiliaria</small>
          </TextField>

          <PrimaryButton
            texto="Verificar"
            textoEnviando="Verificando"
            estado={submitState}
            className="confirm-register__submit"
          />
        </form>

        <footer className="confirm-register__footer">
          <LegalText />
          <p>¿Ya tienes una cuenta? <button type="button" onClick={() => navigate("/login")}>Inicia sesión</button></p>
        </footer>
      </section>
    </Skeleton>
  );
}
