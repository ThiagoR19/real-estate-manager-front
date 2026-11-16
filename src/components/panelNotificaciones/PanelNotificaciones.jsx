import { useState } from "react";

import "./PanelNotificaciones.css";

import Notificacion from "./Notificacion";

import campanaIcono from "../../assets/icons/campanaNoti.svg";
import cerrarIcono from "../../assets/icons/closeNotis.svg";

const filtros = [
  { id: "todas", texto: "Todas", cumple: () => true },
  { id: "noLeidas", texto: "No leídas", cumple: (n) => !n.leida },
  { id: "leidas", texto: "Leídas", cumple: (n) => n.leida },
];

export default function PanelNotificaciones({
  notificaciones = [],
  cargando = false,
  error = "",
  onReintentar,
  onMarcarLeida,
  onMarcarTodas,
  onCerrar,
  className = "",
}) {
  const [filtro, setFiltro] = useState("todas");

  const [expandidas, setExpandidas] = useState(() => new Map());

  const visibles = notificaciones.filter(filtros.find((f) => f.id === filtro).cumple);


  const alternar = (id) => {
    const abrir = !expandidas.has(id);
    const sinLeer = !notificaciones.find((n) => n.id === id)?.leida;

    setExpandidas((actuales) => {
      const nuevas = new Map(actuales);
      abrir ? nuevas.set(id, sinLeer) : nuevas.delete(id);
      return nuevas;
    });

    if (abrir && sinLeer) onMarcarLeida?.(id);
  };

  return (
    <section className={`PanelNotificaciones ${className}`} aria-labelledby="notificaciones-titulo">
      <header className="PanelNotificaciones__encabezado">
        <h2 className="PanelNotificaciones__titulo" id="notificaciones-titulo">
          <span className="PanelNotificaciones__campana">
            <img src={campanaIcono} alt="" />
          </span>
          Notificaciones
        </h2>

        <button
          type="button"
          className="PanelNotificaciones__cerrar"
          onClick={onCerrar}
          aria-label="Cerrar notificaciones"
        >
          <img src={cerrarIcono} alt="" />
        </button>
      </header>

      <button
        type="button"
        className="PanelNotificaciones__marcar"
        onClick={onMarcarTodas}
        disabled={!notificaciones.some((item) => !item.leida)}
      >
        Marcar todo como leído
      </button>

      {error && (
        <p className="PanelNotificaciones__error" role="alert">
          {error} {onReintentar && <button type="button" onClick={onReintentar}>Reintentar</button>}
        </p>
      )}

      <div className="PanelNotificaciones__filtros" role="group" aria-label="Filtrar notificaciones">
        {filtros.map(({ id, texto, cumple }) => (
          <button
            key={id}
            type="button"
            className={`PanelNotificaciones__filtro ${filtro === id ? "PanelNotificaciones__filtro--activo" : ""}`}
            aria-pressed={filtro === id}
            onClick={() => setFiltro(id)}
          >
            {texto}
            <span className="PanelNotificaciones__contador">
              {notificaciones.filter(cumple).length}
            </span>
          </button>
        ))}
      </div>

      <div className="PanelNotificaciones__lista">
        {visibles.length === 0 ? (
          <p className="PanelNotificaciones__vacio">
            {cargando ? "Cargando notificaciones..." : error ? "No se pudieron cargar las notificaciones." : "No hay notificaciones para mostrar"}
          </p>
        ) : (
          visibles.map((notificacion) => (
            <Notificacion
              key={notificacion.id}
              notificacion={notificacion}
              expandida={expandidas.has(notificacion.id)}
              destacada={expandidas.get(notificacion.id) === true}
              onAlternar={() => alternar(notificacion.id)}
            />
          ))
        )}
      </div>
    </section>
  );
}
