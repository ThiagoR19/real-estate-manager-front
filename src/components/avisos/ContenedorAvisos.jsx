import { useSyncExternalStore } from "react";
import Aviso from "./Aviso";
import { leerAvisos, quitarAviso, suscribirAvisos } from "./almacenAvisos";
import "./Aviso.css";

// Se monta una sola vez (por ejemplo en App.jsx) y muestra los avisos apilados abajo a la derecha
export default function ContenedorAvisos() {
  const avisos = useSyncExternalStore(suscribirAvisos, leerAvisos);

  return (
    <section className="ContenedorAvisos" aria-label="Notificaciones" aria-live="polite">
      {avisos.map(({ id, ...aviso }) => (
        <Aviso key={id} {...aviso} onFin={() => quitarAviso(id)} />
      ))}
    </section>
  );
}
