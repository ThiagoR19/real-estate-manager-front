import { Link } from "wouter";
import "./Notificacion.css";

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

export default function Notificacion({ notificacion, destino, onMarcarLeida, onNavegar }) {
  const { tipo, hace, titulo, detalle = [], leida, fechaCreacion, inmobiliaria } = notificacion;
  const resumen = notificacion.contenido ?? notificacion.resumen ?? "";
  const nombreTipo = String(tipo || "Notificación").trim();
  const claveTipo = nombreTipo.toLocaleLowerCase("es-AR");
  const colorTipo = tiposConColor.has(claveTipo) ? claveTipo : "otro";
  const tiempo = fechaCreacion ? tiempoTranscurrido(fechaCreacion) : hace;

  return (
    <article className={`Notificacion${leida ? " Notificacion--leida" : ""}`}>
      <p className="Notificacion__meta">
        <span className={`Notificacion__punto Notificacion__punto--${colorTipo}`} aria-hidden="true" />
        <span className="Notificacion__tipo">{nombreTipo}</span>
        {tiempo && <span className="Notificacion__tiempo">{tiempo}</span>}
      </p>

      <h3 className="Notificacion__titulo">{titulo}</h3>

      {inmobiliaria && <p className="Notificacion__resumen">{inmobiliaria}</p>}
      <p className="Notificacion__resumen">{resumen}</p>
      {detalle.map((linea) => <p key={linea} className="Notificacion__resumen">{linea}</p>)}

      {(!leida || destino) && (
        <div className="Notificacion__acciones">
          {destino && <Link href={destino[0]} className="Notificacion__boton" onClick={onNavegar}>{destino[1]}</Link>}
          {!leida && (
            <button type="button" className="Notificacion__boton" onClick={onMarcarLeida}>
              Marcar como leída
            </button>
          )}
        </div>
      )}
    </article>
  );
}
