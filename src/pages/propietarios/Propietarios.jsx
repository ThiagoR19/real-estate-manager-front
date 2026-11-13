import { useEffect, useState } from "react";
import {
  envelopeIcon,
  fileLinesIcon as fileIcon,
  clockIcon,
  magnifyingGlassIcon,
  peopleIcon,
  phoneIcon,
  plusIcon,
  xIcon,
} from "../../assets/icons";
import propertyImage from "/images.jpg";
import {
  Boton,
  PildoraResumen,
  ConfirmarEliminacionModal,
  AccionesEntidad,
  Paginacion,
  usePaginacion,
} from "../../components";
import PersonaModal from "./PersonaModal";
import "./Propietarios.css";
import { api } from "../../services/api.js";
import initials from "../../utils/initials.js";

const displayOwner = (owner) => ({
  ...owner,
  name: `${owner.nombre || ""} ${owner.apellido || ""}`.trim() || `DNI ${owner.dni}`,
  initials: initials(owner.nombre, owner.apellido),
  email: owner.correo || "",
  phone: owner.telefono || "",
  address: owner.direccion || "",
  unit: "",
  status: owner.estadoCuenta === "PENDIENTE_ACTIVACION" ? "Pendiente" : owner.activo ? "Activo" : "Inactivo",
});

const summaryCards = [
  { label: "Cobros pendientes", value: "2", icon: xIcon, tone: "danger" },
  { label: "Liquidaciones por generar", value: "10", icon: clockIcon, tone: "warning" },
  { label: "Propietarios activos", value: "24", icon: peopleIcon, tone: "success" },
  { label: "Cobros acreditados", value: "18", icon: fileIcon, tone: "info" },
];

function FilaPropietario({ owner, onEdit, onDelete }) {
  return (
    <tr>
      <td data-label="Propietario">
        <div className="propietarios__person">
          <span className="propietarios__avatar">{owner.initials}</span>
          <span className="propietarios__person-copy">
            <strong>{owner.name}</strong>
            <small>DNI {owner.dni}</small>
          </span>
        </div>
      </td>
      <td data-label="Contacto">
        <div className="propietarios__contact">
          <span>
            <img src={envelopeIcon} alt="" />
            {owner.email || "—"}
          </span>
          <span>
            <img src={phoneIcon} alt="" />
            {owner.phone || "—"}
          </span>
        </div>
      </td>
      <td data-label="Propiedad">
        <div className="propietarios__propiedad">
          <img className="propietarios__propiedad-image" src={propertyImage} alt="" />
          <span>
            <strong>{owner.property || "Sin propiedad asignada"}</strong>
            <small>{owner.unit}</small>
          </span>
        </div>
      </td>
      <td data-label="CBU">
        <span className="propietarios__muted-value">{owner.cbu || "—"}</span>
      </td>
      <td data-label="Alias">
        <span className="propietarios__muted-value">{owner.alias || "—"}</span>
      </td>
      <td data-label="Estado">
        <span className="propietarios__status">{owner.status}</span>
      </td>
      <td data-label="Acciones" className="propietarios__actions-cell">
        <AccionesEntidad
          entity="propietario"
          name={owner.name}
          onEdit={() => onEdit(owner)}
          onDelete={() => onDelete(owner)}
        />
      </td>
    </tr>
  );
}

export default function Propietarios() {
  const [owners, setOwners] = useState([]);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [notice, setNotice] = useState("");
  const [activationUrl, setActivationUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.propietarios().then((rows) => setOwners(rows.map(displayOwner))).catch((cause) => setError(cause.message));
  }, []);

  const normalizedQuery = query.trim().toLowerCase();
  const visibleOwners = owners.filter(
    (owner) =>
      !normalizedQuery ||
      [
        owner.name,
        owner.dni,
        owner.email,
        owner.address,
        owner.property || "",
        owner.cbu,
        owner.alias,
      ].some((value) => String(value ?? "").toLowerCase().includes(normalizedQuery)),
  );
  const { page, totalPages, pageItems, setPage, resetPage } = usePaginacion(visibleOwners);

  async function saveOwner(data) {
    const raw = modal.mode === "edit"
      ? await api.actualizarPropietario(modal.person.id, {
          nombre: data.firstName || null, apellido: data.lastName || null,
          correo: data.email || null, telefono: data.phone || null,
          direccion: data.address || null, cbu: data.cbu || null,
          alias: data.alias || null, activo: data.status !== "Inactivo",
        })
      : await api.crearPropietario({ dni: data.dni });
    const saved = displayOwner(raw);
    setOwners((current) => modal.mode === "edit"
      ? current.map((owner) => owner.id === saved.id ? saved : owner)
      : [saved, ...current]);
    setActivationUrl(raw.activacion?.enlace || "");
    setNotice(modal.mode === "edit" ? "Propietario actualizado correctamente." : "Propietario creado. Compartí el enlace de activación con su titular.");
    setModal(null);
  }

  async function deleteOwner() {
    try {
      await api.eliminarPropietario(pendingDelete.id);
      setOwners((current) => current.filter((owner) => owner.id !== pendingDelete.id));
      setNotice("Propietario eliminado correctamente.");
      setActivationUrl("");
    } catch (cause) { setError(cause.message); }
    finally { setPendingDelete(null); }
  }

  return (
    <main id="propietarios">
      <div className="propietarios__page">
        <section className="propietarios__overview" aria-labelledby="propietarios-title">
          <div className="propietarios__hero">
            <h1 id="propietarios-title">Propietarios</h1>
            <p>Gestiona la información de todos los propietarios</p>
          </div>

          <div className="propietarios__summary" aria-label="Resumen de propietarios">
            {summaryCards.map((card) => (
              <PildoraResumen key={card.label} {...card} />
            ))}
          </div>
        </section>

        <section className="propietarios__toolbar" aria-label="Buscar propietarios">
          <label className="propietarios__search">
            <img src={magnifyingGlassIcon} alt="" />
            <input
              type="search"
              placeholder="Buscar propietario..."
              aria-label="Buscar propietario"
              value={query}
              onChange={(event) => { setQuery(event.target.value); resetPage(); }}
            />
          </label>
          <Boton
            className="propietarios__new-button"
            onClick={() => setModal({ mode: "create", person: null })}
            icon={plusIcon}
            text="Nuevo propietario"
          />
        </section>

        <section className="propietarios__table-card" aria-label="Listado de propietarios">
          <div className="propietarios__table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Propietario</th>
                  <th>Contacto</th>
                  <th>Propiedad</th>
                  <th>CBU</th>
                  <th>ALIAS</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((owner) => (
                  <FilaPropietario
                    key={owner.id}
                    owner={owner}
                    onEdit={(person) => setModal({ mode: "edit", person })}
                    onDelete={setPendingDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
          {!visibleOwners.length && (
            <p className="propietarios__empty">No encontramos propietarios con ese criterio.</p>
          )}
          <Paginacion page={page} totalPages={totalPages} total={visibleOwners.length} onPageChange={setPage} />
        </section>
      </div>

      {notice && (
        <p className="propietarios__notice" role="status">
          {notice} {activationUrl && <><a href={activationUrl}>Abrir enlace de activación</a> <button type="button" onClick={() => navigator.clipboard.writeText(activationUrl)}>Copiar enlace</button></>}
        </p>
      )}
      {error && <p className="propietarios__notice" role="alert">{error}</p>}

      {modal && (
        <PersonaModal
          kind="owner"
          mode={modal.mode}
          person={modal.person}
          onClose={() => setModal(null)}
          onSubmit={saveOwner}
        />
      )}
      <ConfirmarEliminacionModal
        isOpen={Boolean(pendingDelete)}
        title="¿Seguro que desea eliminar este propietario?"
        onClose={() => setPendingDelete(null)}
        onConfirm={deleteOwner}
      />
    </main>
  );
}
