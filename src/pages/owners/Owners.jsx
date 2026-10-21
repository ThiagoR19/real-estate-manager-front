import { useState } from "react";
import envelopeIcon from "../../assets/icons/envelope-regular-full.svg";
import fileIcon from "../../assets/icons/file-lines-regular-full.svg";
import clockIcon from "../../assets/icons/clock-regular-full.svg";
import magnifyingGlassIcon from "../../assets/icons/magnifying-glass-solid-full.svg";
import peopleIcon from "../../assets/icons/people.svg";
import phoneIcon from "../../assets/icons/phone-solid-full.svg";
import plusIcon from "../../assets/icons/plus-solid-full.svg";
import xIcon from "../../assets/icons/x-solid-full.svg";
import propertyImage from "/images.jpg";
import "./Owners.css";

const owners = Array.from({ length: 6 }, (_, index) => ({
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

function SummaryIcon({ icon }) {
  return <img src={icon} alt="" />;
}

function OwnerRow({ owner, onMenu }) {
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
          <span><img src={envelopeIcon} alt="" />{owner.email}</span>
          <span><img src={phoneIcon} alt="" />{owner.phone}</span>
        </div>
      </td>
      <td data-label="Propiedad">
        <div className="owners__property">
          <img className="owners__property-image" src={propertyImage} alt="" />
          <span>
            <strong>{owner.address}</strong>
            <small>{owner.unit}</small>
          </span>
        </div>
      </td>
      <td data-label="CBU"><span className="owners__muted-value">{owner.cbu}</span></td>
      <td data-label="Alias"><span className="owners__muted-value">{owner.alias}</span></td>
      <td data-label="Estado"><span className="owners__status">{owner.status}</span></td>
      <td data-label="Acciones" className="owners__actions-cell">
        <button className="owners__actions" type="button" aria-label={`Acciones para ${owner.name}`} onClick={onMenu}>⋮</button>
      </td>
    </tr>
  );
}

export default function Owners() {
  const [query, setQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [notice, setNotice] = useState("");

  const normalizedQuery = query.trim().toLowerCase();
  const visibleOwners = owners.filter((owner) => (
    !normalizedQuery
    || [owner.name, owner.dni, owner.email, owner.address, owner.cbu, owner.alias]
      .some((value) => value.toLowerCase().includes(normalizedQuery))
  ));

  function showRowNotice() {
    setNotice("Las acciones del propietario estarán disponibles próximamente.");
    window.setTimeout(() => setNotice(""), 2800);
  }

  return (
    <main id="owners">
      <div className="owners__page">
        <section className="owners__overview" aria-labelledby="owners-title">
          <div className="owners__hero">
            <h1 id="owners-title">Propietarios</h1>
            <p>Gestiona la información de todos los propietarios y consulta sus cobros.</p>
          </div>

          <div className="owners__summary" aria-label="Resumen de propietarios">
            {summaryCards.map((card) => (
              <article className={`owners__summary-card owners__summary-card--${card.tone}`} key={card.label}>
                <span className="owners__summary-icon"><SummaryIcon icon={card.icon} /></span>
                <strong>{card.label}</strong>
                <b>{card.value}</b>
              </article>
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
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <button className="owners__new-button" type="button" onClick={() => setShowModal(true)}>
            <img src={plusIcon} alt="" />
            Nuevo propietario
          </button>
        </section>

        <section className="owners__table-card" aria-label="Listado de propietarios">
          <div className="owners__table-wrap">
            <table>
              <thead>
                <tr><th>Propietario</th><th>Contacto</th><th>Propiedad</th><th>CBU</th><th>ALIAS</th><th>Estado</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {visibleOwners.map((owner) => <OwnerRow key={owner.id} owner={owner} onMenu={showRowNotice} />)}
              </tbody>
            </table>
          </div>
          {!visibleOwners.length && <p className="owners__empty">No encontramos propietarios con ese criterio.</p>}
        </section>
      </div>

      {notice && <p className="owners__notice" role="status">{notice}</p>}

      {showModal && (
        <div className="owners__modal-backdrop" role="presentation" onClick={() => setShowModal(false)}>
          <section className="owners__modal" role="dialog" aria-modal="true" aria-labelledby="owners-modal-title" onClick={(event) => event.stopPropagation()}>
            <button className="owners__modal-close" type="button" aria-label="Cerrar" onClick={() => setShowModal(false)}>×</button>
            <h2 id="owners-modal-title">Nuevo propietario</h2>
            <p>Completá los datos del nuevo propietario para incorporarlo al listado.</p>
            <div className="owners__modal-fields">
              <label>Nombre completo<input type="text" placeholder="Ej. Lucía Martínez" /></label>
              <label>Correo electrónico<input type="email" placeholder="nombre@email.com" /></label>
            </div>
            <button className="owners__modal-submit" type="button" onClick={() => setShowModal(false)}>Guardar propietario</button>
          </section>
        </div>
      )}
    </main>
  );
}
