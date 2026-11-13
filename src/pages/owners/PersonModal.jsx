import { useState } from "react";
import {
  addressCardIcon,
  buildingColumnsIcon,
  envelopeIcon,
  houseIcon,
  locationDotIcon,
  peopleIcon,
  phoneIcon,
  userIcon,
} from "../../assets/icons";
import { ManagementModal, ModalActions, ModalField, ModalInput, ModalSelect } from "../../components";

const propertyOptions = ["Av. San Martín 1250", "Av. Santa Fe 850"];
const statusOptions = ["Activo", "Inactivo", "Pendiente"];

function initialForm(person, kind) {
  const [firstName = "", ...lastName] = (person?.name || "").trim().split(/\s+/);

  return {
    firstName: person && "nombre" in person ? person.nombre || "" : firstName,
    lastName: person && "apellido" in person ? person.apellido || "" : lastName.join(" "),
    email: person?.email || "",
    phone: person?.phone || "",
    address: person?.address || "",
    dni: person?.dni || "",
    cbu: person?.cbu || "",
    alias: person?.alias || "",
    property: person?.property || (kind === "owner" ? person?.address : "") || propertyOptions[0],
    zone: person?.zone || person?.area || "",
    status: person?.status || statusOptions[0],
  };
}

function personInitials(name) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function PersonModal({ kind, mode, person, zones = [], onClose, onSubmit }) {
  const [form, setForm] = useState(() => initialForm(person, kind));
  const [error, setError] = useState("");
  const isOwner = kind === "owner";
  const isEditing = mode === "edit";
  const noun = isOwner ? "propietario" : "agente";
  const displayName = person?.name || (isOwner ? "Propietario" : "Agente");

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    const name = `${form.firstName.trim()} ${form.lastName.trim()}`.trim();
    try {
      setError("");
      await onSubmit({ ...form, name, initials: personInitials(name) });
    } catch (cause) { setError(cause.message || "No se pudieron guardar los cambios."); }
  }

  return (
    <ManagementModal
      onClose={onClose}
      title={`${isEditing ? "Editar" : "Crear"} ${noun}`}
      subtitle={`Actualiza la información principal del ${noun}`}
      variant={isOwner ? "person-owner" : "person-agent"}
    >
      <form onSubmit={submit}>
        <div className="management-modal__card">
          <div className="management-modal__summary">
            <span className="management-modal__avatar" aria-hidden="true">
              {person ? personInitials(displayName) : isOwner ? "PR" : "AG"}
            </span>
            <span>
              <strong>{displayName}</strong>
              <small>{person?.status || "Estado"}</small>
            </span>
          </div>
          <div className="management-modal__fields">
            {isEditing && <><ModalField label="Nombre">
              <ModalInput
                icon={userIcon}
                name="firstName"
                value={form.firstName}
                onChange={updateField}
                placeholder="Nombre"
                autoComplete="given-name"
              />
            </ModalField>
            <ModalField label="Apellido">
              <ModalInput
                icon={userIcon}
                name="lastName"
                value={form.lastName}
                onChange={updateField}
                placeholder="Apellido"
                autoComplete="family-name"
              />
            </ModalField>
            <ModalField label="Correo">
              <ModalInput
                icon={envelopeIcon}
                name="email"
                type="email"
                value={form.email}
                onChange={updateField}
                placeholder="ejemplo@gmail.com"
                autoComplete="email"
              />
            </ModalField>
            <ModalField label="Teléfono">
              <ModalInput
                icon={phoneIcon}
                name="phone"
                type="tel"
                value={form.phone}
                onChange={updateField}
                placeholder="2133 123123"
                autoComplete="tel"
              />
            </ModalField>
            <ModalField label="Dirección">
              <ModalInput
                icon={locationDotIcon}
                name="address"
                value={form.address}
                onChange={updateField}
                placeholder="Av. San Martín 12"
                autoComplete="street-address"
              />
            </ModalField>
            </>}
            <ModalField label="DNI">
              <ModalInput
                icon={addressCardIcon}
                name="dni"
                value={form.dni}
                onChange={updateField}
                placeholder="12123123"
                inputMode="numeric"
                required
                pattern="[0-9]{7,8}"
                readOnly={isEditing}
              />
            </ModalField>
            {isOwner && isEditing && (
              <>
                <ModalField label="CBU">
                  <ModalInput
                    icon={buildingColumnsIcon}
                    name="cbu"
                    value={form.cbu}
                    onChange={updateField}
                    placeholder="2680000611000012436763"
                    inputMode="numeric"
                    maxLength={22}
                  />
                </ModalField>
                <ModalField label="Alias">
                  <ModalInput
                    icon={buildingColumnsIcon}
                    name="alias"
                    value={form.alias}
                    onChange={updateField}
                    placeholder="pepe.cacho.felicidad"
                  />
                </ModalField>
              </>
            )}
            {isEditing && !isOwner && <ModalField label="Ciudad">
              <ModalSelect
                label="Ciudad"
                icon={houseIcon}
                options={["Sin asignar", ...zones]}
                value={form.zone || "Sin asignar"}
                onChange={(value) => {
                  setForm((current) => ({ ...current, zone: value === "Sin asignar" ? "" : value }));
                }}
              />
            </ModalField>}
            {isEditing && <ModalField label="Estado">
              <ModalSelect
                label="Estado"
                icon={peopleIcon}
                options={["Estado", ...statusOptions]}
                value={form.status}
                onChange={(status) => {
                  if (status !== "Estado") setForm((current) => ({ ...current, status }));
                }}
              />
            </ModalField>}
          </div>
        </div>
        {error && <p role="alert">{error}</p>}
        <ModalActions onClose={onClose} />
      </form>
    </ManagementModal>
  );
}
