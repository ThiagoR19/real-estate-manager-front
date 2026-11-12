import { useEffect, useState } from "react";
import {
  clockIcon,
  envelopeIcon,
  locationDotIcon as locationIcon,
  magnifyingGlassIcon,
  peopleIcon,
  phoneIcon,
  plusIcon,
} from "../../assets/icons";
import {
  DropdownSelect,
  Button,
  SummaryPill,
  ManagementModal,
  ModalActions,
  ModalField,
  ModalInput,
  ConfirmDeleteModal,
  EntityActions,
} from "../../components";
import { api } from "../../services/api.js";
import initials from "../../utils/initials.js";
import "./Agents.css";

function ZoneFilter({ value, onChange, zones }) {
  return (
    <DropdownSelect
      label="Zona asignada"
      placeholder="Zona"
      value={value}
      options={zones}
      onChange={onChange}
      icon={locationIcon}
      className="agents__filter"
      triggerClassName="agents__filter-trigger"
      iconClassName="agents__filter-icon"
      chevronClassName="agents__filter-chevron"
    />
  );
}

function AgentRow({ agent, onEdit, onDelete }) {
  const name = `${agent.nombre} ${agent.apellido}`;
  return (
    <tr>
      <td data-label="Agente">
        <div className="agents__person">
          <span className="agents__avatar">
            {agent.urlFotoPerfil ? (
              <img src={api.assetUrl(agent.urlFotoPerfil)} alt="" />
            ) : (
              initials(agent.nombre, agent.apellido)
            )}
          </span>
          <span className="agents__person-copy">
            <strong>{name}</strong>
            <small>DNI {agent.dni || "—"}</small>
          </span>
        </div>
      </td>
      <td data-label="Correo">
        <span className="agents__contact">
          <img src={envelopeIcon} alt="" />
          {agent.correo || "—"}
        </span>
      </td>
      <td data-label="Teléfono">
        <span className="agents__contact">
          <img src={phoneIcon} alt="" />
          {agent.telefono || "—"}
        </span>
      </td>
      <td data-label="Zona asignada">
        <strong>{agent.area || "Sin asignar"}</strong>
      </td>
      <td data-label="Acciones" className="agents__actions-cell">
        <EntityActions
          entity="agente"
          name={name}
          onEdit={() => onEdit(agent)}
          onDelete={() => onDelete(agent)}
        />
      </td>
    </tr>
  );
}

function AgentModal({ agent, onClose, onSubmit }) {
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    const body = Object.fromEntries(new FormData(event.currentTarget));
    const photo = body.fotoPerfil;
    delete body.fotoPerfil;
    if (!body.password) delete body.password;

    try {
      setError("");
      await onSubmit(body, photo?.size ? photo : null);
    } catch (cause) {
      setError(cause.message);
    }
  }

  return (
    <ManagementModal title={agent ? "Editar agente" : "Crear agente"} onClose={onClose}>
      <form onSubmit={submit}>
        <div className="management-modal__card">
          <div className="management-modal__fields">
            <ModalField label="Nombre">
              <ModalInput name="nombre" defaultValue={agent?.nombre || ""} />
            </ModalField>
            <ModalField label="Apellido">
              <ModalInput name="apellido" defaultValue={agent?.apellido || ""} />
            </ModalField>
            <ModalField label="Correo">
              <ModalInput name="correo" defaultValue={agent?.correo || ""} />
            </ModalField>
            <ModalField label="Teléfono">
              <ModalInput name="telefono" defaultValue={agent?.telefono || ""} />
            </ModalField>
            <ModalField label="Dirección">
              <ModalInput name="direccion" defaultValue={agent?.direccion || ""} />
            </ModalField>
            <ModalField label="DNI">
              <ModalInput name="dni" defaultValue={agent?.dni || ""} />
            </ModalField>
            <ModalField label="Usuario">
              <ModalInput name="usuario" defaultValue={agent?.usuario || ""} />
            </ModalField>
            <ModalField label={agent ? "Nueva contraseña" : "Contraseña"}>
              <ModalInput name="password" type="password" />
            </ModalField>
            <ModalField label="Foto de perfil">
              <input name="fotoPerfil" type="file" accept="image/jpeg,image/png,image/webp" />
            </ModalField>
          </div>
        </div>
        {error && <p role="alert">{error}</p>}
        <ModalActions onClose={onClose} submitText={agent ? "Guardar cambios" : "Crear agente"} />
      </form>
    </ManagementModal>
  );
}

export default function Agents() {
  const [agents, setAgents] = useState([]);
  const [query, setQuery] = useState("");
  const [zone, setZone] = useState("Todas las zonas");
  const [modal, setModal] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [notice, setNotice] = useState("");
  const [activationUrl, setActivationUrl] = useState("");

  const [error, setError] = useState("");
  const zones = ["Todas las zonas", ...new Set(agents.map((agent) => agent.area).filter(Boolean))];
  const visibleAgents = agents.filter(
    (agent) =>
      [agent.nombre, agent.apellido, agent.dni, agent.correo, agent.area].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(query.toLowerCase()),
      ) &&
      (zone === zones[0] || agent.area === zone),
  );

  useEffect(() => {
    api
      .agents()
      .then(setAgents)
      .catch((cause) => setError(cause.message));
  }, []);

  async function saveAgent(body, photo) {
    const result =
      modal.mode === "edit"
        ? await api.updateAgent(modal.person.id, body)
        : await api.createAgent(body);
    let saved = result;
    let photoError = "";
    if (photo) {
      try {
        const uploaded = await api.updateAgentPhoto(result.id, photo);
        saved = { ...result, urlFotoPerfil: uploaded.urlFotoPerfil };
      } catch (cause) {
        photoError = ` La foto no se subió: ${cause.message}`;
      }
    }
    setAgents((current) =>
      modal.mode === "edit"
        ? current.map((agent) => (agent.id === result.id ? saved : agent))
        : [...current, saved],
    );
    setActivationUrl(result.activacion?.enlace || "");
    setNotice(
      `${modal.mode === "edit" ? "Agente actualizado" : "Agente creado"} correctamente.${photoError}`,
    );
    setModal(null);
  }

  async function deleteAgent() {
    try {
      await api.deleteAgent(pendingDelete.id);
      setAgents((current) => current.filter((agent) => agent.id !== pendingDelete.id));
      setPendingDelete(null);
      setActivationUrl("");
      setNotice("Agente eliminado correctamente.");
    } catch (cause) {
      setError(cause.message);
    }
  }

  return (
    <main id="agents">
      <div className="agents__page">
        <section className="agents__overview" aria-labelledby="agents-title">
          <div className="agents__hero">
            <h1 id="agents-title">Agentes</h1>
            <p>Gestiona la información de todos los agentes</p>
          </div>
          <div className="agents__summary" aria-label="Resumen de agentes">
            <SummaryPill
              label="Agentes activos"
              value={agents.filter((agent) => agent.estadoCuenta === "ACTIVO").length}
              icon={peopleIcon}
              tone="success"
            />
            <SummaryPill
              label="Pendientes"
              value={agents.filter((agent) => agent.estadoCuenta === "PENDIENTE_ACTIVACION").length}
              icon={clockIcon}
              tone="warning"
            />
          </div>
        </section>

        <section className="agents__toolbar" aria-label="Buscar y filtrar agentes">
          <label className="agents__search">
            <img src={magnifyingGlassIcon} alt="" />
            <input
              type="search"
              placeholder="Buscar contacto..."
              aria-label="Buscar contacto"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <ZoneFilter value={zone} onChange={setZone} zones={zones} />
          <Button
            className="agents__new-button"
            onClick={() => setModal({ mode: "create", person: null })}
            icon={plusIcon}
            text="Nuevo agente"
          />
        </section>

        <section className="agents__table-card" aria-label="Listado de agentes">
          <div className="agents__table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Agente</th>
                  <th>Correo</th>
                  <th>Teléfono</th>
                  <th>Zona asignada</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visibleAgents.map((agent) => (
                  <AgentRow
                    key={agent.id}
                    agent={agent}
                    onEdit={(person) => setModal({ mode: "edit", person })}
                    onDelete={setPendingDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
          {!visibleAgents.length && (
            <p className="agents__empty">No encontramos agentes con esos criterios.</p>
          )}
        </section>
      </div>

      {notice && (
        <p className="agents__notice" role="status">
          {notice} {activationUrl && <a href={activationUrl}>Abrir enlace de activación</a>}
        </p>
      )}
      {error && (
        <p className="agents__notice" role="alert">
          {error}
        </p>
      )}

      {modal && (
        <AgentModal
          key={modal.person?.id ?? "new"}
          agent={modal.person}
          onClose={() => setModal(null)}
          onSubmit={saveAgent}
        />
      )}
      <ConfirmDeleteModal
        isOpen={Boolean(pendingDelete)}
        title="¿Seguro que desea eliminar un agente?"
        onClose={() => setPendingDelete(null)}
        onConfirm={deleteAgent}
      />
    </main>
  );
}
