import { useEffect, useState } from "react";
import {
  addressCardIcon,
  envelopeIcon,
  locationDotIcon,
  phoneIcon,
  userIcon,
} from "../../assets/icons";
import { DropdownSelect, Button } from "../index";
import "./TenantModal.css";

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

function Field({ children, label }) {
  return (
    <label className="tenant-modal__field">
      <span className="tenant-modal__label">{label}</span>
      {children}
    </label>
  );
}

function InputWithIcon({ icon, ...props }) {
  return (
    <span className="tenant-modal__input-wrap">
      <img src={icon} alt="" aria-hidden="true" />
      <input {...props} />
    </span>
  );
}

export default function TenantModal({ isOpen, mode, tenant, onClose, onSubmit }) {
  const [form, setForm] = useState(() => getInitialForm(tenant));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isEditing = mode === "edit";
  const displayName = isEditing ? `${tenant?.nombre || ""} ${tenant?.apellido || ""}`.trim() : "Inquilino";
  const displayStatus = isEditing ? (!tenant?.activo ? "Inactivo" : tenant?.estadoCuenta === "PENDIENTE_ACTIVACION" ? "Pendiente" : "Activo") : "Estado";

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
      className="tenant-modal__overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="tenant-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tenant-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="tenant-modal__header">
          <h2 id="tenant-modal-title">
            {isEditing ? "Editar inquilino" : "Crear inquilino"}
          </h2>
          <p>{isEditing
            ? "Actualiza la información de contacto y el estado del inquilino."
            : "El correo será su usuario y se generará un enlace para activar la cuenta."}</p>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="tenant-modal__form-card">
            <div className="tenant-modal__summary">
              <span className="tenant-modal__avatar" aria-hidden="true">
                {isEditing ? getInitials(displayName) : "IN"}
              </span>
              <span>
                <strong>{displayName}</strong>
                <small>{displayStatus}</small>
              </span>
            </div>

            <div className="tenant-modal__fields">
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
                  placeholder="2133 123123"
                  autoComplete="tel"
                />
              </Field>

              <Field label="Dirección">
                <InputWithIcon
                  icon={locationDotIcon}
                  name="address"
                  value={form.address}
                  onChange={updateField}
                  placeholder="Av. San Martín 12"
                  autoComplete="street-address"
                />
              </Field>

              <Field label="DNI">
                <InputWithIcon
                  icon={addressCardIcon}
                  name="dni"
                  value={form.dni}
                  onChange={updateField}
                  placeholder="12123123"
                  inputMode="numeric"
                />
              </Field>

              <Field label="Estado">
                <DropdownSelect
                  label="Estado"
                  value={form.active ? statusOptions[0] : statusOptions[1]}
                  options={statusOptions}
                  onChange={(status) => setForm((current) => ({ ...current, active: status === statusOptions[0] }))}
                  icon={userIcon}
                  className="tenant-modal__select"
                  triggerClassName="tenant-modal__select-trigger"
                  iconClassName="tenant-modal__select-icon"
                  valueClassName="tenant-modal__select-value"
                  chevronClassName="tenant-modal__select-arrow"
                  optionsClassName="tenant-modal__select-options"
                />
              </Field>
            </div>
          </div>

          {error && <p className="tenant-modal__error" role="alert">{error}</p>}

          <footer className="tenant-modal__actions">
            <button className="tenant-modal__cancel" type="button" onClick={onClose} disabled={saving}>
              Cancelar
            </button>
            <Button className="tenant-modal__submit" type="submit" text={saving ? "Guardando..." : "Guardar cambios"} disabled={saving} />
          </footer>
        </form>
      </section>
    </div>
  );
}
