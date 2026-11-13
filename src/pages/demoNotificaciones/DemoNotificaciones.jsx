import { useState } from "react";

import { CapaModal, PanelNotificaciones } from "../../components";

import "./DemoNotificaciones.css";

// Página solo de desarrollo (ruta /demo/notificaciones) para probar el panel
// TODO: reemplazar por los datos de la API
import notificaciones from "../../data/notifications";

export default function DemoNotificaciones() {
  const [abierto, setAbierto] = useState(true);

  return (
    <main className="DemoNotificaciones">
      <button type="button" className="DemoNotificaciones__boton" onClick={() => setAbierto(true)}>
        Ver notificaciones
      </button>

      <CapaModal
        abierto={abierto}
        onCerrar={() => setAbierto(false)}
        posicion="derecha"
        etiqueta="Notificationes"
      >
        <PanelNotificaciones notificaciones={notificaciones} onCerrar={() => setAbierto(false)} />
      </CapaModal>
    </main>
  );
}
