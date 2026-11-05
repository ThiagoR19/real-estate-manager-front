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
import ManagementModal, {
  ModalActions,
  ModalField,
  ModalInput,
  ModalSelect,
} from "../managementModal/ManagementModal";

const propertyOptions = ["Av. San Martín 1250", "Av. Santa Fe 850"];
const zoneOptions = ["Palermo", "Belgrano", "Recoleta"];
const statusOptions = ["Activo", "Inactivo", "Pendiente"];

function initialForm(person, kind) {
  const [firstName = "", ...lastName] = (person?.name || "").trim().split(/\s+/);

  return {
    firstName,
    lastName: lastName.join(" "),
    email: person?.email || "",
    phone: person?.phone || "",
    address: person?.address || "",
    dni: person?.dni || "",
    cbu: person?.cbu || "",
    alias: person?.alias || "",
    property: person?.property || (kind === "owner" ? person?.address : "") || propertyOptions[0],
    zone: person?.zone || zoneOptions[0],
    status: person?.status || statusOptions[0],
  };
}

function personInitials(name) {
  return name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

export default function PersonModal({ kind, mode, person, onClose, onSubmit }) {
  const [form, setForm] = useState(() => initialForm(person, kind));
  const isOwner = kind === "owner";
  const isEditing = mode === "edit";
  const noun = isOwner ? "propietario" : "agente";
  const displayName = person?.name || (isOwner ? "Propietario" : "Agente");

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function submit(event) {
    event.preventDefault();
    const name = `${form.firstName.trim()} ${form.lastName.trim()}`.trim();
    onSubmit({ ...form, name, initials: personInitials(name) });
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
            <span><strong>{displayName}</strong><small>{person?.status || "Estado"}</small></span>
          </div>
          <div className="management-modal__fields">
            <ModalField label="Nombre">
              <ModalInput icon={userIcon} name="firstName" value={form.firstName} onChange={updateField} placeholder="Nombre" autoComplete="given-name" required />
            </ModalField>
            <ModalField label="Apellido">
              <ModalInput icon={userIcon} name="lastName" value={form.lastName} onChange={updateField} placeholder="Apellido" autoComplete="family-name" required />
            </ModalField>
            <ModalField label="Correo">
              <ModalInput icon={envelopeIcon} name="email" type="email" value={form.email} onChange={updateField} placeholder="ejemplo@gmail.com" autoComplete="email" required />
            </ModalField>
            <ModalField label="Teléfono">
              <ModalInput icon={phoneIcon} name="phone" type="tel" value={form.phone} onChange={updateField} placeholder="2133 123123" autoComplete="tel" required />
            </ModalField>
            <ModalField label="Dirección">
              <ModalInput icon={locationDotIcon} name="address" value={form.address} onChange={updateField} placeholder="Av. San Martín 12" autoComplete="street-address" />
            </ModalField>
            <ModalField label="DNI">
              <ModalInput icon={addressCardIcon} name="dni" value={form.dni} onChange={updateField} placeholder="12123123" inputMode="numeric" required />
            </ModalField>
            {isOwner && <>
              <ModalField label="CBU">
                <ModalInput icon={buildingColumnsIcon} name="cbu" value={form.cbu} onChange={updateField} placeholder="2680000611000012436763" inputMode="numeric" maxLength={22} />
              </ModalField>
              <ModalField label="Alias">
                <ModalInput icon={buildingColumnsIcon} name="alias" value={form.alias} onChange={updateField} placeholder="pepe.cacho.felicidad" />
              </ModalField>
            </>}
            <ModalField label={isOwner ? "Propiedad" : "Zona"}>
              <ModalSelect
                label={isOwner ? "Propiedad" : "Zona"}
                icon={houseIcon}
                options={[isOwner ? "Propiedad" : "Zona", ...new Set([...(isOwner ? propertyOptions : zoneOptions), isOwner ? form.property : form.zone])]}
                value={isOwner ? form.property : form.zone}
                onChange={(value) => {
                  if (value !== (isOwner ? "Propiedad" : "Zona")) {
                    setForm((current) => ({ ...current, [isOwner ? "property" : "zone"]: value }));
                  }
                }}
              />
            </ModalField>
            <ModalField label="Estado">
              <ModalSelect label="Estado" icon={peopleIcon} options={["Estado", ...statusOptions]} value={form.status} onChange={(status) => {
                if (status !== "Estado") setForm((current) => ({ ...current, status }));
              }} />
            </ModalField>
          </div>
        </div>
        <ModalActions onClose={onClose} />
      </form>
    </ManagementModal>
  );
}
