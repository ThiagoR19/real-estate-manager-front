import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { addressCardIcon, cameraIcon, checkIcon, envelopeIcon, eyeIcon, eyeSlashIcon, locationDotIcon, lockIcon, phoneIcon, trashCanIcon, userIcon, } from "../../assets/icons";
import "./Profile.css";
import { Button } from "../../components";
import { api } from "../../services/api.js";

const personalFields = [
  { id: "nombre", label: "Nombre", icon: userIcon },
  { id: "apellido", label: "Apellido", icon: userIcon },
  { id: "telefono", label: "Teléfono", icon: phoneIcon },
  { id: "correo", label: "Correo", icon: envelopeIcon },
  { id: "direccion", label: "Dirección", icon: locationDotIcon },
  { id: "dni", label: "DNI", icon: addressCardIcon },
];

const passwordFields = [
  { id: "current-password", label: "Contraseña actual", placeholder: "Ingresa tu contraseña actual" },
  { id: "new-password", label: "Nueva contraseña", placeholder: "Ingresa una nueva contraseña" },
  { id: "confirm-password", label: "Confirmar nueva contraseña", placeholder: "Repite la nueva contraseña" },
];

function Field({ field, placeholder }) {
  return (
    <label className="profile__field" htmlFor={field.id}>
      <span className="profile__field-label">{field.label}</span>
      <span className="profile__field-control">
        <img className="profile__field-icon" src={field.icon} alt="" />
        <input id={field.id} name={field.id} placeholder={placeholder} required={field.required} />
      </span>
    </label>
  );
}

function PasswordField({ field, visible, onToggle }) {
  return (
    <label className="profile__field" htmlFor={field.id}>
      <span className="profile__field-label">
        {field.label}
        {field.required && <b aria-hidden="true">*</b>}
      </span>
      <span className="profile__field-control profile__field-control--password">
        <input id={field.id} name={field.id} type={visible ? "text" : "password"} placeholder={field.placeholder} required={field.required} />
        <button
          className="profile__password-toggle"
          type="button"
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          aria-pressed={visible}
          onClick={onToggle}
        >
          <img src={visible ? eyeIcon : eyeSlashIcon} alt="" aria-hidden="true" />
        </button>
      </span>
    </label>
  );
}

export default function Profile() {
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [logoutError, setLogoutError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const [profile, setProfile] = useState([]);
  const [, navigate] = useLocation();

  function togglePassword(id) {
    setVisiblePasswords((current) => ({ ...current, [id]: !current[id] }));
  }

  async function closeSession() {
    setLoggingOut(true);
    setLogoutError("");
    try {
      await api.logout();
      navigate("/login");
    } catch (error) {
      setLogoutError(error.message);
      setLoggingOut(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const values = Object.fromEntries(new FormData(e.currentTarget));

    const payload = {
      nombre: String(values.nombre ?? "").trim(),
      apellido: String(values.apellido ?? "").trim(),
      telefono: String(values.telefono ?? "").trim(),
      correo: String(values.correo ?? "").trim(),
      direccion: String(values.direccion ?? "").trim(),
      dni: String(values.dni ?? "").trim(),
    };

    const contraseñaActual = values["current-password"];
    const contraseñaNueva = values["new-password"];
    const confirmarContraseña = values["confirm-password"];

    if (contraseñaActual && contraseñaNueva && confirmarContraseña) {
      const passwordPayload = {
        actual: contraseñaActual,
        nueva: contraseñaNueva,
        confirmacion: confirmarContraseña
      }
      if (contraseñaNueva !== confirmarContraseña) return;
      await api.updatePassword(passwordPayload);
    }

    await api.updateProfile(payload);
  }

  useEffect(() => {
    async function cargarPerfil() {
      try {
        setProfile(await api.profile())
      } catch (e) {
        console.error(e)
      }
    }
    cargarPerfil()

  }, [])

  return (
    <main id="profile">
      <div className="profile__layout">
        <aside className="profile__sidebar">
          <section className="profile__identity-card" aria-label="Resumen del perfil">
            <div className="profile__avatar">
              <span>TR</span>
              <Button icon={cameraIcon} aria-label="Cambiar foto de perfil" />
            </div>
            <h1>Thiago Riffo</h1>
            <p className="profile__role">Administrador</p>
            <p className="profile__email">
              <img src={envelopeIcon} alt="" />
              {"riffo"}thiago19@gmail.com
            </p>
          </section>

          <section className="profile__password-hint" aria-labelledby="password-hint-title">
            <img src={lockIcon} alt="" />
            <div>
              <h2 id="password-hint-title">Tu contraseña debe incluir</h2>
              <ul>
                <li>Al menos 8 caracteres</li>
                <li>Una letra mayúscula</li>
                <li>Una letra minúscula</li>
                <li>Un número</li>
              </ul>
            </div>
          </section>
        </aside>

        <form id="profile-form" className="profile__content" onSubmit={handleSubmit}>
          <header className="profile__content-header">
            <h2>Mi perfil</h2>
            <p>Administra tu información personal, seguridad y preferencias de cuenta</p>
          </header>

          <section className="profile__form-section" aria-labelledby="personal-information-title">
            <div className="profile__section-heading">
              <span className="profile__section-icon"><img src={userIcon} alt="" /></span>
              <div>
                <h3 id="personal-information-title">Información personal</h3>
                <p>Mantén tu información actualizada. Estos datos se utilizan en la plataforma y en las comunicaciones del sistema</p>
              </div>
            </div>
            <div className="profile__fields profile__fields--personal">
              {personalFields.map((field) => <Field key={field.id} field={field} placeholder={profile[field.id] ? profile[field.id] : field.label} />)}
            </div>
          </section>

          <section className="profile__form-section profile__form-section--security" aria-labelledby="security-title">
            <div className="profile__section-heading">
              <span className="profile__section-icon"><img src={lockIcon} alt="" /></span>
              <div>
                <h3 id="security-title">Seguridad</h3>
                <p>Cambia tu contraseña periódicamente para mantener tu cuenta segura</p>
              </div>
            </div>
            <div className="profile__fields profile__fields--passwords">
              {passwordFields.map((field) => (
                <PasswordField
                  key={field.id}
                  field={field}
                  visible={Boolean(visiblePasswords[field.id])}
                  onToggle={() => togglePassword(field.id)}
                />
              ))}
            </div>
          </section>
        </form>
      </div>

      <div className="profile__actions">
        <Button className="profile__logout-button" icon={trashCanIcon} text={loggingOut ? "Cerrando sesión..." : "Cerrar sesión"} onClick={closeSession} disabled={loggingOut} />
        <Button type="submit" form="profile-form" className="profile__save-button" icon={checkIcon} text="Guardar cambios" />
        {logoutError && <p className="profile__logout-error" role="alert">{logoutError}</p>}
      </div>
    </main>
  );
}
