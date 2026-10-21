import { useState } from "react";
import {
  addressCardIcon,
  cameraIcon,
  checkIcon,
  envelopeIcon,
  eyeIcon,
  eyeSlashIcon,
  locationDotIcon,
  lockIcon,
  phoneIcon,
  userIcon,
} from "../../assets/icons";
import "./Profile.css";

const personalFields = [
  { id: "name", label: "Nombre", placeholder: "Juan", icon: userIcon },
  { id: "last-name", label: "Apellido", placeholder: "Perez", icon: userIcon },
  { id: "phone", label: "Teléfono", placeholder: "2133 123123", icon: phoneIcon },
  { id: "email", label: "Correo", placeholder: "ejemplo@gmail.com", icon: envelopeIcon },
  { id: "address", label: "Dirección", placeholder: "Av San Martin 12", icon: locationDotIcon },
  { id: "dni", label: "DNI", placeholder: "12123123", icon: addressCardIcon },
];

const passwordFields = [
  { id: "current-password", label: "Contraseña actual", placeholder: "Ingresa tu contraseña actual", required: true },
  { id: "new-password", label: "Nueva contraseña", placeholder: "Ingresa una nueva contraseña", required: true },
  { id: "confirm-password", label: "Confirmar nueva contraseña", placeholder: "Repite la nueva contraseña" },
];

function Field({ field }) {
  return (
    <label className="profile__field" htmlFor={field.id}>
      <span className="profile__field-label">{field.label}</span>
      <span className="profile__field-control">
        <img className="profile__field-icon" src={field.icon} alt="" />
        <input id={field.id} name={field.id} placeholder={field.placeholder} required={field.required} />
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

  function togglePassword(id) {
    setVisiblePasswords((current) => ({ ...current, [id]: !current[id] }));
  }

  return (
    <main id="profile">
      <div className="profile__layout">
        <aside className="profile__sidebar">
          <section className="profile__identity-card" aria-label="Resumen del perfil">
            <div className="profile__avatar">
              <span>TR</span>
              <button type="button" aria-label="Cambiar foto de perfil">
                <img src={cameraIcon} alt="" />
              </button>
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

        <form className="profile__content" onSubmit={(event) => event.preventDefault()}>
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
              {personalFields.map((field) => <Field key={field.id} field={field} />)}
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

      <button className="profile__save-button" type="button">
        <img src={checkIcon} alt="" aria-hidden="true" />
        Guardar cambios
      </button>
    </main>
  );
}
