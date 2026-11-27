import { useState } from "react";
import { addressCardIcon, buildingColumnsIcon, envelopeIcon, houseIcon, locationDotIcon, peopleIcon, phoneIcon, userIcon } from "../../assets/icons";
import { GestionModal, AccionesModal, CampoModal, EntradaModal, ModalSelect, mostrarAviso } from "../../components";

const opcionesPropiedad = ["Av. San Martín 1250", "Av. Santa Fe 850"];
const estadosPropietario = ["Activo", "Inactivo"];
const estadosAgente = ["Activo", "Inactivo", "Pendiente"];

function formularioInicial(persona, kind) {
  const [nombre = "", ...apellido] = (persona?.nombreCompleto || "").trim().split(/\s+/);

  return {
    nombre: persona && "nombre" in persona ? persona.nombre || "" : nombre,
    apellido: persona && "apellido" in persona ? persona.apellido || "" : apellido.join(" "),
    correo: persona?.correo || "",
    telefono: persona?.telefono || "",
    direccion: persona?.direccion || "",
    dni: persona?.dni || "",
    cbu: persona?.cbu || "",
    alias: persona?.alias || "",
    propiedad: persona?.propiedad || (kind === "owner" ? persona?.direccion : "") || opcionesPropiedad[0],
    zona: persona?.zona || persona?.area || "",
    estado: persona?.estado || estadosPropietario[0],
  };
}

function inicialesPersona(nombre) {
  return nombre
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function PersonaModal({ kind, mode, persona, zones = [], onClose, onSubmit }) {
  const [formulario, setFormulario] = useState(() => formularioInicial(persona, kind));
  const esPropietario = kind === "owner";
  const esEdicion = mode === "edit";
  const entidad = esPropietario ? "propietario" : "agente";
  const nombreVisible = persona?.nombreCompleto || (esPropietario ? "Propietario" : "Agente");

  function actualizarCampo(event) {
    const { name: nombre, value } = event.target;
    setFormulario((current) => ({ ...current, [nombre]: value }));
  }

  async function enviarFormulario(event) {
    event.preventDefault();
    const nombreCompleto = `${formulario.nombre.trim()} ${formulario.apellido.trim()}`.trim();
    try {
      await onSubmit({ ...formulario, nombreCompleto, iniciales: inicialesPersona(nombreCompleto) });
    } catch (cause) {
      mostrarAviso({
        tipo: "error",
        titulo: esEdicion ? `No se pudo actualizar el ${entidad}` : `No se pudo crear el ${entidad}`,
        mensaje: cause.message || "No se pudieron guardar los cambios.",
      });
    }
  }

  return (
    <GestionModal
      onClose={onClose}
      title={`${esEdicion ? "Editar" : "Crear"} ${entidad}`}
      subtitle={esEdicion ? `Actualiza la información principal del ${entidad}` : `Completá los datos del ${entidad} para crear su cuenta.`}
      variant={esPropietario ? "person-owner" : "person-agent"}
    >
      <form onSubmit={enviarFormulario}>
        <div className="gestion-modal__card">
          <div className="gestion-modal__summary">
            <span className="gestion-modal__avatar" aria-hidden="true">
              {persona ? inicialesPersona(nombreVisible) : esPropietario ? "PR" : "AG"}
            </span>
            <span>
              <strong>{nombreVisible}</strong>
              <small>{esPropietario && esEdicion ? formulario.estado : persona?.estado || "Estado"}</small>
            </span>
          </div>
          <div className="gestion-modal__fields">
            <CampoModal label="Nombre">
              <EntradaModal
                icon={userIcon}
                name="nombre"
                value={formulario.nombre}
                onChange={actualizarCampo}
                placeholder="Nombre"
                autoComplete="given-name"
                required={!esEdicion}
              />
            </CampoModal>
            <CampoModal label="Apellido">
              <EntradaModal
                icon={userIcon}
                name="apellido"
                value={formulario.apellido}
                onChange={actualizarCampo}
                placeholder="Apellido"
                autoComplete="family-name"
                required={!esEdicion}
              />
            </CampoModal>
            <CampoModal label="Correo">
              <EntradaModal
                icon={envelopeIcon}
                name="correo"
                type="email"
                value={formulario.correo}
                onChange={actualizarCampo}
                placeholder="ejemplo@gmail.com"
                autoComplete="email"
              />
            </CampoModal>
            <CampoModal label="Teléfono">
              <EntradaModal
                icon={phoneIcon}
                name="telefono"
                type="tel"
                value={formulario.telefono}
                onChange={actualizarCampo}
                placeholder="2133 123123"
                autoComplete="tel"
              />
            </CampoModal>
            <CampoModal label="Dirección">
              <EntradaModal
                icon={locationDotIcon}
                name="direccion"
                value={formulario.direccion}
                onChange={actualizarCampo}
                placeholder="Av. San Martín 12"
                autoComplete="street-address"
              />
            </CampoModal>
            <CampoModal label="DNI">
              <EntradaModal
                icon={addressCardIcon}
                name="dni"
                value={formulario.dni}
                onChange={actualizarCampo}
                placeholder="12123123"
                inputMode="numeric"
                required
                pattern="[0-9]{7,8}"
                readOnly={esEdicion}
              />
            </CampoModal>
            {esPropietario && (
              <>
                <CampoModal label="CBU">
                  <EntradaModal
                    icon={buildingColumnsIcon}
                    name="cbu"
                    value={formulario.cbu}
                    onChange={actualizarCampo}
                    placeholder="2680000611000012436763"
                    inputMode="numeric"
                    maxLength={22}
                  />
                </CampoModal>
                <CampoModal label="Alias">
                  <EntradaModal
                    icon={buildingColumnsIcon}
                    name="alias"
                    value={formulario.alias}
                    onChange={actualizarCampo}
                    placeholder="pepe.cacho.felicidad"
                  />
                </CampoModal>
              </>
            )}
            {esEdicion && !esPropietario && <CampoModal label="Ciudad">
              <ModalSelect
                label="Ciudad"
                icon={houseIcon}
                options={["Sin asignar", ...zones]}
                value={formulario.zona || "Sin asignar"}
                onChange={(value) => {
                  setFormulario((current) => ({ ...current, zona: value === "Sin asignar" ? "" : value }));
                }}
              />
            </CampoModal>}
            {esEdicion && <CampoModal label="Estado">
              <ModalSelect
                label="Estado"
                icon={peopleIcon}
                options={esPropietario ? estadosPropietario : ["Estado", ...estadosAgente]}
                value={formulario.estado}
                onChange={(estado) => {
                  if (estado !== "Estado") setFormulario((current) => ({ ...current, estado }));
                }}
              />
            </CampoModal>}
          </div>
        </div>
        <AccionesModal onClose={onClose} submitText={esEdicion ? "Guardar cambios" : `Crear ${entidad}`} />
      </form>
    </GestionModal>
  );
}
