import { useState } from "react";
import { useLocation } from "wouter";
import { Skeleton, ImagePanel, TextField, PrimaryButton, LegalText } from "../../components";
import { api } from "../../services/api.js";
import { setRegistrationDraft } from "../../services/registrationDraft.js";
import addressCardIcon from "../../assets/icons/address-card-regular-full.svg";
import background from "../../assets/loginFondo.png";
import "./ConfirmRegister.css";

export default function ConfirmRegister() {
  const [, navigate] = useLocation();
  const [status, setStatus] = useState("inactivo");
  const [error, setError] = useState("");
  const codigo = new URLSearchParams(window.location.search).get("codigo") || "";

  async function handleSubmit(event) {
    event.preventDefault();
    if (!/^[a-f0-9]{64}$/i.test(codigo)) return;
    const dni = String(new FormData(event.currentTarget).get("authorized-id") || "").replace(/\D/g, "");
    if (!/^\d{7,8}$/.test(dni)) {
      setError("Ingresá un DNI válido de 7 u 8 números.");
      return;
    }
    setStatus("enviando");
    setError("");
    try {
      const { verificacion } = await api.verifyInvitationDni(codigo, dni);
      setRegistrationDraft({ verificacion });
      setStatus("listo");
      navigate("/register");
    } catch (cause) {
      setError(cause.message);
      setStatus("inactivo");
    }
  }

  return (
    <Skeleton as="main" className="confirm-register" fondos={[background]}>
      <ImagePanel conBrand className="confirm-register__background" />
      <section className="confirm-register__card" aria-labelledby="confirm-register-title">
        <form className="confirm-register__form" onSubmit={handleSubmit}>
          <header className="confirm-register__header"><h1 id="confirm-register-title">Verificación</h1><p>Ingresá el DNI autorizado por la inmobiliaria para activar tu cuenta.</p></header>
          {/^[a-f0-9]{64}$/i.test(codigo) ? <><TextField id="authorized-id" label="DNI autorizado" placeholder="DNI sin puntos" icono={addressCardIcon} autoComplete="off" inputMode="numeric" required className="confirm-register__field"><small>Tenés 3 intentos. Si se agotan, solicitá una nueva invitación.</small></TextField>{error && <p className="confirm-register__error" role="alert">{error}</p>}<PrimaryButton texto="Verificar DNI" textoEnviando="Verificando" estado={status} className="confirm-register__submit" /></> : <p className="confirm-register__error">Abrí el enlace de invitación que te enviaron para verificar tu DNI.</p>}
        </form>
        <footer className="confirm-register__footer"><LegalText /><p>¿Ya tienes una cuenta? <button type="button" onClick={() => navigate("/login")}>Inicia sesión</button></p></footer>
      </section>
    </Skeleton>
  );
}
