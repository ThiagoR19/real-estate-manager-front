import "./Notification.css";

const nombresTipo = {
  vencimiento: "Vencimiento",
  visita: "Visita",
  reporte: "Reporte",
};

export default function Notification({ notificacion, expandida, destacada = false, onAlternar }) {
  const { id, tipo, hace, titulo, resumen, detalle = [], leida } = notificacion;
  const idDetalle = `notificacion-detalle-${id}`;

  return (
    <article
      className={`Notification ${leida ? "Notification--leida" : ""} ${expandida ? "Notification--expandida" : ""} ${destacada ? "Notification--destacada" : ""}`}
    >
      <p className="Notification__meta">
        <span className={`Notification__punto Notification__punto--${tipo}`}></span>
        <span className="Notification__tipo">{nombresTipo[tipo]}</span>
        <span className="Notification__tiempo">{hace}</span>
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
