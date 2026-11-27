import { useEffect, useState } from "react";
import { clockIcon, calendarIcon, envelopeIcon, locationDotIcon, magnifyingGlassIcon, peopleIcon, phoneIcon, plusIcon, xIcon } from "../../assets/icons";
import { SelectDesplegable, Boton, PildoraResumen, GestionModal, AccionesModal, CampoModal, EntradaModal, ModalSelect, ConfirmarEliminacionModal, AccionesEntidad, AvisoEnlaceActivacion, Paginacion, usePaginacion, mostrarAviso } from "../../components";
import { api } from "../../services/api.js";
import PageSkeleton from "../../components/skeleton/PageSkeleton";
import avatarClass from "../../utils/avatarClass.js";
import initials from "../../utils/initials.js";
import "./Agentes.css";

function enlaceActivacion(activacion) {
  if (activacion?.enlace) return activacion.enlace;
  return activacion?.codigo ? `${window.location.origin}/activar?codigo=${encodeURIComponent(activacion.codigo)}` : "";
}

function FiltroZona({ value, onChange, zones }) {
  return (
    <SelectDesplegable
      label="Zona"
      placeholder="Zona"
      value={value}
      options={zones}
      onChange={onChange}
      icon={locationDotIcon}
      className="agentes__filter"
      triggerClassName="agentes__filter-trigger"
      iconClassName="agentes__filter-icon"
      chevronClassName="agentes__filter-chevron"
    />
  );
}

function FilaAgente({ agente, onEdit, onDelete, onGenerateActivation }) {
  const nombre = `${agente.nombre || ""} ${agente.apellido || ""}`.trim() || `DNI ${agente.dni}`;
  return (
    <tr>
      <td data-label="Agente">
        <div className="agentes__person">
          <span className={`agentes__avatar ${avatarClass(agente.nombre, agente.apellido)}`}>
            {agente.urlFotoPerfil ? (
              <img src={api.urlRecurso(agente.urlFotoPerfil)} alt="" />
            ) : (
              initials(agente.nombre, agente.apellido)
            )}
          </span>
          <span className="agentes__person-copy">
            <strong>{nombre}</strong>
            <small>DNI {agente.dni || "—"}</small>
          </span>
        </div>
      </td>
      <td data-label="Correo">
        <span className="agentes__contact">
          <img src={envelopeIcon} alt="" />
          {agente.correo || "—"}
        </span>
      </td>
      <td data-label="Teléfono">
        <span className="agentes__contact">
          <img src={phoneIcon} alt="" />
          {agente.telefono || "—"}
        </span>
      </td>
      <td data-label="Zona">
        <strong>{agente.zona || "Sin asignar"}</strong>
      </td>
      <td data-label="Acciones" className="agentes__actions-cell">
        <AccionesEntidad
          entidad="agente"
          nombre={nombre}
          onEdit={() => onEdit(agente)}
          onDelete={() => onDelete(agente)}
          onGenerateActivation={
            agente.estadoCuenta === "PENDIENTE_ACTIVACION"
              ? () => onGenerateActivation(agente)
              : undefined
          }
        />
      </td>
    </tr>
  );
}

function AgenteModal({ agente, areas, onClose, onSubmit }) {
  const [areaId, setAreaId] = useState(String(agente?.idArea ?? ""));
  const selectedArea = areas.find((area) => String(area.id) === areaId);

  async function enviarFormulario(event) {
    event.preventDefault();
    const body = Object.fromEntries(new FormData(event.currentTarget));
    if (agente) {
      delete body.dni;
      for (const key of Object.keys(body)) if (body[key] === "") body[key] = null;
    }
    body.idArea = body.idArea ? Number(body.idArea) : null;

    try {
      await onSubmit(body);
    } catch (cause) {
      mostrarAviso({
        tipo: "error",
        titulo: agente ? "No se pudo actualizar el agente" : "No se pudo crear el agente",
        mensaje: cause.message,
      });
    }
  }

  return (
    <GestionModal title={agente ? "Editar agente" : "Crear agente"} onClose={onClose}>
      <form onSubmit={enviarFormulario}>
        <div className="gestion-modal__card">
          <div className="gestion-modal__fields">
            <CampoModal label="Nombre">
              <EntradaModal name="nombre" defaultValue={agente?.nombre || ""} placeholder="Nombre" required={!agente} />
            </CampoModal>
            <CampoModal label="Apellido">
              <EntradaModal name="apellido" defaultValue={agente?.apellido || ""} placeholder="Apellido" required={!agente} />
            </CampoModal>
            <CampoModal label="Correo">
              <EntradaModal name="correo" type="email" defaultValue={agente?.correo || ""} placeholder="ejemplo@gmail.com" />
            </CampoModal>
            <CampoModal label="Teléfono">
              <EntradaModal name="telefono" defaultValue={agente?.telefono || ""} placeholder="2133 123123" />
            </CampoModal>
            <CampoModal label="Dirección">
              <EntradaModal name="direccion" defaultValue={agente?.direccion || ""} placeholder="Av. San Martín 12" />
            </CampoModal>
            <CampoModal label="DNI">
              <EntradaModal name="dni" defaultValue={agente?.dni || ""} placeholder="12123123" required pattern="[0-9]{7,8}" inputMode="numeric" readOnly={Boolean(agente)} />
            </CampoModal>
            <CampoModal label="Zona">
              <input type="hidden" name="idArea" value={selectedArea ? areaId : ""} />
              <ModalSelect
                label="Zona"
                icon={locationDotIcon}
                options={["Sin asignar", ...areas.map((area) => area.nombre)]}
                value={selectedArea?.nombre || "Sin asignar"}
                onChange={(nombre) => setAreaId(nombre === "Sin asignar" ? "" : String(areas.find((area) => area.nombre === nombre)?.id ?? ""))}
              />
            </CampoModal>
          </div>
        </div>
        <AccionesModal onClose={onClose} submitText={agente ? "Guardar cambios" : "Crear agente"} />
      </form>
    </GestionModal>
  );
}

export default function Agentes() {
  const [agentes, setAgentes] = useState([]);
  const [areas, setAreas] = useState([]);
  const [visitas, setVisitas] = useState([]);
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [zone, setZone] = useState("Todas las zonas");
  const [modal, setModal] = useState(null);
  const [pendienteEliminar, setPendienteEliminar] = useState(null);
  const [aviso, setAviso] = useState("");
  const [enlaceActivacionGenerado, setEnlaceActivacion] = useState("");

  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const zones = ["Todas las zonas", ...new Set(areas.map((area) => area.nombre))];
  const visibleAgents = agentes.filter(
    (agente) =>
      [agente.nombre, agente.apellido, agente.dni, agente.correo, agente.zona].some((value) =>
        String(value ?? "").toLowerCase().includes(textoBusqueda.toLowerCase()),
      ) &&
      (zone === zones[0] || agente.zona === zone),
  );
  const today = new Date().toDateString();
  const todayVisits = visitas.filter((visita) => new Date(visita.fecha).toDateString() === today).length;
  const cancelledVisits = visitas.filter((visita) => visita.estado === "Cancelada").length;
  const { page, totalPages, pageItems, setPage, resetPage } = usePaginacion(visibleAgents);

  useEffect(() => {
    let active = true;
    Promise.all([api.agentes(), api.areas(), api.todasLasVisitas()])
      .then(([agentRows, areaRows, visitasRecibidas]) => {
        if (!active) return;
        setAgentes(agentRows);
        setAreas(areaRows);
        setVisitas(visitasRecibidas);
      })
      .catch((cause) => {
        if (!active) return;
        setError(cause.message);
        mostrarAviso({ tipo: "error", titulo: "No se pudieron cargar los agentes", mensaje: cause.message });
      })
      .finally(() => { if (active) setCargando(false); });
    return () => { active = false; };
  }, []);

  async function guardarAgente(body) {
    const result =
      modal.mode === "edit"
        ? await api.actualizarAgente(modal.persona.id, body)
        : await api.crearAgente(body);
    setAgentes((current) =>
      modal.mode === "edit"
        ? current.map((agente) => (agente.id === result.id ? result : agente))
        : [...current, result],
    );
    const urlActivacion = enlaceActivacion(result.activacion);
    setEnlaceActivacion(modal.mode === "edit" ? "" : urlActivacion);
    setAviso(modal.mode === "edit" || !urlActivacion ? "" : "Agente creado. Copiá el enlace y compartilo para que active su cuenta.");
    mostrarAviso({
      tipo: "exito",
      titulo: modal.mode === "edit" ? "Agente actualizado" : "Agente creado",
      mensaje: modal.mode === "edit" ? "Los datos del agente se guardaron." : "El agente ya está en la lista.",
    });
    setModal(null);
  }

  async function generarEnlaceActivacion(agente) {
    try {
      setError("");
      const activacion = await api.generarEnlaceAgente(agente.id);
      setEnlaceActivacion(enlaceActivacion(activacion));
      setAviso(`Enlace nuevo para ${agente.nombre || `DNI ${agente.dni}`}. Compartilo con el agente para activar su cuenta.`);
      mostrarAviso({ tipo: "info", titulo: "Enlace de activación generado", mensaje: "Copialo y compartilo con el agente para que active su cuenta." });
    } catch (cause) {
      mostrarAviso({ tipo: "error", titulo: "No se pudo generar el enlace", mensaje: cause.message });
    }
  }

  async function eliminarAgente() {
    try {
      await api.eliminarAgente(pendienteEliminar.id);
      setAgentes((current) => current.filter((agente) => agente.id !== pendienteEliminar.id));
      setPendienteEliminar(null);
      setEnlaceActivacion("");
      setAviso("");
      mostrarAviso({ tipo: "exito", titulo: "Agente eliminado", mensaje: "El agente se eliminó correctamente." });
    } catch (cause) {
      mostrarAviso({ tipo: "error", titulo: "No se pudo eliminar el agente", mensaje: cause.message });
    }
  }

  if (cargando) return <PageSkeleton variant="table" title="agentes" />;

  return (
    <main id="agentes">
      <div className="agentes__page">
        <section className="agentes__overview" aria-labelledby="agentes-title">
          <div className="agentes__hero">
            <h1 id="agentes-title">Agentes</h1>
            <p>Gestiona la información de todos los agentes</p>
          </div>
          <div className="agentes__summary" aria-label="Resumen de agentes">
            <PildoraResumen
              label="Agentes activos"
              value={agentes.filter((agente) => agente.estadoCuenta === "ACTIVO").length}
              icon={peopleIcon}
              tone="success"
            />
            <PildoraResumen
              label="Pendientes"
              value={agentes.filter((agente) => agente.estadoCuenta === "PENDIENTE_ACTIVACION").length}
              icon={clockIcon}
              tone="warning"
            />
            <PildoraResumen
              label="Visitas de hoy"
              value={todayVisits}
              icon={calendarIcon}
              tone="info"
            />
            <PildoraResumen
              label="Visitas canceladas"
              value={cancelledVisits}
              icon={xIcon}
              tone="danger"
            />
          </div>
        </section>

        <section className="agentes__toolbar" aria-label="Buscar y filtrar agentes">
          <label className="agentes__search">
            <img src={magnifyingGlassIcon} alt="" />
            <input
              type="search"
              placeholder="Buscar contacto..."
              aria-label="Buscar contacto"
              value={textoBusqueda}
              onChange={(event) => { setTextoBusqueda(event.target.value); resetPage(); }}
            />
          </label>
          <FiltroZona value={zone} onChange={(value) => { setZone(value); resetPage(); }} zones={zones} />
          <Boton
            className="agentes__new-button"
            onClick={() => setModal({ mode: "create", persona: null })}
            icon={plusIcon}
            text="Nuevo agente"
          />
        </section>

        <section className="agentes__table-card" aria-label="Listado de agentes">
          <div className="agentes__table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Agente</th>
                  <th>Correo</th>
                  <th>Teléfono</th>
                  <th>Zona</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((agente) => (
                  <FilaAgente
                    key={agente.id}
                    agente={agente}
                    onEdit={(persona) => setModal({ mode: "edit", persona })}
                    onDelete={setPendienteEliminar}
                    onGenerateActivation={generarEnlaceActivacion}
                  />
                ))}
              </tbody>
            </table>
          </div>
          {!visibleAgents.length && (
            <p className="agentes__empty">No encontramos agentes con esos criterios.</p>
          )}
          <Paginacion page={page} totalPages={totalPages} total={visibleAgents.length} onPageChange={setPage} />
        </section>
      </div>

      {aviso && (
        <AvisoEnlaceActivacion
          message={aviso}
          url={enlaceActivacionGenerado}
          onDismiss={() => { setAviso(""); setEnlaceActivacion(""); }}
        />
      )}
      {error && (
        <p className="agentes__notice" role="alert">
          {error}
        </p>
      )}

      {modal && (
        <AgenteModal
          key={modal.persona?.id ?? "new"}
          agente={modal.persona}
          areas={areas.filter((area) => !modal.persona || area.idInmobiliaria === modal.persona.idInmobiliaria)}
          onClose={() => setModal(null)}
          onSubmit={guardarAgente}
        />
      )}
      <ConfirmarEliminacionModal
        isOpen={Boolean(pendienteEliminar)}
        title="¿Seguro que desea eliminar un agente?"
        onClose={() => setPendienteEliminar(null)}
        onConfirm={eliminarAgente}
      />
    </main>
  );
}
