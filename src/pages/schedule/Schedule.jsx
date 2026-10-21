import { useState } from "react";
import {
  angleDownIcon as angleIcon,
  calendarIcon,
  plusIcon,
  userIcon,
} from "../../assets/icons";
import propertyImage from "/images (1).jpg";
import "./Schedule.css";

const viewOptions = [
  { id: "day", label: "Día" },
  { id: "week", label: "Semana" },
  { id: "month", label: "Mes" },
];

const upcomingVisits = [
  { property: "Casa de San Isidro", client: "Laura Gomez" },
  { property: "Casa de San Isidro", client: "Laura Gomez" },
  { property: "Casa de San Isidro", client: "Laura Gomez" },
  { property: "Casa de San Isidro", client: "Laura Gomez" },
  { property: "Casa de San Isidro", client: "Laura Gomez" },
];

const dayRows = [
  {
    time: "08:00",
    events: [
      { time: "08:30 - 10:00", property: "Casa de San Isidro", status: "Confirmada" },
      { time: "11:00 - 12:00", property: "Casa de San Isidro", status: "Confirmada" },
    ],
  },
  {
    time: "11:00",
    events: [
      { time: "08:30 - 10:00", property: "Casa de San Isidro", status: "Confirmada" },
      { time: "15:30 - 16:00", property: "Casa de San Isidro", status: "Confirmada" },
    ],
  },
  { time: "14:00", events: [] },
  { time: "17:00", events: [] },
  { time: "20:00", events: [] },
];

const weekRows = [
  {
    date: "6",
    events: [{ time: "10:00 - 11:00", property: "Casa de San Isidro", status: "Confirmada" }],
  },
  {
    date: "7",
    events: [
      { time: "10:00 - 11:00", property: "Casa de San Isidro", status: "Confirmada" },
      { time: "10:00 - 11:00", property: "Casa de San Isidro", status: "Confirmada" },
    ],
  },
  {
    date: "8",
    events: [{ time: "10:00 - 11:00", property: "Casa de San Isidro", status: "Confirmada" }],
  },
  {
    date: "9",
    today: true,
    events: [{ time: "16:00 - 18:30", property: "Casa de San Isidro", status: "Confirmada" }],
  },
  { date: "10", events: [] },
  {
    date: "11",
    events: [{ time: "10:00 - 11:00", property: "Casa de San Isidro", status: "Confirmada" }],
  },
];

const monthDays = [
  { day: "29", outside: true },
  { day: "30", outside: true },
  { day: "1" },
  { day: "2", events: [{ text: "11:30 depto en palermo", tone: "green" }] },
  { day: "3" },
  { day: "4", outside: true },
  { day: "5", outside: true },
  { day: "6", events: [{ text: "11:30 depto en palermo", tone: "blue" }] },
  { day: "7" },
  { day: "8" },
  { day: "9", today: true },
  { day: "10", events: [{ text: "11:30 depto en palermo", tone: "blue" }] },
  { day: "11", outside: true },
  { day: "12", outside: true },
  { day: "13" },
  { day: "14", events: [{ text: "11:30 depto en palermo", tone: "green" }] },
  { day: "15" },
  {
    day: "16",
    events: [
      { text: "11:30 depto en palermo", tone: "green" },
      { text: "Ver mas ...", tone: "dark" },
    ],
  },
  { day: "17" },
  { day: "18", outside: true },
  { day: "19", outside: true },
  { day: "20" },
  { day: "21" },
  { day: "22" },
  { day: "23" },
  {
    day: "25",
    events: [
      { text: "11:30 depto en palermo", tone: "green" },
      { text: "11:30 depto en palermo", tone: "green" },
    ],
  },
  { day: "26", outside: true },
  { day: "27", outside: true },
  {
    day: "28",
    events: [
      { text: "11:30 depto en palermo", tone: "blue" },
      { text: "11:30 depto en palermo", tone: "blue" },
    ],
  },
  { day: "29" },
  { day: "30", events: [{ text: "11:30 depto en palermo", tone: "red" }] },
  { day: "31" },
  { day: "1", outside: true },
  { day: "2", outside: true },
  { day: "3", outside: true },
];

function VisitCard({ visit }) {
  return (
    <article className="schedule__visit-card">
      <span className="schedule__visit-marker" aria-hidden="true" />
      <div className="schedule__visit-copy">
        <strong>{visit.time}</strong>
        <span>{visit.property}</span>
      </div>
      <span className="schedule__visit-status">{visit.status}</span>
      <img className="schedule__visit-image" src={propertyImage} alt="" />
    </article>
  );
}

function ScheduleHeader({ view, onViewChange }) {
  return (
    <div className="schedule__topbar">
      <header className="schedule__hero">
        <h1>Agenda</h1>
        <p>Organiza tus visitas, gestiona tu tiempo y haz seguimiento de tus clientes</p>
      </header>

      <button className="schedule__new-visit" type="button">
        <img src={plusIcon} alt="" />
        <span>Nueva visita</span>
      </button>

      <div className="schedule__view-toggle" role="tablist" aria-label="Tipo de vista">
        {viewOptions.map(({ id, label }) => (
          <button
            key={id}
            className={view === id ? "is-active" : ""}
            type="button"
            role="tab"
            aria-selected={view === id}
            onClick={() => onViewChange(id)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function UpcomingVisits() {
  return (
    <aside className="schedule__sidebar" aria-labelledby="upcoming-visits-title">
      <div className="schedule__sidebar-heading">
        <div>
          <img src={calendarIcon} alt="" />
          <h2 id="upcoming-visits-title">Próximas visitas</h2>
        </div>
        <button type="button">Ver todas</button>
      </div>
      <div className="schedule__upcoming-list">
        {upcomingVisits.map((visit, index) => (
          <article className="schedule__upcoming-item" key={`${visit.property}-${index}`}>
            <img src={propertyImage} alt="" />
            <div>
              <strong>{visit.property}</strong>
              <span><img src={userIcon} alt="" />{visit.client}</span>
            </div>
          </article>
        ))}
      </div>
    </aside>
  );
}

function DayView() {
  return (
    <section className="schedule__panel schedule__day" aria-labelledby="day-title">
      <h2 id="day-title">Lunes 6 de marzo</h2>
      <div className="schedule__day-head" aria-hidden="true">
        <span />
        <span />
        <strong>Cantidad<br />de<br />visitas</strong>
      </div>
      <div className="schedule__day-list">
        {dayRows.map(({ time, events }) => (
          <div className="schedule__day-row" key={time}>
            <div className="schedule__time-pill">
              <strong>{time}</strong>
              <small>hs</small>
            </div>
            <div className="schedule__day-events">
              {events.length ? events.map((event, index) => (
                <VisitCard key={`${event.time}-${index}`} visit={event} />
              )) : <p>No hay visitas programadas este día</p>}
            </div>
            <strong className="schedule__count">{events.length}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function WeekView() {
  return (
    <section className="schedule__panel schedule__week" aria-labelledby="week-title">
      <h2 id="week-title">Semana del 6 al 12 de mayo de 2024</h2>
      <div className="schedule__week-head" aria-hidden="true">
        <span />
        <span />
        <strong>Cantidad<br />de<br />visitas</strong>
      </div>
      <div className="schedule__week-list">
        {weekRows.map(({ date, today, events }) => (
          <div className="schedule__week-row" key={date}>
            <div className={`schedule__date-pill${today ? " is-today" : ""}`}>
              <small>LUN</small>
              <strong>{date}</strong>
              <small>Mayo</small>
            </div>
            <div className="schedule__week-events">
              {events.length ? events.map((event, index) => (
                <VisitCard key={`${event.time}-${index}`} visit={event} />
              )) : <p>No hay visitas programadas este día</p>}
            </div>
            <strong className="schedule__count">{events.length ? 1 : 1}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function MonthView() {
  return (
    <section className="schedule__panel schedule__month" aria-labelledby="month-title">
      <div className="schedule__month-heading">
        <h2 id="month-title">Mayo 2026</h2>
        <div className="schedule__month-controls">
          <button type="button" aria-label="Mes anterior"><img src={angleIcon} alt="" /></button>
          <button type="button" aria-label="Mes siguiente"><img src={angleIcon} alt="" /></button>
          <button type="button">Hoy</button>
        </div>
      </div>
      <div className="schedule__calendar" role="grid" aria-label="Calendario de mayo 2026">
        {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((day) => (
          <strong className="schedule__weekday" key={day}>{day}</strong>
        ))}
        {monthDays.map(({ day, outside, today, events }, index) => (
          <div
            className={`schedule__month-cell${outside ? " is-outside" : ""}${today ? " is-today" : ""}`}
            key={`${day}-${index}`}
            role="gridcell"
          >
            <strong className="schedule__month-number">{today ? <span>Hoy </span> : null}{day}</strong>
            <div className="schedule__month-events">
              {events?.map(({ text, tone }, eventIndex) => (
                <span className={`schedule__month-event is-${tone}`} key={`${day}-${text}-${tone}-${eventIndex}`}>
                  {text}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Schedule() {
  const [view, setView] = useState("day");

  return (
    <main id="schedule">
      <div className="schedule__content">
        <ScheduleHeader view={view} onViewChange={setView} />
        {view === "day" && <DayView />}
        {view === "week" && <WeekView />}
        {view === "month" && <MonthView />}
        <UpcomingVisits />
      </div>
    </main>
  );
}

