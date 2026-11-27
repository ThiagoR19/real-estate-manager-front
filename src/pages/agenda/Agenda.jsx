import { useEffect, useState } from "react";
import { calendarIcon, plusIcon, userIcon } from "../../assets/icons";
import { Boton, Paginacion, usePaginacion, mostrarAviso } from "../../components";
import VisitaModal from "./VisitaModal";
import { api } from "../../services/api.js";
import PageSkeleton from "../../components/skeleton/PageSkeleton";
import { ROLES, tieneRol } from "../../utils/roles.js";
import propertyImage from "/images (1).jpg";
import "./Agenda.css";

const opcionesVista = [
  { id: "day", label: "Día" },
  { id: "week", label: "Semana" },
  { id: "month", label: "Mes" },
];
const franjasHorarias = ["08:00", "11:00", "14:00", "17:00", "20:00"];
function prepararVisita(row) {
  const at = new Date(row.fecha);
  return {
    id: row.id, fecha: claveFecha(at),
    hora: at.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }),
    propiedad: row.propiedad, cliente: `${row.clienteNombre} ${row.clienteApellido}`,
    agente: `${row.agenteNombre} ${row.agenteApellido}`, estado: row.estado,
    idCliente: row.idCliente, idPropiedad: row.idPropiedad, idAgente: row.idAgente,
  };
}

function interpretarFecha(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function claveFecha(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function capitalizar(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function tonoEstado(status) {
  if (status === "Programada") return "green";
  if (status === "Cancelada") return "red";
  if (status === "Realizada") return "slate";
  return "blue";
}

function desplazarFecha(value, amount, unit = "day") {
  const next = interpretarFecha(value);
  if (unit === "month") {
    const day = next.getDate();
    next.setDate(1);
    next.setMonth(next.getMonth() + amount);
    next.setDate(Math.min(day, new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()));
  }
  else next.setDate(next.getDate() + amount);
  return claveFecha(next);
}

function ControlesPeriodo({ fecha: date, view, onDateChange }) {
  const step = view === "week" ? 7 : 1;
  const unit = view === "month" ? "month" : "day";
  const label = view === "month" ? "Mes" : view === "week" ? "Semana" : "Día";
  return (
    <div className="agenda__period-controls">
      <button
        type="button"
        aria-label={`${label} anterior`}
        onClick={() => onDateChange(desplazarFecha(date, -step, unit))}
      >
        ‹
      </button>
      <button
        type="button"
        className="agenda__today-button"
        onClick={() => onDateChange(claveFecha(new Date()))}
      >
        Hoy
      </button>
      <button
        type="button"
        aria-label={`${label} siguiente`}
        onClick={() => onDateChange(desplazarFecha(date, step, unit))}
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

function TarjetaVisita({ visita, onEdit }) {
  return (
    <button
      className={`agenda__visit-card is-${tonoEstado(visita.estado)}`}
      type="button"
      onClick={() => onEdit(visita)}
      aria-label={`Editar visita a ${visita.propiedad} con ${visita.cliente || "cliente sin asignar"}, ${visita.fecha}, ${visita.hora || "sin horario"}`}
    >
      <img className="agenda__visit-image" src={propertyImage} alt="" />
      <span className="agenda__visit-copy">
        <span className="agenda__visit-time">{visita.hora || "Sin horario"}</span>
        <strong>{visita.propiedad}</strong>
        <span className="agenda__visit-client">{visita.cliente || "Cliente sin asignar"}</span>
      </span>
      <span className={`agenda__visit-status is-${tonoEstado(visita.estado)}`}>
        {visita.estado}
      </span>
    </button>
  );
}

function EncabezadoAgenda({ view, onViewChange, onCreate, onUpcomingOpen, puedeGestionar }) {
  return (
    <div className={`agenda__topbar${puedeGestionar ? " has-new-visit" : ""}`}>
      <header className="agenda__hero">
        <h1>Agenda</h1>
        <p>Organizá tus visitas y seguí cada encuentro con tus clientes.</p>
      </header>
      {puedeGestionar && <Boton className="agenda__new-visit" icon={plusIcon} text="Nueva visita" onClick={onCreate} />}
      <div className="agenda__view-toggle" role="group" aria-label="Tipo de vista">
        {opcionesVista.map(({ id, label }) => (
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

function ProximasVisitas({ visitas, onEdit, open, onClose }) {
  const [showAll, setShowAll] = useState(false);
  const { page, totalPages, pageItems, setPage, resetPage } = usePaginacion(visitas);
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
        {(showAll ? pageItems : visitas.slice(0, 5)).map((visita) => (
          <button
            className="agenda__upcoming-item"
            type="button"
            key={visita.id}
            onClick={() => onEdit(visita)}
            aria-label={`Editar visita a ${visita.propiedad} del ${visita.fecha}`}
          >
            <img src={propertyImage} alt="" />
            <span className="agenda__upcoming-copy">
              <strong>{visita.propiedad}</strong>
              <span>
                {capitalizar(
                  interpretarFecha(visita.fecha).toLocaleDateString("es-AR", {
                    day: "numeric",
                    month: "short",
                  }),
                )}{" "}
                · {visita.hora?.split(" - ")[0] || "Sin horario"}
              </span>
              <small>
                <img src={userIcon} alt="" />
                {visita.cliente || visita.agente}
              </small>
            </span>
            <span
              className={`agenda__upcoming-dot is-${tonoEstado(visita.estado)}`}
              aria-label={visita.estado}
            />
          </button>
        ))}
        {!visitas.length && (
          <p className="agenda__empty-upcoming">
            No hay próximas visitas. Agendá una nueva para verla acá.
          </p>
        )}
      </div>
      {showAll && <Paginacion page={page} totalPages={totalPages} total={visitas.length} onPageChange={setPage} />}
      {visitas.length > 5 && (
        <button
          className="agenda__show-all"
          type="button"
          onClick={() => { setShowAll((value) => !value); resetPage(); }}
        >
          {showAll ? "Ver menos" : `Ver todas (${visitas.length})`}
        </button>
      )}
    </aside>
  );
}

function VistaDia({ visitas, fecha: date, onEdit, onDateChange }) {
  const visitsForDay = visitas.filter((visita) => visita.fecha === date);
  return (
    <section className="agenda__panel agenda__day" aria-labelledby="day-title">
      <div className="agenda__panel-heading">
        <div>
          <p className="agenda__eyebrow">Vista diaria</p>
          <h2 id="day-title">
            {capitalizar(
              interpretarFecha(date).toLocaleDateString("es-AR", {
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
        {franjasHorarias.map((time, index) => {
          const events = visitsForDay.filter((visita) => {
            const hour = Number.parseInt(visita.hora || "8", 10);
            return (
              (index === 0 || hour >= Number.parseInt(time, 10)) &&
              (index === franjasHorarias.length - 1 || hour < Number.parseInt(franjasHorarias[index + 1], 10))
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
                  events.map((visita) => <TarjetaVisita key={visita.id} visita={visita} onEdit={onEdit} />)
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

function VistaSemana({ visitas, fecha: date, onEdit, onDateChange, onDaySelect }) {
  const start = interpretarFecha(date);
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
  const weekCount = visitas.filter(
    (visita) => visita.fecha >= claveFecha(start) && visita.fecha <= claveFecha(end),
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
          const events = visitas.filter((visita) => visita.fecha === claveFecha(day));
          return (
            <div className="agenda__week-row" key={claveFecha(day)}>
              <button
                className={`agenda__date-pill${claveFecha(day) === claveFecha(new Date()) ? " is-today" : ""}`}
                type="button"
                onClick={() => onDaySelect(claveFecha(day))}
                aria-label={`Ver agenda del ${day.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}`}
              >
                <small>{day.toLocaleDateString("es-AR", { weekday: "short" }).toUpperCase()}</small>
                <strong>{day.getDate()}</strong>
                <small>{capitalizar(day.toLocaleDateString("es-AR", { month: "short" }))}</small>
              </button>
              <div className="agenda__week-events">
                {events.length ? (
                  events.map((visita) => <TarjetaVisita key={visita.id} visita={visita} onEdit={onEdit} />)
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

function VistaMes({ visitas, fecha: date, onEdit, onDateChange }) {
  const activeDate = interpretarFecha(date);
  const first = new Date(activeDate.getFullYear(), activeDate.getMonth(), 1);
  const leading = (first.getDay() + 6) % 7;
  const totalDays = new Date(activeDate.getFullYear(), activeDate.getMonth() + 1, 0).getDate();
  const days = Array.from(
    { length: Math.ceil((leading + totalDays) / 7) * 7 },
    (_, index) => new Date(first.getFullYear(), first.getMonth(), 1 - leading + index),
  );

  const monthCount = visitas.filter((visita) => visita.fecha.slice(0, 7) === date.slice(0, 7)).length;
  const selectedVisits = visitas.filter((visita) => visita.fecha === date);
  return (
    <section className="agenda__panel agenda__month" aria-labelledby="month-title">
      <div className="agenda__panel-heading">
        <div>
          <p className="agenda__eyebrow">Vista mensual</p>
          <h2 id="month-title">
            {capitalizar(activeDate.toLocaleDateString("es-AR", { month: "long", year: "numeric" }))}
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
          const key = claveFecha(day);
          const events = visitas.filter((visita) => visita.fecha === key);
          return (
            <div
              className={`agenda__month-cell${day.getMonth() !== activeDate.getMonth() ? " is-outside" : ""}${key === date ? " is-selected" : ""}${key === claveFecha(new Date()) ? " is-today" : ""}`}
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
                {events.slice(0, 2).map((visita) => (
                  <button
                    className={`agenda__month-event is-${tonoEstado(visita.estado)}`}
                    type="button"
                    key={visita.id}
                    onClick={() => onEdit(visita)}
                    aria-label={`Editar visita a ${visita.propiedad} del ${key}`}
                  >
                    <span>
                      {visita.hora?.split(" - ")[0] || "Sin horario"} {visita.propiedad}
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
            {capitalizar(
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
            {selectedVisits.map((visita) => (
              <TarjetaVisita key={visita.id} visita={visita} onEdit={onEdit} />
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
  const [date, setDate] = useState(() => claveFecha(new Date()));
  const [visitas, setVisitas] = useState([]);
  const [propiedades, setPropiedades] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [agentes, setAgentes] = useState([]);
  const [modal, setModal] = useState(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const [proximasAbiertas, setProximasAbiertas] = useState(false);
  const puedeGestionar = tieneRol(ROLES.AGENTE);

  useEffect(() => {
    let active = true;
    const requests = puedeGestionar
      ? Promise.all([api.todasLasVisitas(), api.propiedades(), api.catalogosPropiedades(), api.clientesVisitas()])
      : Promise.all([api.todasLasVisitas()]);

    requests
      .then(([visitasRecibidas, propiedadesRecibidas = [], catalogos = { agentes: [] }, clientesRecibidos = []]) => {
        if (!active) return;
        setVisitas(visitasRecibidas.map(prepararVisita));
        setPropiedades(propiedadesRecibidas);
        setAgentes(catalogos.agentes);
        setClientes(clientesRecibidos);
      })
      .catch((cause) => {
        if (!active) return;
        setError(cause.message);
        mostrarAviso({ tipo: "error", titulo: "No se pudo cargar la agenda", mensaje: cause.message });
      })
      .finally(() => { if (active) setCargando(false); });
    return () => { active = false; };
  }, [puedeGestionar]);

  useEffect(() => {
    if (!proximasAbiertas) return undefined;
    function cerrarConEscape(event) {
      if (event.key === "Escape") setProximasAbiertas(false);
    }
    document.addEventListener("keydown", cerrarConEscape);
    return () => document.removeEventListener("keydown", cerrarConEscape);
  }, [proximasAbiertas]);

  function editarVisita(visita) {
    if (!puedeGestionar) return;
    setProximasAbiertas(false);
    setModal({ visita });
  }

  async function guardarVisita(values) {
    const enEdicion = modal.visita;
    const { estado: status, motivo, nombreCliente, apellidoCliente, interesCliente, ...body } = values;
    if (!body.idCliente && status !== "Cancelada") {
      const cliente = await api.crearClienteVisita({ nombre: nombreCliente, apellido: apellidoCliente, interes: interesCliente });
      body.idCliente = cliente.id;
      setClientes((current) => [...current, cliente]);
    }
    let saved;
    if (enEdicion && status === "Cancelada") {
      saved = await api.cancelarVisita(enEdicion.id, motivo);
    } else if (enEdicion) {
      saved = await api.actualizarVisita(enEdicion.id, { ...body, estado: status });
    } else {
      saved = await api.crearVisita(body);
    }
    const normalized = prepararVisita(saved);
    setVisitas((current) => enEdicion ? current.map((visita) => visita.id === enEdicion.id ? normalized : visita) : [...current, normalized]);
    setDate(normalized.fecha);
    setView("day");
    const titulo = enEdicion
      ? status === "Cancelada" ? "Visita cancelada" : "Visita modificada"
      : "Visita agendada";
    mostrarAviso({
      tipo: "exito",
      titulo,
      mensaje: titulo === "Visita cancelada"
        ? "La visita se canceló correctamente."
        : enEdicion ? "Los cambios de la visita se guardaron." : "La visita se agregó a la agenda.",
    });
    setModal(null);
    setError("");
  }

  const proximasVisitas = visitas
    .filter((visita) => visita.fecha >= claveFecha(new Date()) && visita.estado !== "Cancelada")
    .sort(
      (first, second) =>
        first.fecha.localeCompare(second.fecha) ||
        (first.hora || "").localeCompare(second.hora || ""),
    );

  if (cargando) return <PageSkeleton variant="agenda" />;

  return (
    <main id="agenda">
      <div className={`agenda__content${error ? " has-message" : ""}`}>
        <EncabezadoAgenda
          puedeGestionar={puedeGestionar}
          view={view}
          onViewChange={setView}
          onCreate={() => { if (puedeGestionar) setModal({ visita: null }); }}
          onUpcomingOpen={() => setProximasAbiertas(true)}
        />
        {error && (
          <div className="agenda__messages">
            <p className="agenda__message" role="alert">{error}</p>
          </div>
        )}
        {view === "day" && (
          <VistaDia visitas={visitas} date={date} onEdit={editarVisita} onDateChange={setDate} />
        )}
        {view === "week" && (
          <VistaSemana
            visitas={visitas}
            date={date}
            onEdit={editarVisita}
            onDateChange={setDate}
            onDaySelect={(value) => {
              setDate(value);
              setView("day");
            }}
          />
        )}
        {view === "month" && (
          <VistaMes visitas={visitas} date={date} onEdit={editarVisita} onDateChange={setDate} />
        )}
        <ProximasVisitas
          visitas={proximasVisitas}
          onEdit={editarVisita}
          open={proximasAbiertas}
          onClose={() => setProximasAbiertas(false)}
        />
        {proximasAbiertas && (
          <button
            className="agenda__sidebar-backdrop"
            type="button"
            aria-label="Cerrar próximas visitas"
            onClick={() => setProximasAbiertas(false)}
          />
        )}
      </div>
      {modal && (
        <VisitaModal
          visita={modal.visita}
          fechaInicial={date}
          propiedades={propiedades}
          clientes={clientes}
          agentes={agentes}
          onClose={() => setModal(null)}
          onSubmit={guardarVisita}
        />
      )}
    </main>
  );
}
