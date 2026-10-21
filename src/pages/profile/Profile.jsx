import { useState } from "react";
import {
  addressCardIcon,
  buildingColumnsIcon as buildingIcon,
  cameraIcon,
  phoneIcon,
} from "../../assets/icons";
import "./Profile.css";

const personalFields = [
  { id: "name", label: "Nombre", value: "Juan", icon: addressCardIcon },
  { id: "last-name", label: "Apellido", value: "Perez", icon: addressCardIcon },
  { id: "phone", label: "Teléfono", value: "2133 123123", icon: phoneIcon },
  { id: "email", label: "Correo", value: "ejemplo@gmail.com", icon: addressCardIcon },
  { id: "address", label: "Dirección", value: "Av San Martin 12", icon: buildingIcon },
  { id: "dni", label: "DNI", value: "12123123", icon: addressCardIcon },
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
        <input id={field.id} name={field.id} defaultValue={field.value} placeholder={field.placeholder} required={field.required} />
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
          <span className="profile__eye-icon" aria-hidden="true" />
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
              <img src={addressCardIcon} alt="" />
              {"riffo"}thiago19@gmail.com
            </p>
          </section>

          <section className="profile__password-hint" aria-labelledby="password-hint-title">
            <img src={addressCardIcon} alt="" />
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
              <span className="profile__section-icon"><img src={addressCardIcon} alt="" /></span>
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
              <span className="profile__section-icon"><img src={addressCardIcon} alt="" /></span>
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
        <span aria-hidden="true">✓</span>
        Guardar cambios
      </button>
    </main>
  );
}
