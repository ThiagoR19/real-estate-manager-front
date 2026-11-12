import { useEffect, useState } from "react";
import { briefcaseIcon, envelopeIcon, phoneIcon, userIcon } from "../../assets/icons";
import { Button } from "../index";
import "./ProfessionalModal.css";

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

function Field({ children, label }) {
  return (
    <label className="professional-modal__field">
      <span className="professional-modal__label">{label}</span>
      {children}
    </label>
  );
}

function InputWithIcon({ icon, ...props }) {
  return (
    <span className="professional-modal__input-wrap">
      <img src={icon} alt="" aria-hidden="true" />
      <input {...props} />
    </span>
  );
}

export default function ProfessionalModal({ isOpen, mode, professional, onClose, onSubmit }) {
  const [form, setForm] = useState(() => getInitialForm(professional));
  const [error, setError] = useState("");
  const isEditing = mode === "edit";
  const displayName = isEditing ? professional?.name || "Profesional" : "Profesional";
  const displaySpecialty = isEditing ? professional?.specialty || "Profesión" : "Profesión";

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function closeWithEscape(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeWithEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeWithEscape);
    };
  }, [isOpen, onClose]);

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
      className="professional-modal__overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="professional-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="professional-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="professional-modal__header">
          <h2 id="professional-modal-title">
            {isEditing ? "Editar profesional" : "Crear profesional"}
          </h2>
          <p>
            {isEditing
              ? "Actualiza la información principal del profesional"
              : "Ingrese la información principal del profesional"}
          </p>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="professional-modal__form-card">
            <div className="professional-modal__summary">
              <span className="professional-modal__avatar" aria-hidden="true">
                {isEditing ? getInitials(displayName) : "PP"}
              </span>
              <span>
                <strong>{isEditing ? displayName : "Profesional"}</strong>
                <small>{displaySpecialty}</small>
              </span>
            </div>

            <div className="professional-modal__fields">
              <Field label="Nombre">
                <InputWithIcon
                  icon={userIcon}
                  name="firstName"
                  value={form.firstName}
                  onChange={updateField}
                  placeholder="Nombre"
                  autoComplete="given-name"
                />
              </Field>

              <Field label="Apellido">
                <InputWithIcon
                  icon={userIcon}
                  name="lastName"
                  value={form.lastName}
                  onChange={updateField}
                  placeholder="Apellido"
                  autoComplete="family-name"
                />
              </Field>

              <Field label="Correo">
                <InputWithIcon
                  icon={envelopeIcon}
                  name="email"
                  type="text"
                  value={form.email}
                  onChange={updateField}
                  placeholder="ejemplo@gmail.com"
                  autoComplete="email"
                />
              </Field>

              <Field label="Teléfono">
                <InputWithIcon
                  icon={phoneIcon}
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={updateField}
                  placeholder="1234 123123"
                  autoComplete="tel"
                />
              </Field>

              <Field label="Profesión">
                <InputWithIcon
                  icon={briefcaseIcon}
                  name="specialty"
                  value={form.specialty}
                  onChange={updateField}
                  placeholder="Profesión"
                />
              </Field>
            </div>
          </div>

          {error && <p role="alert">{error}</p>}
          <footer className="professional-modal__actions">
            <button className="professional-modal__cancel" type="button" onClick={onClose}>
              Cancelar
            </button>
            <Button
              className="professional-modal__submit"
              type="submit"
              text={isEditing ? "Guardar cambios" : "Crear profesional"}
            />
          </footer>
        </form>
      </section>
    </div>
  );
}
