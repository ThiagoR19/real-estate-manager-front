import { useEffect, useState } from "react";
import {
  clockIcon,
  calendarIcon,
  envelopeIcon,
  locationDotIcon as locationIcon,
  magnifyingGlassIcon,
  peopleIcon,
  phoneIcon,
  plusIcon,
  xIcon,
} from "../../assets/icons";
import {
  SelectDesplegable,
  Boton,
  PildoraResumen,
  GestionModal,
  AccionesModal,
  CampoModal,
  EntradaModal,
  ModalSelect,
  ConfirmarEliminacionModal,
  AccionesEntidad,
  Paginacion,
  usePaginacion,
} from "../../components";
import { api } from "../../services/api.js";
import initials from "../../utils/initials.js";
import "./Agentes.css";

function enlaceActivacion(activacion) {
  if (activacion?.enlace) return activacion.enlace;
  return activacion?.codigo
    ? `${window.location.origin}/activar?codigo=${encodeURIComponent(activacion.codigo)}`
    : "";
}

function FiltroZona({ value, onChange, zones }) {
  return (
    <SelectDesplegable
      label="Zona"
      placeholder="Zona"
      value={value}
      options={zones}
      onChange={onChange}
      icon={locationIcon}
      className="agentes__filter"
      triggerClassName="agentes__filter-trigger"
      iconClassName="agentes__filter-icon"
      chevronClassName="agentes__filter-chevron"
    />
  );
}

function FilaAgente({ agent, onEdit, onDelete, onGenerateActivation }) {
  const name = `${agent.nombre || ""} ${agent.apellido || ""}`.trim() || `DNI ${agent.dni}`;
  return (
    <tr>
      <td data-label="Agente">
        <div className="agentes__person">
          <span className="agentes__avatar">
            {agent.urlFotoPerfil ? (
              <img src={api.urlRecurso(agent.urlFotoPerfil)} alt="" />
            ) : (
              initials(agent.nombre, agent.apellido)
            )}
          </span>
          <span className="agentes__person-copy">
            <strong>{name}</strong>
            <small>DNI {agent.dni || "—"}</small>
          </span>
        </div>
      </td>
      <td data-label="Correo">
        <span className="agentes__contact">
          <img src={envelopeIcon} alt="" />
          {agent.correo || "—"}
        </span>
      </td>
      <td data-label="Teléfono">
        <span className="agentes__contact">
          <img src={phoneIcon} alt="" />
          {agent.telefono || "—"}
        </span>
      </td>
      <td data-label="Zona">
        <strong>{agent.zona || "Sin asignar"}</strong>
      </td>
      <td data-label="Acciones" className="agentes__actions-cell">
        {agent.estadoCuenta === "PENDIENTE_ACTIVACION" && (
          <button type="button" className="agentes__activation-button" onClick={() => onGenerateActivation(agent)}>
            Generar enlace
          </button>
        )}
        <AccionesEntidad
          entity="agente"
          name={name}
          onEdit={() => onEdit(agent)}
          onDelete={() => onDelete(agent)}
        />
      </td>
    </tr>
  );
}

function AgenteModal({ agent, areas, onClose, onSubmit }) {
  const [error, setError] = useState("");
  const [areaId, setAreaId] = useState(String(agent?.idArea ?? ""));
  const selectedArea = areas.find((area) => String(area.id) === areaId);

  async function submit(event) {
    event.preventDefault();
    const body = Object.fromEntries(new FormData(event.currentTarget));
    if (!agent) {
      for (const key of Object.keys(body)) if (key !== "dni" && key !== "idArea") delete body[key];
    } else {
      delete body.dni;
      for (const key of Object.keys(body)) if (body[key] === "") body[key] = null;
    }
    body.idArea = body.idArea ? Number(body.idArea) : null;

    try {
      setError("");
      await onSubmit(body);
    } catch (cause) {
      setError(cause.message);
    }
  }

  return (
    <GestionModal title={agent ? "Editar agente" : "Crear agente"} onClose={onClose}>
      <form onSubmit={submit}>
        <div className="gestion-modal__card">
          <div className="gestion-modal__fields">
            {agent && <><CampoModal label="Nombre">
              <EntradaModal name="nombre" defaultValue={agent?.nombre || ""} />
            </CampoModal>
            <CampoModal label="Apellido">
              <EntradaModal name="apellido" defaultValue={agent?.apellido || ""} />
            </CampoModal>
            <CampoModal label="Correo">
              <EntradaModal name="correo" defaultValue={agent?.correo || ""} />
            </CampoModal>
            <CampoModal label="Teléfono">
              <EntradaModal name="telefono" defaultValue={agent?.telefono || ""} />
            </CampoModal>
            <CampoModal label="Dirección">
              <EntradaModal name="direccion" defaultValue={agent?.direccion || ""} />
            </CampoModal>
            </>}
            <CampoModal label="DNI">
              <EntradaModal name="dni" defaultValue={agent?.dni || ""} required pattern="[0-9]{7,8}" inputMode="numeric" readOnly={Boolean(agent)} />
            </CampoModal>
            <CampoModal label="Zona">
              <input type="hidden" name="idArea" value={selectedArea ? areaId : ""} />
              <ModalSelect
                label="Zona"
                icon={locationIcon}
                options={["Sin asignar", ...areas.map((area) => area.nombre)]}
                value={selectedArea?.nombre || "Sin asignar"}
                onChange={(nombre) => setAreaId(nombre === "Sin asignar" ? "" : String(areas.find((area) => area.nombre === nombre)?.id ?? ""))}
              />
            </CampoModal>
          </div>
        </div>
        {error && <p role="alert">{error}</p>}
        <AccionesModal onClose={onClose} submitText={agent ? "Guardar cambios" : "Crear agente"} />
      </form>
    </GestionModal>
  );
}

export default function Agentes() {
  const [agents, setAgents] = useState([]);
  const [areas, setAreas] = useState([]);
  const [visits, setVisits] = useState([]);
  const [query, setQuery] = useState("");
  const [zone, setZone] = useState("Todas las zonas");
  const [modal, setModal] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [notice, setNotice] = useState("");
  const [activationUrl, setActivationUrl] = useState("");

  const [error, setError] = useState("");
  const zones = ["Todas las zonas", ...new Set(areas.map((area) => area.nombre))];
  const visibleAgents = agents.filter(
    (agent) =>
      [agent.nombre, agent.apellido, agent.dni, agent.correo, agent.zona].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(query.toLowerCase()),
      ) &&
      (zone === zones[0] || agent.zona === zone),
  );
  const today = new Date().toDateString();
  const todayVisits = visits.filter((visit) => new Date(visit.fecha).toDateString() === today).length;
  const cancelledVisits = visits.filter((visit) => visit.estado === "Cancelada").length;
  const { page, totalPages, pageItems, setPage, resetPage } = usePaginacion(visibleAgents);

  useEffect(() => {
    Promise.all([api.agentes(), api.areas(), api.todasLasVisitas()])
      .then(([agentRows, areaRows, visitRows]) => {
        setAgents(agentRows);
        setAreas(areaRows);
        setVisits(visitRows);
      })
      .catch((cause) => setError(cause.message));
  }, []);

  async function saveAgent(body) {
    const result =
      modal.mode === "edit"
        ? await api.actualizarAgente(modal.person.id, body)
        : await api.crearAgente(body);
    setAgents((current) =>
      modal.mode === "edit"
        ? current.map((agent) => (agent.id === result.id ? result : agent))
        : [...current, result],
    );
    setActivationUrl(enlaceActivacion(result.activacion));
    setNotice(
      modal.mode === "edit"
        ? "Agente actualizado correctamente."
        : "Agente creado. Copiá el enlace y compartilo para que active su cuenta.",
    );
    setModal(null);
  }

  async function generateActivation(agent) {
    try {
      setError("");
      const activacion = await api.generarEnlaceAgente(agent.id);
      setActivationUrl(enlaceActivacion(activacion));
      setNotice(`Enlace nuevo para ${agent.nombre || `DNI ${agent.dni}`}. Compartilo con el agente para activar su cuenta.`);
    } catch (cause) {
      setError(cause.message);
    }
  }

  async function deleteAgent() {
    try {
      await api.eliminarAgente(pendingDelete.id);
      setAgents((current) => current.filter((agent) => agent.id !== pendingDelete.id));
      setPendingDelete(null);
      setActivationUrl("");
      setNotice("Agente eliminado correctamente.");
    } catch (cause) {
      setError(cause.message);
    }
  }

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
              value={agents.filter((agent) => agent.estadoCuenta === "ACTIVO").length}
              icon={peopleIcon}
              tone="success"
            />
            <PildoraResumen
              label="Pendientes"
              value={agents.filter((agent) => agent.estadoCuenta === "PENDIENTE_ACTIVACION").length}
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
              value={query}
              onChange={(event) => { setQuery(event.target.value); resetPage(); }}
            />
          </label>
          <FiltroZona value={zone} onChange={(value) => { setZone(value); resetPage(); }} zones={zones} />
          <Boton
            className="agentes__new-button"
            onClick={() => setModal({ mode: "create", person: null })}
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
                {pageItems.map((agent) => (
                  <FilaAgente
                    key={agent.id}
                    agent={agent}
                    onEdit={(person) => setModal({ mode: "edit", person })}
                    onDelete={setPendingDelete}
                    onGenerateActivation={generateActivation}
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

      {notice && (
        <div className="agentes__notice" role="status">
          <p>{notice}</p>
          {activationUrl && <div className="agentes__activation-link">
            <input aria-label="Enlace de activación" readOnly value={activationUrl} onFocus={(event) => event.currentTarget.select()} />
            <button type="button" onClick={() => navigator.clipboard.writeText(activationUrl)}>Copiar enlace</button>
          </div>}
        </div>
      )}
      {error && (
        <p className="agentes__notice" role="alert">
          {error}
        </p>
      )}

      {modal && (
        <AgenteModal
          key={modal.person?.id ?? "new"}
          agent={modal.person}
          areas={areas.filter((area) => !modal.person || area.idInmobiliaria === modal.person.idInmobiliaria)}
          onClose={() => setModal(null)}
          onSubmit={saveAgent}
        />
      )}
      <ConfirmarEliminacionModal
        isOpen={Boolean(pendingDelete)}
        title="¿Seguro que desea eliminar un agente?"
        onClose={() => setPendingDelete(null)}
        onConfirm={deleteAgent}
      />
    </main>
  );
}
