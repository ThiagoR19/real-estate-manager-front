import "./Notification.css";

const tiposConColor = new Set(["contrato", "mantenimiento", "mensaje", "pago", "visita"]);

function tiempoTranscurrido(fecha) {
  if (!fecha) return "";
  const valor = new Date(fecha);
  if (Number.isNaN(valor.getTime())) return "";
  const minutos = Math.floor((Date.now() - valor.getTime()) / 60000);
  if (minutos < 1) return "Ahora";
  if (minutos < 60) return `Hace ${minutos} min`;
  if (minutos < 1440) return `Hace ${Math.floor(minutos / 60)} h`;
  if (minutos < 2880) return "Ayer";
  if (minutos < 10080) return `Hace ${Math.floor(minutos / 1440)} días`;
  return valor.toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" });
}

export default function Notification({ notificacion, expandida, destacada = false, onAlternar }) {
  const { id, tipo, hace, titulo, detalle = [], leida, fechaCreacion } = notificacion;
  const resumen = notificacion.contenido ?? notificacion.resumen ?? "";
  const nombreTipo = String(tipo || "Notificación").trim();
  const claveTipo = nombreTipo.toLocaleLowerCase("es-AR");
  const colorTipo = tiposConColor.has(claveTipo) ? claveTipo : "otro";
  const tiempo = fechaCreacion ? tiempoTranscurrido(fechaCreacion) : hace;
  const idDetalle = `notificacion-detalle-${id}`;

  return (
    <article
      className={`Notification ${leida ? "Notification--leida" : ""} ${expandida ? "Notification--expandida" : ""} ${destacada ? "Notification--destacada" : ""}`}
    >
      <p className="Notification__meta">
        <span className={`Notification__punto Notification__punto--${colorTipo}`}></span>
        <span className="Notification__tipo">{nombreTipo}</span>
        {tiempo && <span className="Notification__tiempo">{tiempo}</span>}
      </p>

      <h3 className="Notification__titulo">{titulo}</h3>

      <p className="Notification__resumen">{resumen}</p>

      {/* grid 0fr → 1fr: anima la altura sin saber cuánto mide */}
      <div className="Notification__detalle" id={idDetalle}>
        <div className="Notification__detalle-interno">
          {detalle.map((linea) => (
            <p key={linea} className="Notification__linea">
              {linea}
            </p>
          ))}
        </div>
      </div>

      <button
        type="button"
        className="Notification__boton"
        aria-expanded={expandida}
        aria-controls={idDetalle}
        onClick={onAlternar}
      >
        {expandida ? "Contraer" : "Expandir"}
      </button>
    </article>
  );
}
