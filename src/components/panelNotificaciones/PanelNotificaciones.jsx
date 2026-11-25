import { useState } from "react";
import Notificacion from "./Notificacion";
import { ROLES } from "../../utils/roles.js";

import { campanaIcono, cerrarIcono } from "../../assets/icons";

const filtros = [
  { id: "todas", texto: "Todas", cumple: () => true },
  { id: "noLeidas", texto: "No leídas", cumple: (n) => !n.leida },
  { id: "leidas", texto: "Leídas", cumple: (n) => n.leida },
];

function destinoNotificacion(rol, tipo) {
  switch (tipo?.toLowerCase()) {
    case "cuenta": return rol === ROLES.SUPERADMIN ? ["/super-admin", "Ver cuentas"] : null;
    case "mantenimiento": return [rol === ROLES.INQUILINO ? "/reportes" : "/reportes-agente", "Ver reportes"];
    case "mensaje": return ["/chat", "Ir al chat"];
    case "visita": return ["/agenda", "Ver agenda"];
    case "contrato": return [
      { [ROLES.PROPIETARIO]: "/mis-propiedades", [ROLES.INQUILINO]: "/dashboard" }[rol] ?? "/propiedades",
      "Ver alquileres y propiedades",
    ];
    case "pago": return [
      { [ROLES.PROPIETARIO]: "/cobros", [ROLES.INQUILINO]: "/pagos" }[rol] ?? "/pagos-cobros",
      rol === ROLES.PROPIETARIO ? "Ver cobros" : "Ver pagos",
    ];
    default: return null;
  }
}

export default function PanelNotificaciones({
  rol,
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

  const visibles = notificaciones.filter(filtros.find((f) => f.id === filtro).cumple);

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
              destino={destinoNotificacion(rol, notificacion.tipo)}
              onMarcarLeida={() => onMarcarLeida?.(notificacion.id)}
              onNavegar={() => {
                if (!notificacion.leida) onMarcarLeida?.(notificacion.id);
                onCerrar?.();
              }}
            />
          ))
        )}
      </div>
    </section>
  );
}
