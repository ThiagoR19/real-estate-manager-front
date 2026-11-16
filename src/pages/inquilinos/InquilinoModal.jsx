import { useEffect, useState } from "react";
import {
  addressCardIcon,
  envelopeIcon,
  locationDotIcon,
  phoneIcon,
  userIcon,
} from "../../assets/icons";
import { SelectDesplegable, Boton } from "../../components";
import useClosingTransition from "../../hooks/useClosingTransition.js";
import "./InquilinoModal.css";

const statusOptions = ["Activo", "Inactivo"];

function getInitialForm(tenant) {
  if (!tenant) {
    return {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      dni: "",
      active: true,
    };
  }

  return {
    firstName: tenant.nombre || "",
    lastName: tenant.apellido || "",
    email: tenant.correo || "",
    phone: tenant.telefono || "",
    address: tenant.direccion || "",
    dni: tenant.dni || "",
    active: Boolean(tenant.activo),
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

  return initials || "IN";
}

function Campo({ children, label }) {
  return (
    <label className="inquilino-modal__field">
      <span className="inquilino-modal__label">{label}</span>
      {children}
    </label>
  );
}

function EntradaConIcono({ icon, ...props }) {
  return (
    <span className="inquilino-modal__input-wrap">
      <img src={icon} alt="" aria-hidden="true" />
      <input {...props} />
    </span>
  );
}

export default function InquilinoModal({ isOpen, mode, tenant, onClose, onSubmit }) {
  const [form, setForm] = useState(() => getInitialForm(tenant));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { isClosing, close } = useClosingTransition(onClose);
  const isEditing = mode === "edit";
  const displayName = isEditing
    ? `${tenant?.nombre || ""} ${tenant?.apellido || ""}`.trim() || `DNI ${tenant?.dni}`
    : "Inquilino";
  const displayStatus = isEditing
    ? !tenant?.activo
      ? "Inactivo"
      : tenant?.estadoCuenta === "PENDIENTE_ACTIVACION"
        ? "Pendiente"
        : "Activo"
    : "Estado";

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
    setError("");
    setSaving(true);
    try {
      await onSubmit({
        ...form,
        name: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
      });
    } catch (submitError) {
      setError(submitError.message || "No se pudieron guardar los cambios.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className={`inquilino-modal__overlay${isClosing ? " is-closing" : ""}`}
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
        className={`inquilino-modal${isClosing ? " is-closing" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="inquilino-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="inquilino-modal__header">
          <h2 id="inquilino-modal-title">{isEditing ? "Editar inquilino" : "Crear inquilino"}</h2>
          <p>
            {isEditing
              ? "Actualiza la información de contacto y el estado del inquilino."
              : "Ingresá el DNI para generar un enlace de activación."}
          </p>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="inquilino-modal__form-card">
            <div className="inquilino-modal__summary">
              <span className="inquilino-modal__avatar" aria-hidden="true">
                {isEditing ? getInitials(displayName) : "IN"}
              </span>
              <span>
                <strong>{displayName}</strong>
                <small>{displayStatus}</small>
              </span>
            </div>

            <div className="inquilino-modal__fields">
              {isEditing && <><Campo label="Nombre">
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
                  placeholder="2133 123123"
                  autoComplete="tel"
                />
              </Campo>

              <Campo label="Dirección">
                <EntradaConIcono
                  icon={locationDotIcon}
                  name="address"
                  value={form.address}
                  onChange={updateField}
                  placeholder="Av. San Martín 12"
                  autoComplete="street-address"
                />
              </Campo>

              </>}
              <Campo label="DNI">
                <EntradaConIcono
                  icon={addressCardIcon}
                  name="dni"
                  value={form.dni}
                  onChange={updateField}
                  placeholder="12123123"
                  inputMode="numeric"
                  pattern="[0-9]{7,8}"
                  required
                  readOnly={isEditing}
                />
              </Campo>

              {isEditing && <Campo label="Estado">
                <SelectDesplegable
                  label="Estado"
                  value={form.active ? statusOptions[0] : statusOptions[1]}
                  options={statusOptions}
                  onChange={(status) =>
                    setForm((current) => ({ ...current, active: status === statusOptions[0] }))
                  }
                  icon={userIcon}
                  className="inquilino-modal__select"
                  triggerClassName="inquilino-modal__select-trigger"
                  iconClassName="inquilino-modal__select-icon"
                  valueClassName="inquilino-modal__select-value"
                  chevronClassName="inquilino-modal__select-arrow"
                  optionsClassName="inquilino-modal__select-options"
                />
              </Campo>}
            </div>
          </div>

          {error && (
            <p className="inquilino-modal__error" role="alert">
              {error}
            </p>
          )}

          <footer className="inquilino-modal__actions">
            <button
              className="inquilino-modal__cancel"
              type="button"
              onClick={close}
              disabled={saving}
            >
              Cancelar
            </button>
            <Boton
              className="inquilino-modal__submit"
              type="submit"
              text={saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear inquilino"}
              disabled={saving}
            />
          </footer>
        </form>
      </section>
    </div>
  );
}
