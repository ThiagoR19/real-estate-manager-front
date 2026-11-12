import { useState } from "react";
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
  Button,
  SummaryPill,
  PersonModal,
  ConfirmDeleteModal,
  EntityActions,
  Pagination,
  usePagination,
} from "../../components";
import "./Owners.css";

const initialOwners = Array.from({ length: 6 }, (_, index) => ({
  id: index + 1,
  initials: "LM",
  name: "Lucía Martínez",
  dni: "41.234.567",
  email: "lucia.m@gmail.com",
  phone: "11 2345- 6789",
  address: "Av. San Martín 1250",
  unit: "Depto. 3B",
  cbu: "0170204660000087865",
  alias: "Marco.Polo.Papita",
  status: "Activo",
}));

const summaryCards = [
  { label: "Cobros pendientes", value: "2", icon: xIcon, tone: "danger" },
  { label: "Liquidaciones por generar", value: "10", icon: clockIcon, tone: "warning" },
  { label: "Propietarios activos", value: "24", icon: peopleIcon, tone: "success" },
  { label: "Cobros acreditados", value: "18", icon: fileIcon, tone: "info" },
];

function OwnerRow({ owner, onEdit, onDelete }) {
  return (
    <tr>
      <td data-label="Propietario">
        <div className="owners__person">
          <span className="owners__avatar">{owner.initials}</span>
          <span className="owners__person-copy">
            <strong>{owner.name}</strong>
            <small>DNI {owner.dni}</small>
          </span>
        </div>
      </td>
      <td data-label="Contacto">
        <div className="owners__contact">
          <span>
            <img src={envelopeIcon} alt="" />
            {owner.email}
          </span>
          <span>
            <img src={phoneIcon} alt="" />
            {owner.phone}
          </span>
        </div>
      </td>
      <td data-label="Propiedad">
        <div className="owners__property">
          <img className="owners__property-image" src={propertyImage} alt="" />
          <span>
            <strong>{owner.property || owner.address}</strong>
            <small>{owner.unit}</small>
          </span>
        </div>
      </td>
      <td data-label="CBU">
        <span className="owners__muted-value">{owner.cbu}</span>
      </td>
      <td data-label="Alias">
        <span className="owners__muted-value">{owner.alias}</span>
      </td>
      <td data-label="Estado">
        <span className="owners__status">{owner.status}</span>
      </td>
      <td data-label="Acciones" className="owners__actions-cell">
        <EntityActions
          entity="propietario"
          name={owner.name}
          onEdit={() => onEdit(owner)}
          onDelete={() => onDelete(owner)}
        />
      </td>
    </tr>
  );
}

export default function Owners() {
  const [owners, setOwners] = useState(initialOwners);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [notice, setNotice] = useState("");

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
      ].some((value) => value.toLowerCase().includes(normalizedQuery)),
  );
  const { page, totalPages, pageItems, setPage, resetPage } = usePagination(visibleOwners);

  function saveOwner(data) {
    if (modal.mode === "edit") {
      setOwners((current) =>
        current.map((owner) => (owner.id === modal.person.id ? { ...owner, ...data } : owner)),
      );
      setNotice("Propietario actualizado correctamente.");
    } else {
      setOwners((current) => [
        ...current,
        { ...data, id: Math.max(0, ...current.map((owner) => owner.id)) + 1, unit: "" },
      ]);
      setNotice("Propietario creado correctamente.");
    }
    setModal(null);
  }

  function deleteOwner() {
    setOwners((current) => current.filter((owner) => owner.id !== pendingDelete.id));
    setPendingDelete(null);
    setNotice("Propietario eliminado correctamente.");
  }

  return (
    <main id="owners">
      <div className="owners__page">
        <section className="owners__overview" aria-labelledby="owners-title">
          <div className="owners__hero">
            <h1 id="owners-title">Propietarios</h1>
            <p>Gestiona la información de todos los propietarios</p>
          </div>

          <div className="owners__summary" aria-label="Resumen de propietarios">
            {summaryCards.map((card) => (
              <SummaryPill key={card.label} {...card} />
            ))}
          </div>
        </section>

        <section className="owners__toolbar" aria-label="Buscar propietarios">
          <label className="owners__search">
            <img src={magnifyingGlassIcon} alt="" />
            <input
              type="search"
              placeholder="Buscar propietario..."
              aria-label="Buscar propietario"
              value={query}
              onChange={(event) => { setQuery(event.target.value); resetPage(); }}
            />
          </label>
          <Button
            className="owners__new-button"
            onClick={() => setModal({ mode: "create", person: null })}
            icon={plusIcon}
            text="Nuevo propietario"
          />
        </section>

        <section className="owners__table-card" aria-label="Listado de propietarios">
          <div className="owners__table-wrap">
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
                  <OwnerRow
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
            <p className="owners__empty">No encontramos propietarios con ese criterio.</p>
          )}
          <Pagination page={page} totalPages={totalPages} total={visibleOwners.length} onPageChange={setPage} />
        </section>
      </div>

      {notice && (
        <p className="owners__notice" role="status">
          {notice}
        </p>
      )}

      {modal && (
        <PersonModal
          kind="owner"
          mode={modal.mode}
          person={modal.person}
          onClose={() => setModal(null)}
          onSubmit={saveOwner}
        />
      )}
      <ConfirmDeleteModal
        isOpen={Boolean(pendingDelete)}
        title="¿Seguro que desea eliminar este propietario?"
        onClose={() => setPendingDelete(null)}
        onConfirm={deleteOwner}
      />
    </main>
  );
}
