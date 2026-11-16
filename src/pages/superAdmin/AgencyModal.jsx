import { useState } from "react";
import { addressCardIcon, buildingColumnsIcon, envelopeIcon, trashCanIcon, userIcon } from "../../assets/icons";
import { GestionModal, AccionesModal, CampoModal, EntradaModal } from "../../components";
import "./AgencyModal.css";

const adminVacio = { nombre: "", apellido: "", dni: "", correo: "" };

export default function AgencyModal({ mode = "create", agency, onClose, onSubmit, onDelete }) {
  const isAdmin = mode === "admin";
  const isEditing = mode === "edit";
  const [value, setValue] = useState(isEditing ? agency?.name || "" : "");
  const [admin, setAdmin] = useState(adminVacio);
  const title = isAdmin
    ? "Agregar admin"
    : isEditing
      ? "Editar inmobiliaria"
      : "Agregar inmobiliaria";

  function cambiarAdmin(event) {
    setAdmin((actual) => ({ ...actual, [event.target.name]: event.target.value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (isAdmin) {

      const datos = Object.fromEntries(
        Object.entries(admin)
          .map(([campo, valor]) => [campo, campo === "password" ? valor : valor.trim()])
          .filter(([, valor]) => valor !== ""),
      );
      onSubmit(datos);
      return;
    }
    const trimmedValue = value.trim();
    if (trimmedValue) onSubmit(trimmedValue);
  }

  return (
    <GestionModal
      title={title}
      subtitle={
        isAdmin
          ? `Agrega un nuevo administrador a “${agency?.name || "la inmobiliaria"}”`
          : "Ingrese la info básica de la inmobiliaria"
      }
      onClose={onClose}
      variant="inmobiliaria"
    >
      <form onSubmit={handleSubmit}>
        <div className="gestion-modal__card agency-modal__card">
          <div className="gestion-modal__summary agency-modal__band" aria-hidden="true" />
          {isEditing && onDelete && (
            <button
              className="super-admin__delete agency-modal__delete"
              type="button"
              onClick={onDelete}
              aria-label={`Eliminar ${agency?.name || "la inmobiliaria"}`}
            >
              <img src={trashCanIcon} alt="" />
            </button>
          )}
          {isAdmin ? (
            <div className="agency-modal__fields">
              <CampoModal label="Nombre">
                <EntradaModal icon={userIcon} name="nombre" value={admin.nombre} onChange={cambiarAdmin} placeholder="Nombre" maxLength={255} required autoComplete="off" />
              </CampoModal>
              <CampoModal label="Apellido">
                <EntradaModal icon={userIcon} name="apellido" value={admin.apellido} onChange={cambiarAdmin} placeholder="Apellido" maxLength={255} required autoComplete="off" />
              </CampoModal>
              <CampoModal label="DNI">
                <EntradaModal
                  icon={addressCardIcon}
                  name="dni"
                  value={admin.dni}
                  onChange={cambiarAdmin}
                  placeholder="DNI"
                  inputMode="numeric"
                  pattern="[0-9]{7,8}"
                  maxLength={8}
                  title="Ingrese un DNI de 7 u 8 dígitos, sin puntos"
                  autoComplete="off"
                  required
                />
              </CampoModal>
              <CampoModal label="Correo (opcional)">
                <EntradaModal icon={envelopeIcon} type="email" name="correo" value={admin.correo} onChange={cambiarAdmin} placeholder="correo@ejemplo.com" maxLength={255} autoComplete="off" />
              </CampoModal>
            </div>
          ) : (
            <div className="agency-modal__field">
              <CampoModal label="Nombre de inmobiliaria">
                <EntradaModal
                  icon={buildingColumnsIcon}
                  name="agencyName"
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                  placeholder="Nombre de la inmobiliaria"
                  maxLength={100}
                  required
                  autoComplete="off"
                />
              </CampoModal>
            </div>
          )}
        </div>
        <AccionesModal
          onClose={onClose}
          submitText={
            isAdmin ? "Agregar admin" : isEditing ? "Guardar cambios" : "Crear inmobiliaria"
          }
        />
      </form>
    </GestionModal>
  );
}
