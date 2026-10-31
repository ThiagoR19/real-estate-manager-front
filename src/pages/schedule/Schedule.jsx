import { useState } from "react";
import {
  angleDownIcon as angleIcon,
  calendarIcon,
  plusIcon,
  userIcon,
} from "../../assets/icons";
import Button from "../../components/button/Button";
import VisitModal from "../../components/visit/VisitModal";
import propertyImage from "/images (1).jpg";
import "./Schedule.css";

const viewOptions = [
  { id: "day", label: "Día" },
  { id: "week", label: "Semana" },
  { id: "month", label: "Mes" },
];
const timeSlots = ["08:00", "11:00", "14:00", "17:00", "20:00"];
const initialVisits = [
  { date: "2026-05-06", time: "08:30 - 10:00" },
  { date: "2026-05-06", time: "11:00 - 12:00" },
  { date: "2026-05-06", time: "15:30 - 16:00" },
  { date: "2026-05-07", time: "10:00 - 11:00" },
  { date: "2026-05-07", time: "11:00 - 12:00" },
  { date: "2026-05-08", time: "10:00 - 11:00" },
  { date: "2026-05-09", time: "16:00 - 18:30" },
  { date: "2026-05-11", time: "10:00 - 11:00" },
  { date: "2026-05-14", time: "11:30 - 12:30" },
  { date: "2026-05-16", time: "11:30 - 12:30" },
  { date: "2026-05-25", time: "11:30 - 12:30" },
  { date: "2026-05-28", time: "11:30 - 12:30" },
  { date: "2026-05-30", time: "11:30 - 12:30" },
].map((visit, index) => ({
  ...visit,
  id: index + 1,
  property: "Casa de San Isidro",
  agent: "Matías F.",
  client: "Laura Gomez",
  status: "Confirmada",
}));

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

function VisitCard({ visit, onEdit }) {
  return (
    <button
      className="schedule__visit-card"
      type="button"
      onClick={() => onEdit(visit)}
      aria-label={`Editar visita a ${visit.property}, ${visit.date}, ${visit.time || "sin horario"}`}
    >
      <span className="schedule__visit-marker" aria-hidden="true" />
      <span className="schedule__visit-copy">
        <strong>{visit.time || "Sin horario"}</strong>
        <span>{visit.property}</span>
      </span>
      <span className="schedule__visit-status">{visit.status}</span>
      <img className="schedule__visit-image" src={propertyImage} alt="" />
    </button>
  );
}

function ScheduleHeader({ view, onViewChange, onCreate }) {
  return (
    <div className="schedule__topbar">
      <header className="schedule__hero">
        <h1>Agenda</h1>
        <p>Organiza tus visitas, gestiona tu tiempo y haz seguimiento de tus clientes</p>
      </header>
      <Button
        className="schedule__new-visit"
        icon={plusIcon}
        text="Nueva visita"
        onClick={onCreate}
      />
      <div className="schedule__view-toggle" role="tablist" aria-label="Tipo de vista">
        {viewOptions.map(({ id, label }) => (
          <Button
            key={id}
            className={view === id ? "is-active" : ""}
            type="button"
            role="tab"
            aria-selected={view === id}
            onClick={() => onViewChange(id)}
          >
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
}

function UpcomingVisits({ visits, onEdit, onViewAll }) {
  return (
    <aside className="schedule__sidebar" aria-labelledby="upcoming-visits-title">
      <div className="schedule__sidebar-heading">
        <div>
          <img src={calendarIcon} alt="" />
          <h2 id="upcoming-visits-title">Próximas visitas</h2>
        </div>
        <button type="button" onClick={onViewAll}>Ver todas</button>
      </div>
      <div className="schedule__upcoming-list">
        {visits.slice(0, 5).map((visit) => (
          <button
            className="schedule__upcoming-item"
            type="button"
            key={visit.id}
            onClick={() => onEdit(visit)}
            aria-label={`Editar visita a ${visit.property} del ${visit.date}`}
          >
            <img src={propertyImage} alt="" />
            <span className="schedule__upcoming-copy">
              <strong>{visit.property}</strong>
              <span><img src={userIcon} alt="" />{visit.client || visit.agent}</span>
              <small>{parseDate(visit.date).toLocaleDateString("es-AR")}</small>
            </span>
          </button>
        ))}
      </div>
    </aside>
  );
}

function DayView({ visits, date, onEdit }) {
  const visitsForDay = visits.filter((visit) => visit.date === date);
  return (
    <section className="schedule__panel schedule__day" aria-labelledby="day-title">
      <h2 id="day-title">
        {capitalize(parseDate(date).toLocaleDateString("es-AR", {
          weekday: "long", day: "numeric", month: "long",
        }))}
      </h2>
      <div className="schedule__day-head" aria-hidden="true">
        <span />
        <span />
        <strong>Cantidad<br />de<br />visitas</strong>
      </div>
      <div className="schedule__day-list">
        {timeSlots.map((time, index) => {
          const events = visitsForDay.filter((visit) => {
            const hour = Number.parseInt(visit.time || "8", 10);
            return (index === 0 || hour >= Number.parseInt(time, 10))
              && (index === timeSlots.length - 1 || hour < Number.parseInt(timeSlots[index + 1], 10));
          });
          return (
            <div className="schedule__day-row" key={time}>
              <div className="schedule__time-pill">
                <strong>{time}</strong>
                <small>hs</small>
              </div>
              <div className="schedule__day-events">
                {events.length ? events.map((visit) => (
                  <VisitCard key={visit.id} visit={visit} onEdit={onEdit} />
                )) : <p>No hay visitas programadas en este horario</p>}
              </div>
              <strong className="schedule__count">{events.length}</strong>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function WeekView({ visits, date, onEdit }) {
  const start = parseDate(date);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  const days = Array.from({ length: 7 }, (_, index) => (
    new Date(start.getFullYear(), start.getMonth(), start.getDate() + index)
  ));
  return (
    <section className="schedule__panel schedule__week" aria-labelledby="week-title">
      <h2 id="week-title">
        Semana del {start.toLocaleDateString("es-AR")} al {days.at(-1).toLocaleDateString("es-AR")}
      </h2>
      <div className="schedule__week-head" aria-hidden="true">
        <span />
        <span />
        <strong>Cantidad<br />de<br />visitas</strong>
      </div>
      <div className="schedule__week-list">
        {days.map((day) => {
          const events = visits.filter((visit) => visit.date === dateKey(day));
          return (
            <div className="schedule__week-row" key={dateKey(day)}>
              <div className={`schedule__date-pill${dateKey(day) === date ? " is-today" : ""}`}>
                <small>{day.toLocaleDateString("es-AR", { weekday: "short" }).toUpperCase()}</small>
                <strong>{day.getDate()}</strong>
                <small>{capitalize(day.toLocaleDateString("es-AR", { month: "short" }))}</small>
              </div>
              <div className="schedule__week-events">
                {events.length ? events.map((visit) => (
                  <VisitCard key={visit.id} visit={visit} onEdit={onEdit} />
                )) : <p>No hay visitas programadas este día</p>}
              </div>
              <strong className="schedule__count">{events.length}</strong>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function MonthView({ visits, date, onEdit, onDateChange }) {
  const activeDate = parseDate(date);
  const first = new Date(activeDate.getFullYear(), activeDate.getMonth(), 1);
  const leading = (first.getDay() + 6) % 7;
  const totalDays = new Date(activeDate.getFullYear(), activeDate.getMonth() + 1, 0).getDate();
  const days = Array.from({ length: Math.ceil((leading + totalDays) / 7) * 7 }, (_, index) => (
    new Date(first.getFullYear(), first.getMonth(), 1 - leading + index)
  ));

  function changeMonth(offset) {
    onDateChange(dateKey(new Date(activeDate.getFullYear(), activeDate.getMonth() + offset, 1)));
  }

  return (
    <section className="schedule__panel schedule__month" aria-labelledby="month-title">
      <div className="schedule__month-heading">
        <h2 id="month-title">
          {capitalize(activeDate.toLocaleDateString("es-AR", { month: "long", year: "numeric" }))}
        </h2>
        <div className="schedule__month-controls">
          <button type="button" aria-label="Mes anterior" onClick={() => changeMonth(-1)}>
            <img src={angleIcon} alt="" />
          </button>
          <button type="button" aria-label="Mes siguiente" onClick={() => changeMonth(1)}>
            <img src={angleIcon} alt="" />
          </button>
          <button type="button" onClick={() => onDateChange(dateKey(new Date()))}>Hoy</button>
        </div>
      </div>
      <div
        className="schedule__calendar"
        role="grid"
        aria-label={`Calendario de ${activeDate.toLocaleDateString("es-AR", { month: "long", year: "numeric" })}`}
      >
        {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"].map((day) => (
          <strong className="schedule__weekday" key={day}>{day}</strong>
        ))}
        {days.map((day) => {
          const key = dateKey(day);
          const events = visits.filter((visit) => visit.date === key);
          return (
            <div
              className={`schedule__month-cell${day.getMonth() !== activeDate.getMonth() ? " is-outside" : ""}${key === date ? " is-today" : ""}`}
              key={key}
              role="gridcell"
            >
              <strong className="schedule__month-number">{day.getDate()}</strong>
              <div className="schedule__month-events">
                {events.map((visit) => (
                  <button
                    className={`schedule__month-event is-${visit.status === "Confirmada" ? "green" : visit.status === "Cancelada" ? "red" : "blue"}`}
                    type="button"
                    key={visit.id}
                    onClick={() => onEdit(visit)}
                    aria-label={`Editar visita a ${visit.property} del ${key}`}
                  >
                    {visit.time?.split(" - ")[0] || "Sin horario"} {visit.property}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function Schedule() {
  const [view, setView] = useState("day");
  const [date, setDate] = useState("2026-05-06");
  const [visits, setVisits] = useState(initialVisits);
  const [modal, setModal] = useState(null);
  const [feedback, setFeedback] = useState("");

  function editVisit(visit) {
    setModal({ visit });
  }

  function saveVisit(values) {
    const editing = modal.visit;
    setVisits((current) => editing
      ? current.map((visit) => visit.id === editing.id ? { ...visit, ...values } : visit)
      : [...current, { ...values, id: Date.now(), time: "", client: "" }]);
    setDate(values.date);
    setFeedback(editing ? "Visita modificada." : "Visita agendada.");
    setModal(null);
    window.setTimeout(() => setFeedback(""), 2800);
  }

  const sortedVisits = [...visits].sort((first, second) => (
    first.date.localeCompare(second.date) || first.time.localeCompare(second.time)
  ));

  return (
    <main id="schedule">
      <div className="schedule__content">
        <ScheduleHeader
          view={view}
          onViewChange={setView}
          onCreate={() => setModal({ visit: null })}
        />
        {view === "day" && <DayView visits={visits} date={date} onEdit={editVisit} />}
        {view === "week" && <WeekView visits={visits} date={date} onEdit={editVisit} />}
        {view === "month" && (
          <MonthView visits={visits} date={date} onEdit={editVisit} onDateChange={setDate} />
        )}
        <UpcomingVisits
          visits={sortedVisits.filter((visit) => visit.date >= date)}
          onEdit={editVisit}
          onViewAll={() => setView("month")}
        />
      </div>
      {feedback && <p className="schedule__feedback" role="status">{feedback}</p>}
      {modal && (
        <VisitModal
          visit={modal.visit}
          defaultDate={date}
          onClose={() => setModal(null)}
          onSubmit={saveVisit}
        />
      )}
    </main>
  );
}
