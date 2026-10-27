import { useEffect, useState } from "react";
import {
  addressCardIcon,
  envelopeIcon,
  houseIcon,
  locationDotIcon,
  peopleIcon,
  phoneIcon,
  userIcon,
} from "../../assets/icons";
import { DropdownSelect, Button } from '../index';
import "./TenantModal.css";

const propertyOptions = ["Propiedad", "Av. San Martín 1250", "Av. Santa Fe 850"];
const statusOptions = ["Estado", "Activo", "Pendiente", "Finalizado"];

function getInitialForm(tenant) {
  if (!tenant) {
    return {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      dni: "",
      property: propertyOptions[1],
      status: statusOptions[1],
    };
  }

  const [firstName = "", ...lastNameParts] = tenant.name.trim().split(/\s+/);

  return {
    firstName,
    lastName: lastNameParts.join(" "),
    email: tenant.email || "",
    phone: tenant.phone || "",
    address: tenant.address || "",
    dni: tenant.dni || "",
    property: tenant.address || propertyOptions[0],
    status: tenant.status || statusOptions[1],
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
  const isEditing = mode === "edit";
  const displayName = isEditing ? tenant?.name || "Inquilino" : "Inquilino";
  const displayStatus = isEditing ? tenant?.status || "Estado" : "Estado";

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

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({
      ...form,
      name: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
    });
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
          <p>Actualiza la información principal del inquilino</p>
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
                  required
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
                  required
                />
              </Field>

              <Field label="Correo">
                <InputWithIcon
                  icon={envelopeIcon}
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={updateField}
                  placeholder="ejemplo@gmail.com"
                  autoComplete="email"
                  required
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
                  required
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
                  required
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
                  required
                />
              </Field>

              <Field label="Propiedad">
                <DropdownSelect
                  label="Propiedad"
                  value={form.property}
                  options={propertyOptions}
                  onChange={(property) => {
                    if (property !== propertyOptions[0]) {
                      setForm((current) => ({ ...current, property, address: property }));
                    }
                  }}
                  icon={houseIcon}
                  className="tenant-modal__select"
                  triggerClassName="tenant-modal__select-trigger"
                  iconClassName="tenant-modal__select-icon"
                  valueClassName="tenant-modal__select-value"
                  chevronClassName="tenant-modal__select-arrow"
                  optionsClassName="tenant-modal__select-options"
                />
              </Field>

              <Field label="Estado">
                <DropdownSelect
                  label="Estado"
                  value={form.status}
                  options={statusOptions}
                  onChange={(status) => {
                    if (status !== statusOptions[0]) {
                      setForm((current) => ({ ...current, status }));
                    }
                  }}
                  icon={peopleIcon}
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

          <footer className="tenant-modal__actions">
            <button className="tenant-modal__cancel" type="button" onClick={onClose}>
              Cancelar
            </button>
            <Button className="tenant-modal__submit" type="submit" text="Guardar cambios" />
          </footer>
        </form>
      </section>
    </div>
  );
}
