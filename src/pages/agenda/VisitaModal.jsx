import { useState } from "react";
import { calendarIcon, clockIcon, peopleIcon, userIcon } from "../../assets/icons";
import { GestionModal, AccionesModal, CampoModal, EntradaModal, mostrarAviso } from "../../components";
import SelectorPropiedad from "../../components/propiedad/SelectorPropiedad.jsx";
import "./VisitaModal.css";

export default function VisitaModal({
  visita,
  fechaInicial,
  clientes,
  agentes,
  onClose,
  onSubmit,
}) {
  const enEdicion = Boolean(visita);
  const [formulario, setFormulario] = useState({
    fecha: visita?.fecha || fechaInicial || "",
    hora: visita?.hora || "10:00",
    idCliente: String(visita?.idCliente || clientes[0]?.id || "new"),
    nombreCliente: "",
    apellidoCliente: "",
    interesCliente: "ALQUILER",
    idPropiedad: String(visita?.idPropiedad || ""),
    idAgente: String(visita?.idAgente || ""),
    estado: visita?.estado || "Programada",
    motivo: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function actualizarCampo(nombre, value) {
    setFormulario((current) => ({ ...current, [nombre]: value }));
    setError("");
  }

  async function enviarFormulario(event) {
    event.preventDefault();
    if (!formulario.idCliente || !formulario.idPropiedad) {
      setError("Seleccioná un cliente y una propiedad.");
      return;
    }
    if (formulario.estado === "Cancelada" && !formulario.motivo.trim()) {
      setError("Indicá el motivo de cancelación.");
      return;
    }
    const fecha = new Date(`${formulario.fecha}T${formulario.hora}:00`).toISOString();
    if (formulario.idCliente === "new" && (!formulario.nombreCliente.trim() || !formulario.apellidoCliente.trim())) {
      setError("Ingresá el nombre y apellido del cliente.");
      return;
    }
    setBusy(true);
    try {
      await onSubmit({
        idCliente: formulario.idCliente === "new" ? null : Number(formulario.idCliente),
        nombreCliente: formulario.nombreCliente.trim(),
        apellidoCliente: formulario.apellidoCliente.trim(),
        interesCliente: formulario.interesCliente,
        idPropiedad: Number(formulario.idPropiedad),
        ...(enEdicion || formulario.idAgente ? { idAgente: Number(formulario.idAgente) } : {}),
        fecha,
        estado: formulario.estado,
        motivo: formulario.motivo.trim(),
      });
    } catch (error) {
      mostrarAviso({
        tipo: "error",
        titulo: enEdicion ? "No se pudo guardar la visita" : "No se pudo agendar la visita",
        mensaje: error.message,
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <GestionModal
      onClose={onClose}
      title={enEdicion ? "Editar visita" : "Agendar visita"}
      subtitle="Completá los datos de la visita"
      variant="compact"
    >
      <form className="visita-modal" onSubmit={enviarFormulario}>
        <div className="gestion-modal__card">
          <div className="gestion-modal__summary visita-modal__summary">
            <strong className="visita-modal__section-title">
              <span>1</span>Datos
            </strong>
            <div className="visita-modal__date">
              <EntradaModal
                icon={calendarIcon}
                name="fecha"
                type="date"
                aria-label="Fecha de la visita"
                value={formulario.fecha}
                onChange={(event) => actualizarCampo("fecha", event.target.value)}
                required
              />
            </div>
          </div>

          <div className="gestion-modal__fields visita-modal__fields">
            <CampoModal label="Cliente">
              <span className="visita-modal__select-wrap">
                <img src={userIcon} alt="" />
                <select
                  value={formulario.idCliente}
                  onChange={(event) => actualizarCampo("idCliente", event.target.value)}
                  required
                >
                  <option value="new">+ Nuevo cliente</option>
                  {clientes.map((cliente) => (
                    <option value={cliente.id} key={cliente.id}>
                      {cliente.nombre} {cliente.apellido}
                    </option>
                  ))}
                </select>
              </span>
            </CampoModal>

            {formulario.idCliente === "new" && (
              <div className="visita-modal__new-client">
                <CampoModal label="Nombre">
                  <input
                    value={formulario.nombreCliente}
                    onChange={(event) => actualizarCampo("nombreCliente", event.target.value)}
                    required
                  />
                </CampoModal>
                <CampoModal label="Apellido">
                  <input
                    value={formulario.apellidoCliente}
                    onChange={(event) => actualizarCampo("apellidoCliente", event.target.value)}
                    required
                  />
                </CampoModal>
                <CampoModal label="Interés">
                  <select
                    value={formulario.interesCliente}
                    onChange={(event) => actualizarCampo("interesCliente", event.target.value)}
                  >
                    <option value="ALQUILER">Alquiler</option>
                    <option value="COMPRA">Compra</option>
                    <option value="AMBOS">Ambos</option>
                  </select>
                </CampoModal>
              </div>
            )}

            <div className="gestion-modal__field" role="group" aria-label="Propiedad">
              <span className="gestion-modal__label">Propiedad</span>
              <SelectorPropiedad valor={formulario.idPropiedad} requerida
                propiedadInicial={visita?.idPropiedad ? { id: visita.idPropiedad, nombre: visita.propiedad } : null}
                alCambiar={(idPropiedad) => actualizarCampo("idPropiedad", String(idPropiedad))} />
            </div>

            <CampoModal label="Hora">
              <EntradaModal
                icon={clockIcon}
                name="hora"
                type="time"
                value={formulario.hora}
                onChange={(event) => actualizarCampo("hora", event.target.value)}
                required
              />
            </CampoModal>

            <CampoModal label="Agente">
              <span className="visita-modal__select-wrap">
                <img src={peopleIcon} alt="" />
                <select
                  value={formulario.idAgente}
                  onChange={(event) => actualizarCampo("idAgente", event.target.value)}
                  required={enEdicion}
                >
                  <option value="">Asignarme la visita</option>
                  {agentes.map((agente) => (
                    <option value={agente.id} key={agente.id}>
                      {agente.nombre}
                    </option>
                  ))}
                </select>
              </span>
            </CampoModal>

            {enEdicion && (
              <CampoModal label="Estado">
                <span className="visita-modal__select-wrap">
                  <img src={clockIcon} alt="" />
                  <select
                    value={formulario.estado}
                    onChange={(event) => actualizarCampo("estado", event.target.value)}
                  >
                    {["Programada", "Realizada", "Cancelada"].map((status) => (
                      <option value={status} key={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </span>
              </CampoModal>
            )}

            {formulario.estado === "Cancelada" && (
              <CampoModal label="Motivo de cancelación">
                <textarea
                  className="visita-modal__reason"
                  value={formulario.motivo}
                  onChange={(event) => actualizarCampo("motivo", event.target.value)}
                  maxLength={500}
                  required
                />
              </CampoModal>
            )}

            {error && (
              <p className="visita-modal__error" role="alert">
                {error}
              </p>
            )}
          </div>
        </div>

        <AccionesModal
          onClose={onClose}
          submitText={enEdicion ? "Guardar cambios" : "Agendar visita"}
          disabled={busy}
        />
      </form>
    </GestionModal>
  );
}
