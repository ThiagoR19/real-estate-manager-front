import { useState } from "react";
import { addressCardIcon, buildingColumnsIcon, linkIcon, trashCanIcon, userIcon } from "../../assets/icons";
import { GestionModal, AccionesModal, CampoModal, EntradaModal, mostrarAviso } from "../../components";
import "./InmobiliariaModal.css";

const adminVacio = { nombre: "", apellido: "", dni: "" };

function formatearVencimiento(fecha) {
  return new Date(fecha).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short", hour12: false });
}

function Invitacion({ inmobiliaria, invitacion, onClose }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar(event) {
    event.preventDefault();
    try {
      await navigator.clipboard.writeText(invitacion.enlace);
      setCopiado(true);
      mostrarAviso({ tipo: "exito", titulo: "Enlace copiado", mensaje: "Compartilo con el administrador." });
    } catch {
      event.currentTarget.querySelector("input")?.select();
      mostrarAviso({
        tipo: "advertencia",
        titulo: "No se pudo copiar",
        mensaje: "Seleccioná el enlace y copialo manualmente.",
      });
    }
  }

  return (
    <GestionModal
      title={invitacion.titulo ?? "Invitación creada"}
      subtitle={`Compartí este enlace con ${invitacion.persona} para que verifique su DNI y cree su cuenta en “${inmobiliaria?.name || "la inmobiliaria"}”`}
      onClose={onClose}
      variant="inmobiliaria"
    >
      <form onSubmit={copiar}>
        <div className="gestion-modal__card inmobiliaria-modal__card">
          <div className="gestion-modal__summary inmobiliaria-modal__band" aria-hidden="true" />
          <div className="inmobiliaria-modal__field inmobiliaria-modal__invitacion">
            <CampoModal label="Enlace de invitación">
              <EntradaModal
                icon={linkIcon}
                value={invitacion.enlace}
                readOnly
                onFocus={(event) => event.currentTarget.select()}
              />
            </CampoModal>
            {invitacion.expiraEn && (
              <p className="inmobiliaria-modal__vencimiento">Vence el {formatearVencimiento(invitacion.expiraEn)} hs.</p>
            )}
          </div>
        </div>
        <AccionesModal
          onClose={onClose}
          cancelText="Cerrar"
          submitText={copiado ? "Enlace copiado" : "Copiar enlace"}
        />
      </form>
    </GestionModal>
  );
}

export default function InmobiliariaModal({ mode = "create", inmobiliaria, invitacion, enviando = false, onClose, onSubmit, onDelete }) {
  const isAdmin = mode === "admin";
  const isEditing = mode === "edit";
  const [value, setValue] = useState(isEditing ? inmobiliaria?.name || "" : "");
  const [admin, setAdmin] = useState(adminVacio);

  if (mode === "invitacion") {
    return <Invitacion inmobiliaria={inmobiliaria} invitacion={invitacion} onClose={onClose} />;
  }

  const title = isAdmin ? "Agregar admin" : isEditing ? "Editar inmobiliaria" : "Agregar inmobiliaria";

  function cambiarAdmin(event) {
    const { name, value: valor } = event.target;
    setAdmin((actual) => ({ ...actual, [name]: name === "dni" ? valor.replace(/\D/g, "").slice(0, 8) : valor }));
  }

  function enviarFormulario(event) {
    event.preventDefault();
    if (isAdmin) {
      onSubmit({ nombre: admin.nombre.trim(), apellido: admin.apellido.trim(), dni: admin.dni });
      return;
    }
    const trimmedValue = value.trim();
    if (trimmedValue) onSubmit(trimmedValue);
  }

  return (
    <GestionModal
      title={title}
      subtitle={isAdmin ? `Ingresá los datos del nuevo administrador de “${inmobiliaria?.name || "la inmobiliaria"}” para generar su invitación` : "Ingrese la info básica de la inmobiliaria"}
      onClose={onClose}
      variant="inmobiliaria"
    >
      <form onSubmit={enviarFormulario}>
        <div className="gestion-modal__card inmobiliaria-modal__card">
          <div className="gestion-modal__summary inmobiliaria-modal__band" aria-hidden="true" />
          {isEditing && onDelete && (
            <button
              className="super-admin__delete inmobiliaria-modal__delete"
              type="button"
              onClick={onDelete}
              aria-label={`Eliminar ${inmobiliaria?.name || "la inmobiliaria"}`}
            >
              <img src={trashCanIcon} alt="" />
            </button>
          )}
          {isAdmin ? (
            <div className="inmobiliaria-modal__fields">
              <CampoModal label="Nombre">
                <EntradaModal
                  icon={userIcon}
                  name="nombre"
                  value={admin.nombre}
                  onChange={cambiarAdmin}
                  placeholder="Nombre"
                  maxLength={255}
                  required
                  autoComplete="off"
                />
              </CampoModal>
              <CampoModal label="Apellido">
                <EntradaModal
                  icon={userIcon}
                  name="apellido"
                  value={admin.apellido}
                  onChange={cambiarAdmin}
                  placeholder="Apellido"
                  maxLength={255}
                  required
                  autoComplete="off"
                />
              </CampoModal>
              <CampoModal label="DNI">
                <EntradaModal
                  icon={addressCardIcon}
                  name="dni"
                  value={admin.dni}
                  onChange={cambiarAdmin}
                  placeholder="DNI sin puntos"
                  inputMode="numeric"
                  pattern="[0-9]{7,8}"
                  title="Ingrese un DNI de 7 u 8 dígitos"
                  autoComplete="off"
                  required
                />
              </CampoModal>
            </div>
          ) : (
            <div className="inmobiliaria-modal__field">
              <CampoModal label="Nombre de inmobiliaria">
                <EntradaModal
                  icon={buildingColumnsIcon}
                  name="inmobiliariaName"
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
          disabled={enviando}
          submitText={
            isAdmin
              ? enviando
                ? "Creando invitación..."
                : "Crear invitación"
              : isEditing
                ? "Guardar cambios"
                : "Crear inmobiliaria"
          }
        />
      </form>
    </GestionModal>
  );
}
