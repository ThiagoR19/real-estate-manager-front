import { useState } from "react";
import { addressCardIcon, buildingColumnsIcon, envelopeIcon, lockIcon, trashCanIcon, userIcon } from "../../assets/icons";
import { ManagementModal, ModalActions, ModalField, ModalInput } from "../index";
import "./AgencyModal.css";

const adminVacio = { nombre: "", apellido: "", dni: "", correo: "", usuario: "", password: "" };

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
      // Los campos opcionales vacíos no se mandan
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
    <ManagementModal
      title={title}
      subtitle={
        isAdmin
          ? `Agrega un nuevo administrador a “${agency?.name || "la inmobiliaria"}”`
          : "Ingrese la info básica de la inmobiliaria"
      }
      onClose={onClose}
      variant="agency"
    >
      <form onSubmit={handleSubmit}>
        <div className="management-modal__card agency-modal__card">
          <div className="management-modal__summary agency-modal__band" aria-hidden="true" />
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
              <ModalField label="Nombre">
                <ModalInput icon={userIcon} name="nombre" value={admin.nombre} onChange={cambiarAdmin} placeholder="Nombre" maxLength={255} required autoComplete="off" />
              </ModalField>
              <ModalField label="Apellido">
                <ModalInput icon={userIcon} name="apellido" value={admin.apellido} onChange={cambiarAdmin} placeholder="Apellido" maxLength={255} required autoComplete="off" />
              </ModalField>
              <ModalField label="DNI (opcional)">
                <ModalInput
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
                />
              </ModalField>
              <ModalField label="Correo (opcional)">
                <ModalInput icon={envelopeIcon} type="email" name="correo" value={admin.correo} onChange={cambiarAdmin} placeholder="correo@ejemplo.com" maxLength={255} autoComplete="off" />
              </ModalField>
              <ModalField label="Usuario">
                <ModalInput icon={userIcon} name="usuario" value={admin.usuario} onChange={cambiarAdmin} placeholder="Usuario" maxLength={255} required autoComplete="off" />
              </ModalField>
              <ModalField label="Contraseña">
                <ModalInput icon={lockIcon} type="password" name="password" value={admin.password} onChange={cambiarAdmin} placeholder="Contraseña" maxLength={255} required autoComplete="new-password" />
              </ModalField>
            </div>
          ) : (
            <div className="agency-modal__field">
              <ModalField label="Nombre de inmobiliaria">
                <ModalInput
                  icon={buildingColumnsIcon}
                  name="agencyName"
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                  placeholder="Nombre de la inmobiliaria"
                  maxLength={100}
                  required
                  autoComplete="off"
                />
              </ModalField>
            </div>
          )}
        </div>
        <ModalActions
          onClose={onClose}
          submitText={
            isAdmin ? "Agregar admin" : isEditing ? "Guardar cambios" : "Crear inmobiliaria"
          }
        />
      </form>
    </ManagementModal>
  );
}
