import { useEffect, useState } from "react";
import { briefcaseIcon, envelopeIcon, phoneIcon, userIcon } from "../../assets/icons";
import { Boton } from "../../components";
import useClosingTransition from "../../hooks/useClosingTransition.js";
import "./ProfesionalModal.css";

function getInitialForm(professional) {
  if (!professional) {
    return {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      specialty: "",
    };
  }

  const [firstName = "", ...lastNameParts] = professional.name.trim().split(/\s+/);

  return {
    firstName,
    lastName: lastNameParts.join(" "),
    email: professional.email || "",
    phone: professional.phone || "",
    specialty: professional.specialty || "",
  };
}

function getInitials(name) {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return initials || "PP";
}

function Campo({ children, label }) {
  return (
    <label className="profesional-modal__field">
      <span className="profesional-modal__label">{label}</span>
      {children}
    </label>
  );
}

function EntradaConIcono({ icon, ...props }) {
  return (
    <span className="profesional-modal__input-wrap">
      <img src={icon} alt="" aria-hidden="true" />
      <input {...props} />
    </span>
  );
}

export default function ProfesionalModal({ isOpen, mode, professional, onClose, onSubmit }) {
  const [form, setForm] = useState(() => getInitialForm(professional));
  const [error, setError] = useState("");
  const { isClosing, close } = useClosingTransition(onClose);
  const isEditing = mode === "edit";
  const displayName = isEditing ? professional?.name || "Profesional" : "Profesional";
  const displaySpecialty = isEditing ? professional?.specialty || "Profesión" : "Profesión";

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function closeWithEscape(event) {
      if (event.key === "Escape") {
        close();
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeWithEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeWithEscape);
    };
  }, [isOpen, close]);

  if (!isOpen) {
    return null;
  }

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      setError("");
      await onSubmit({ ...form, name: `${form.firstName.trim()} ${form.lastName.trim()}`.trim() });
    } catch (cause) {
      setError(cause.message);
    }
  }

  return (
    <div
      className={`profesional-modal__overlay${isClosing ? " is-closing" : ""}`}
      aria-hidden={isClosing}
      inert={isClosing}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          close();
        }
      }}
    >
      <section
        className={`profesional-modal${isClosing ? " is-closing" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="profesional-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="profesional-modal__header">
          <h2 id="profesional-modal-title">
            {isEditing ? "Editar profesional" : "Crear profesional"}
          </h2>
          <p>
            {isEditing
              ? "Actualiza la información principal del profesional"
              : "Ingrese la información principal del profesional"}
          </p>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="profesional-modal__form-card">
            <div className="profesional-modal__summary">
              <span className="profesional-modal__avatar" aria-hidden="true">
                {isEditing ? getInitials(displayName) : "PP"}
              </span>
              <span>
                <strong>{isEditing ? displayName : "Profesional"}</strong>
                <small>{displaySpecialty}</small>
              </span>
            </div>

            <div className="profesional-modal__fields">
              <Campo label="Nombre">
                <EntradaConIcono
                  icon={userIcon}
                  name="firstName"
                  value={form.firstName}
                  onChange={updateField}
                  placeholder="Nombre"
                  autoComplete="given-name"
                />
              </Campo>

              <Campo label="Apellido">
                <EntradaConIcono
                  icon={userIcon}
                  name="lastName"
                  value={form.lastName}
                  onChange={updateField}
                  placeholder="Apellido"
                  autoComplete="family-name"
                />
              </Campo>

              <Campo label="Correo">
                <EntradaConIcono
                  icon={envelopeIcon}
                  name="email"
                  type="text"
                  value={form.email}
                  onChange={updateField}
                  placeholder="ejemplo@gmail.com"
                  autoComplete="email"
                />
              </Campo>

              <Campo label="Teléfono">
                <EntradaConIcono
                  icon={phoneIcon}
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={updateField}
                  placeholder="1234 123123"
                  autoComplete="tel"
                />
              </Campo>

              <Campo label="Profesión">
                <EntradaConIcono
                  icon={briefcaseIcon}
                  name="specialty"
                  value={form.specialty}
                  onChange={updateField}
                  placeholder="Profesión"
                />
              </Campo>
            </div>
          </div>

          {error && <p role="alert">{error}</p>}
          <footer className="profesional-modal__actions">
            <button className="profesional-modal__cancel" type="button" onClick={close}>
              Cancelar
            </button>
            <Boton
              className="profesional-modal__submit"
              type="submit"
              text={isEditing ? "Guardar cambios" : "Crear profesional"}
            />
          </footer>
        </form>
      </section>
    </div>
  );
}
