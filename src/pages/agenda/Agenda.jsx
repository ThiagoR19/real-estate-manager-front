import { useEffect, useState } from "react";
import { calendarIcon, plusIcon, userIcon } from "../../assets/icons";
import { Boton, Paginacion, usePaginacion, mostrarAviso } from "../../components";
import VisitaModal from "./VisitaModal";
import { api } from "../../services/api.js";
import PageSkeleton from "../../components/skeleton/PageSkeleton";
import { obtenerSesion } from "../../services/login.js";
import propertyImage from "/images (1).jpg";
import "./Agenda.css";

const viewOptions = [
  { id: "day", label: "Día" },
  { id: "week", label: "Semana" },
  { id: "month", label: "Mes" },
];
const timeSlots = ["08:00", "11:00", "14:00", "17:00", "20:00"];
function toVisit(row) {
  const at = new Date(row.fecha);
  return {
    id: row.id, date: dateKey(at),
    time: at.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }),
    property: row.propiedad, client: `${row.clienteNombre} ${row.clienteApellido}`,
    agent: `${row.agenteNombre} ${row.agenteApellido}`, status: row.estado,
    idCliente: row.idCliente, idPropiedad: row.idPropiedad, idAgente: row.idAgente,
  };
}

function parseDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function statusTone(status) {
  if (status === "Programada") return "green";
  if (status === "Cancelada") return "red";
  if (status === "Realizada") return "slate";
  return "blue";
}

function moveDate(value, amount, unit = "day") {
  const next = parseDate(value);
  if (unit === "month") {
    const day = next.getDate();
    next.setDate(1);
    next.setMonth(next.getMonth() + amount);
    next.setDate(Math.min(day, new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()));
  }
  else next.setDate(next.getDate() + amount);
  return dateKey(next);
}

function ControlesPeriodo({ date, view, onDateChange }) {
  const step = view === "week" ? 7 : 1;
  const unit = view === "month" ? "month" : "day";
  const label = view === "month" ? "Mes" : view === "week" ? "Semana" : "Día";
  return (
    <div className="agenda__period-controls">
      <button
        type="button"
        aria-label={`${label} anterior`}
        onClick={() => onDateChange(moveDate(date, -step, unit))}
      >
        ‹
      </button>
      <button
        type="button"
        className="agenda__today-button"
        onClick={() => onDateChange(dateKey(new Date()))}
      >
        Hoy
      </button>
      <button
        type="button"
        aria-label={`${label} siguiente`}
        onClick={() => onDateChange(moveDate(date, step, unit))}
      >
        ›
      </button>
      <input
        type="date"
        aria-label="Ir a una fecha"
        value={date}
        onChange={(event) => onDateChange(event.target.value)}
      />
    </div>
  );
}

function TarjetaVisita({ visit, onEdit }) {
  return (
    <button
      className={`agenda__visit-card is-${statusTone(visit.status)}`}
      type="button"
      onClick={() => onEdit(visit)}
      aria-label={`Editar visita a ${visit.property} con ${visit.client || "cliente sin asignar"}, ${visit.date}, ${visit.time || "sin horario"}`}
    >
      <img className="agenda__visit-image" src={propertyImage} alt="" />
      <span className="agenda__visit-copy">
        <span className="agenda__visit-time">{visit.time || "Sin horario"}</span>
        <strong>{visit.property}</strong>
        <span className="agenda__visit-client">{visit.client || "Cliente sin asignar"}</span>
      </span>
      <span className={`agenda__visit-status is-${statusTone(visit.status)}`}>
        {visit.status}
      </span>
    </button>
  );
}

function EncabezadoAgenda({ view, onViewChange, onCreate, onUpcomingOpen, canManage }) {
  return (
    <div className={`agenda__topbar${canManage ? " has-new-visit" : ""}`}>
      <header className="agenda__hero">
        <h1>Agenda</h1>
        <p>Organizá tus visitas y seguí cada encuentro con tus clientes.</p>
      </header>
      {canManage && <Boton className="agenda__new-visit" icon={plusIcon} text="Nueva visita" onClick={onCreate} />}
      <div className="agenda__view-toggle" role="group" aria-label="Tipo de vista">
        {viewOptions.map(({ id, label }) => (
          <Boton
            key={id}
            className={view === id ? "is-active" : ""}
            type="button"
            aria-pressed={view === id}
            onClick={() => onViewChange(id)}
          >
            {label}
          </Boton>
        ))}
      </div>
      <button className="agenda__upcoming-trigger" type="button" onClick={onUpcomingOpen}>
        <img src={calendarIcon} alt="" /> Próximas visitas
      </button>
    </div>
  );
}

function ProximasVisitas({ visits, onEdit, open, onClose }) {
  const [showAll, setShowAll] = useState(false);
  const { page, totalPages, pageItems, setPage, resetPage } = usePaginacion(visits);
  return (
    <aside
      className={`agenda__sidebar${open ? " is-open" : ""}`}
      id="upcoming-visits"
      aria-labelledby="upcoming-visits-title"
      role={open ? "dialog" : undefined}
      aria-modal={open ? "true" : undefined}
    >
      <div className="agenda__sidebar-heading">
        <div>
          <img src={calendarIcon} alt="" />
          <h2 id="upcoming-visits-title">Próximas visitas</h2>
        </div>
        <button
          className="agenda__sidebar-close"
          type="button"
          onClick={onClose}
          aria-label="Cerrar próximas visitas"
        >
          ×
        </button>
      </div>
      <p className="agenda__sidebar-caption">Tus encuentros desde hoy</p>
      <div className="agenda__upcoming-list">
        {(showAll ? pageItems : visits.slice(0, 5)).map((visit) => (
          <button
            className="agenda__upcoming-item"
            type="button"
            key={visit.id}
            onClick={() => onEdit(visit)}
            aria-label={`Editar visita a ${visit.property} del ${visit.date}`}
          >
            <img src={propertyImage} alt="" />
            <span className="agenda__upcoming-copy">
              <strong>{visit.property}</strong>
              <span>
                {capitalize(
                  parseDate(visit.date).toLocaleDateString("es-AR", {
                    day: "numeric",
                    month: "short",
                  }),
                )}{" "}
                · {visit.time?.split(" - ")[0] || "Sin horario"}
              </span>
              <small>
                <img src={userIcon} alt="" />
                {visit.client || visit.agent}
              </small>
            </span>
            <span
              className={`agenda__upcoming-dot is-${statusTone(visit.status)}`}
              aria-label={visit.status}
            />
          </button>
        ))}
        {!visits.length && (
          <p className="agenda__empty-upcoming">
            No hay próximas visitas. Agendá una nueva para verla acá.
          </p>
        )}
      </div>
      {showAll && <Paginacion page={page} totalPages={totalPages} total={visits.length} onPageChange={setPage} />}
      {visits.length > 5 && (
        <button
          className="agenda__show-all"
          type="button"
          onClick={() => { setShowAll((value) => !value); resetPage(); }}
        >
          {showAll ? "Ver menos" : `Ver todas (${visits.length})`}
        </button>
      )}
    </aside>
  );
}

function VistaDia({ visits, date, onEdit, onDateChange }) {
  const visitsForDay = visits.filter((visit) => visit.date === date);
  return (
    <section className="agenda__panel agenda__day" aria-labelledby="day-title">
      <div className="agenda__panel-heading">
        <div>
          <p className="agenda__eyebrow">Vista diaria</p>
          <h2 id="day-title">
            {capitalize(
              parseDate(date).toLocaleDateString("es-AR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              }),
            )}
          </h2>
          <span className="agenda__total">
            {visitsForDay.length} {visitsForDay.length === 1 ? "visita" : "visitas"}
          </span>
        </div>
        <ControlesPeriodo date={date} view="day" onDateChange={onDateChange} />
      </div>
      <div className="agenda__day-list">
        {timeSlots.map((time, index) => {
          const events = visitsForDay.filter((visit) => {
            const hour = Number.parseInt(visit.time || "8", 10);
            return (
              (index === 0 || hour >= Number.parseInt(time, 10)) &&
              (index === timeSlots.length - 1 || hour < Number.parseInt(timeSlots[index + 1], 10))
            );
          });
          return (
            <div className="agenda__day-row" key={time}>
              <div className="agenda__time-pill">
                <strong>{time}</strong>
                <small>hs</small>
              </div>
              <div className="agenda__day-events">
                {events.length ? (
                  events.map((visit) => <TarjetaVisita key={visit.id} visit={visit} onEdit={onEdit} />)
                ) : (
                  <p>Sin visitas en este horario</p>
                )}
              </div>
              <strong className="agenda__count">{events.length}</strong>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function VistaSemana({ visits, date, onEdit, onDateChange, onDaySelect }) {
  const start = parseDate(date);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  const days = Array.from(
    { length: 7 },
    (_, index) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + index),
  );
  const end = days[6];
  const sameMonth =
    start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  const range = sameMonth
    ? `${start.getDate()} al ${end.toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}`
    : `${start.toLocaleDateString("es-AR", { day: "numeric", month: "short" })} al ${end.toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })}`;
  const weekCount = visits.filter(
    (visit) => visit.date >= dateKey(start) && visit.date <= dateKey(end),
  ).length;
  return (
    <section className="agenda__panel agenda__week" aria-labelledby="week-title">
      <div className="agenda__panel-heading">
        <div>
          <p className="agenda__eyebrow">Vista semanal</p>
          <h2 id="week-title">Semana del {range}</h2>
          <span className="agenda__total">
            {weekCount} {weekCount === 1 ? "visita" : "visitas"}
          </span>
        </div>
        <ControlesPeriodo date={date} view="week" onDateChange={onDateChange} />
      </div>
      <div className="agenda__week-list">
        {days.map((day) => {
          const events = visits.filter((visit) => visit.date === dateKey(day));
          return (
            <div className="agenda__week-row" key={dateKey(day)}>
              <button
                className={`agenda__date-pill${dateKey(day) === dateKey(new Date()) ? " is-today" : ""}`}
                type="button"
                onClick={() => onDaySelect(dateKey(day))}
                aria-label={`Ver agenda del ${day.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}`}
              >
                <small>{day.toLocaleDateString("es-AR", { weekday: "short" }).toUpperCase()}</small>
                <strong>{day.getDate()}</strong>
                <small>{capitalize(day.toLocaleDateString("es-AR", { month: "short" }))}</small>
              </button>
              <div className="agenda__week-events">
                {events.length ? (
                  events.map((visit) => <TarjetaVisita key={visit.id} visit={visit} onEdit={onEdit} />)
                ) : (
                  <p>No hay visitas programadas</p>
                )}
              </div>
              <strong className="agenda__count">{events.length}</strong>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function VistaMes({ visits, date, onEdit, onDateChange }) {
  const activeDate = parseDate(date);
  const first = new Date(activeDate.getFullYear(), activeDate.getMonth(), 1);
  const leading = (first.getDay() + 6) % 7;
  const totalDays = new Date(activeDate.getFullYear(), activeDate.getMonth() + 1, 0).getDate();
  const days = Array.from(
    { length: Math.ceil((leading + totalDays) / 7) * 7 },
    (_, index) => new Date(first.getFullYear(), first.getMonth(), 1 - leading + index),
  );

  const monthCount = visits.filter((visit) => visit.date.slice(0, 7) === date.slice(0, 7)).length;
  const selectedVisits = visits.filter((visit) => visit.date === date);
  return (
    <section className="agenda__panel agenda__month" aria-labelledby="month-title">
      <div className="agenda__panel-heading">
        <div>
          <p className="agenda__eyebrow">Vista mensual</p>
          <h2 id="month-title">
            {capitalize(activeDate.toLocaleDateString("es-AR", { month: "long", year: "numeric" }))}
          </h2>
          <span className="agenda__total">
            {monthCount} {monthCount === 1 ? "visita" : "visitas"}
          </span>
        </div>
        <ControlesPeriodo date={date} view="month" onDateChange={onDateChange} />
      </div>
      <div
        className="agenda__calendar"
        role="grid"
        aria-label={`Calendario de ${activeDate.toLocaleDateString("es-AR", { month: "long", year: "numeric" })}`}
      >
        {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"].map((day) => (
          <strong className="agenda__weekday" key={day}>
            <span>{day}</span>
            <abbr title={day}>{day.slice(0, 3).toUpperCase()}</abbr>
          </strong>
        ))}
        {days.map((day) => {
          const key = dateKey(day);
          const events = visits.filter((visit) => visit.date === key);
          return (
            <div
              className={`agenda__month-cell${day.getMonth() !== activeDate.getMonth() ? " is-outside" : ""}${key === date ? " is-selected" : ""}${key === dateKey(new Date()) ? " is-today" : ""}`}
              key={key}
              role="gridcell"
              aria-selected={key === date}
            >
              <button
                className="agenda__month-number"
                type="button"
                onClick={() => onDateChange(key)}
                aria-label={`Ver visitas del ${day.toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}`}
              >
                {day.getDate()}
              </button>
              <div className="agenda__month-events">
                {events.slice(0, 2).map((visit) => (
                  <button
                    className={`agenda__month-event is-${statusTone(visit.status)}`}
                    type="button"
                    key={visit.id}
                    onClick={() => onEdit(visit)}
                    aria-label={`Editar visita a ${visit.property} del ${key}`}
                  >
                    <span>
                      {visit.time?.split(" - ")[0] || "Sin horario"} {visit.property}
                    </span>
                  </button>
                ))}
                {events.length > 2 && (
                  <button
                    className="agenda__more-events"
                    type="button"
                    onClick={() => onDateChange(key)}
                  >
                    +{events.length - 2} más
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="agenda__selected-day">
        <div className="agenda__selected-day-heading">
          <h3>
            {capitalize(
              activeDate.toLocaleDateString("es-AR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              }),
            )}
          </h3>
          <span>
            {selectedVisits.length} {selectedVisits.length === 1 ? "visita" : "visitas"}
          </span>
        </div>
        {selectedVisits.length ? (
          <div className="agenda__selected-day-cards">
            {selectedVisits.map((visit) => (
              <TarjetaVisita key={visit.id} visit={visit} onEdit={onEdit} />
            ))}
          </div>
        ) : (
          <p>No hay visitas programadas para este día.</p>
        )}
      </div>
    </section>
  );
}

export default function Agenda() {
  const [view, setView] = useState("day");
  const [date, setDate] = useState(() => dateKey(new Date()));
  const [visits, setVisits] = useState([]);
  const [properties, setProperties] = useState([]);
  const [clients, setClients] = useState([]);
  const [agents, setAgents] = useState([]);
  const [modal, setModal] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [upcomingOpen, setUpcomingOpen] = useState(false);
  const canManage = Number(obtenerSesion()?.usuario?.rol) === 3;

  useEffect(() => {
    let active = true;
    const requests = canManage
      ? Promise.all([api.todasLasVisitas(), api.propiedades(), api.catalogosPropiedades(), api.clientesVisitas()])
      : Promise.all([api.todasLasVisitas()]);

    requests
      .then(([visitRows, propertyRows = [], catalogs = { agentes: [] }, clientRows = []]) => {
        if (!active) return;
        setVisits(visitRows.map(toVisit));
        setProperties(propertyRows);
        setAgents(catalogs.agentes);
        setClients(clientRows);
      })
      .catch((cause) => {
        if (!active) return;
        setError(cause.message);
        mostrarAviso({ tipo: "error", titulo: "No se pudo cargar la agenda", mensaje: cause.message });
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [canManage]);

  useEffect(() => {
    if (!upcomingOpen) return undefined;
    function closeOnEscape(event) {
      if (event.key === "Escape") setUpcomingOpen(false);
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [upcomingOpen]);

  function editVisit(visit) {
    if (!canManage) return;
    setUpcomingOpen(false);
    setModal({ visit });
  }

  async function saveVisit(values) {
    const editing = modal.visit;
    const { status, motivo, clientName, clientSurname, clientInterest, ...body } = values;
    if (!body.idCliente && status !== "Cancelada") {
      const client = await api.crearClienteVisita({ nombre: clientName, apellido: clientSurname, interes: clientInterest });
      body.idCliente = client.id;
      setClients((current) => [...current, client]);
    }
    let saved;
    if (editing && status === "Cancelada") {
      saved = await api.cancelarVisita(editing.id, motivo);
    } else if (editing) {
      saved = await api.actualizarVisita(editing.id, { ...body, estado: status });
    } else {
      saved = await api.crearVisita(body);
    }
    const normalized = toVisit(saved);
    setVisits((current) => editing ? current.map((visit) => visit.id === editing.id ? normalized : visit) : [...current, normalized]);
    setDate(normalized.date);
    setView("day");
    const titulo = editing
      ? status === "Cancelada" ? "Visita cancelada" : "Visita modificada"
      : "Visita agendada";
    mostrarAviso({
      tipo: "exito",
      titulo,
      mensaje: titulo === "Visita cancelada"
        ? "La visita se canceló correctamente."
        : editing ? "Los cambios de la visita se guardaron." : "La visita se agregó a la agenda.",
    });
    setModal(null);
    setError("");
  }

  const upcomingVisits = visits
    .filter((visit) => visit.date >= dateKey(new Date()) && visit.status !== "Cancelada")
    .sort(
      (first, second) =>
        first.date.localeCompare(second.date) ||
        (first.time || "").localeCompare(second.time || ""),
    );

  if (loading) return <PageSkeleton variant="agenda" />;

  return (
    <main id="agenda">
      <div className={`agenda__content${loading || error ? " has-message" : ""}`}>
        <EncabezadoAgenda
          canManage={canManage}
          view={view}
          onViewChange={setView}
          onCreate={() => { if (canManage) setModal({ visit: null }); }}
          onUpcomingOpen={() => setUpcomingOpen(true)}
        />
        {(loading || error) && (
          <div className="agenda__messages">
            {loading && <p className="agenda__message" role="status">Cargando visitas…</p>}
            {error && <p className="agenda__message" role="alert">{error}</p>}
          </div>
        )}
        {view === "day" && (
          <VistaDia visits={visits} date={date} onEdit={editVisit} onDateChange={setDate} />
        )}
        {view === "week" && (
          <VistaSemana
            visits={visits}
            date={date}
            onEdit={editVisit}
            onDateChange={setDate}
            onDaySelect={(value) => {
              setDate(value);
              setView("day");
            }}
          />
        )}
        {view === "month" && (
          <VistaMes visits={visits} date={date} onEdit={editVisit} onDateChange={setDate} />
        )}
        <ProximasVisitas
          visits={upcomingVisits}
          onEdit={editVisit}
          open={upcomingOpen}
          onClose={() => setUpcomingOpen(false)}
        />
        {upcomingOpen && (
          <button
            className="agenda__sidebar-backdrop"
            type="button"
            aria-label="Cerrar próximas visitas"
            onClick={() => setUpcomingOpen(false)}
          />
        )}
      </div>
      {modal && (
        <VisitaModal
          visit={modal.visit}
          defaultDate={date}
          properties={properties}
          clients={clients}
          agents={agents}
          onClose={() => setModal(null)}
          onSubmit={saveVisit}
        />
      )}
    </main>
  );
}
