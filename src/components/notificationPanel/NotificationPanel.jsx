import { useState } from "react";

import "./NotificationPanel.css";

import Notification from "./Notification";

import campanaIcono from "../../assets/icons/campanaNoti.svg";
import cerrarIcono from "../../assets/icons/closeNotis.svg";

const filtros = [
  { id: "todas", texto: "Todas", cumple: () => true },
  { id: "noLeidas", texto: "No leídas", cumple: (n) => !n.leida },
  { id: "leidas", texto: "Leídas", cumple: (n) => n.leida },
];

export default function NotificationPanel({
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
  // id → si estaba sin leer al expandirla (esas se ven en azul oscuro; las ya leídas siguen en gris)
  const [expandidas, setExpandidas] = useState(() => new Map());

  const visibles = notificaciones.filter(filtros.find((f) => f.id === filtro).cumple);

  // Al expandir una notificación pasa a estar leída
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
    <section className={`NotificationPanel ${className}`} aria-labelledby="notificaciones-titulo">
      <header className="NotificationPanel__encabezado">
        <h2 className="NotificationPanel__titulo" id="notificaciones-titulo">
          <span className="NotificationPanel__campana">
            <img src={campanaIcono} alt="" />
          </span>
          Notificaciones
        </h2>

        <button
          type="button"
          className="NotificationPanel__cerrar"
          onClick={onCerrar}
          aria-label="Cerrar notificaciones"
        >
          <img src={cerrarIcono} alt="" />
        </button>
      </header>

      <button
        type="button"
        className="NotificationPanel__marcar"
        onClick={onMarcarTodas}
        disabled={!notificaciones.some((item) => !item.leida)}
      >
        Marcar todo como leído
      </button>

      {error && (
        <p className="NotificationPanel__error" role="alert">
          {error} {onReintentar && <button type="button" onClick={onReintentar}>Reintentar</button>}
        </p>
      )}

      <div className="NotificationPanel__filtros" role="group" aria-label="Filtrar notificaciones">
        {filtros.map(({ id, texto, cumple }) => (
          <button
            key={id}
            type="button"
            className={`NotificationPanel__filtro ${filtro === id ? "NotificationPanel__filtro--activo" : ""}`}
            aria-pressed={filtro === id}
            onClick={() => setFiltro(id)}
          >
            {texto}
            <span className="NotificationPanel__contador">
              {notificaciones.filter(cumple).length}
            </span>
          </button>
        ))}
      </div>

      <div className="NotificationPanel__lista">
        {visibles.length === 0 ? (
          <p className="NotificationPanel__vacio">
            {cargando ? "Cargando notificaciones..." : error ? "No se pudieron cargar las notificaciones." : "No hay notificaciones para mostrar"}
          </p>
        ) : (
          visibles.map((notificacion) => (
            <Notification
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
