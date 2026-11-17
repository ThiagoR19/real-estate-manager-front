import { useState } from "react";
import { useLocation } from "wouter";
import { Skeleton, PanelImagen, CampoTexto, BotonPrincipal, TextoLegal, mostrarAviso } from "../../components";
import { api } from "../../services/api.js";
import { guardarBorradorRegistro } from "../../services/borradorRegistro.js";
import addressCardIcon from "../../assets/icons/address-card-regular-full.svg";
import background from "../../assets/loginFondo.png";
import "./ConfirmarRegistro.css";

export default function ConfirmarRegistro() {
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
      const { verificacion } = await api.verificarDniInvitacion(codigo, dni);
      guardarBorradorRegistro({ verificacion });
      setStatus("listo");
      mostrarAviso({ tipo: "exito", titulo: "DNI verificado", mensaje: "Ya podés crear tu cuenta." });
      navigate("/registro");
    } catch (cause) {
      mostrarAviso({ tipo: "error", titulo: "No se pudo verificar el DNI", mensaje: cause.message });
      setStatus("inactivo");
    }
  }

  return (
    <Skeleton as="main" className="confirmar-registro" fondos={[background]}>
      <PanelImagen conMarca className="confirmar-registro__background" />
      <section className="confirmar-registro__card" aria-labelledby="confirmar-registro-title">
        <form className="confirmar-registro__form" onSubmit={handleSubmit}>
          <header className="confirmar-registro__header"><h1 id="confirmar-registro-title">Verificación</h1><p>Ingresá el DNI autorizado por la inmobiliaria para activar tu cuenta.</p></header>
          {/^[a-f0-9]{64}$/i.test(codigo) ? <><CampoTexto id="authorized-id" label="DNI autorizado" placeholder="DNI sin puntos" icono={addressCardIcon} autoComplete="off" inputMode="numeric" required className="confirmar-registro__field"><small>Tenés 3 intentos. Si se agotan, solicitá una nueva invitación.</small></CampoTexto>{error && <p className="confirmar-registro__error" role="alert">{error}</p>}<BotonPrincipal texto="Verificar DNI" textoEnviando="Verificando" estado={status} className="confirmar-registro__submit" /></> : <p className="confirmar-registro__error">Abrí el enlace de invitación que te enviaron para verificar tu DNI.</p>}
        </form>
        <footer className="confirmar-registro__footer"><TextoLegal /><p>¿Ya tienes una cuenta? <button type="button" onClick={() => navigate("/login")}>Inicia sesión</button></p></footer>
      </section>
    </Skeleton>
  );
}
