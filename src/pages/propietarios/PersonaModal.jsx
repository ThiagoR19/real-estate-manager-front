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
import { GestionModal, AccionesModal, CampoModal, EntradaModal, ModalSelect } from "../../components";

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

export default function PersonaModal({ kind, mode, person, zones = [], onClose, onSubmit }) {
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
    <GestionModal
      onClose={onClose}
      title={`${isEditing ? "Editar" : "Crear"} ${noun}`}
      subtitle={`Actualiza la información principal del ${noun}`}
      variant={isOwner ? "person-owner" : "person-agent"}
    >
      <form onSubmit={submit}>
        <div className="gestion-modal__card">
          <div className="gestion-modal__summary">
            <span className="gestion-modal__avatar" aria-hidden="true">
              {person ? personInitials(displayName) : isOwner ? "PR" : "AG"}
            </span>
            <span>
              <strong>{displayName}</strong>
              <small>{person?.status || "Estado"}</small>
            </span>
          </div>
          <div className="gestion-modal__fields">
            {isEditing && <><CampoModal label="Nombre">
              <EntradaModal
                icon={userIcon}
                name="firstName"
                value={form.firstName}
                onChange={updateField}
                placeholder="Nombre"
                autoComplete="given-name"
              />
            </CampoModal>
            <CampoModal label="Apellido">
              <EntradaModal
                icon={userIcon}
                name="lastName"
                value={form.lastName}
                onChange={updateField}
                placeholder="Apellido"
                autoComplete="family-name"
              />
            </CampoModal>
            <CampoModal label="Correo">
              <EntradaModal
                icon={envelopeIcon}
                name="email"
                type="email"
                value={form.email}
                onChange={updateField}
                placeholder="ejemplo@gmail.com"
                autoComplete="email"
              />
            </CampoModal>
            <CampoModal label="Teléfono">
              <EntradaModal
                icon={phoneIcon}
                name="phone"
                type="tel"
                value={form.phone}
                onChange={updateField}
                placeholder="2133 123123"
                autoComplete="tel"
              />
            </CampoModal>
            <CampoModal label="Dirección">
              <EntradaModal
                icon={locationDotIcon}
                name="address"
                value={form.address}
                onChange={updateField}
                placeholder="Av. San Martín 12"
                autoComplete="street-address"
              />
            </CampoModal>
            </>}
            <CampoModal label="DNI">
              <EntradaModal
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
            </CampoModal>
            {isOwner && isEditing && (
              <>
                <CampoModal label="CBU">
                  <EntradaModal
                    icon={buildingColumnsIcon}
                    name="cbu"
                    value={form.cbu}
                    onChange={updateField}
                    placeholder="2680000611000012436763"
                    inputMode="numeric"
                    maxLength={22}
                  />
                </CampoModal>
                <CampoModal label="Alias">
                  <EntradaModal
                    icon={buildingColumnsIcon}
                    name="alias"
                    value={form.alias}
                    onChange={updateField}
                    placeholder="pepe.cacho.felicidad"
                  />
                </CampoModal>
              </>
            )}
            {isEditing && !isOwner && <CampoModal label="Ciudad">
              <ModalSelect
                label="Ciudad"
                icon={houseIcon}
                options={["Sin asignar", ...zones]}
                value={form.zone || "Sin asignar"}
                onChange={(value) => {
                  setForm((current) => ({ ...current, zone: value === "Sin asignar" ? "" : value }));
                }}
              />
            </CampoModal>}
            {isEditing && <CampoModal label="Estado">
              <ModalSelect
                label="Estado"
                icon={peopleIcon}
                options={["Estado", ...statusOptions]}
                value={form.status}
                onChange={(status) => {
                  if (status !== "Estado") setForm((current) => ({ ...current, status }));
                }}
              />
            </CampoModal>}
          </div>
        </div>
        {error && <p role="alert">{error}</p>}
        <AccionesModal onClose={onClose} />
      </form>
    </GestionModal>
  );
}
