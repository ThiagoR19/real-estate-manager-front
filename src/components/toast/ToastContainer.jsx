import { useSyncExternalStore } from "react";
import Toast from "./Toast";
import { leerToasts, quitarToast, suscribirToasts } from "./toastStore";
import "./Toast.css";

// Se monta una sola vez (por ejemplo en App.jsx) y muestra los toasts apilados abajo a la derecha
export default function ToastContainer() {
  const toasts = useSyncExternalStore(suscribirToasts, leerToasts);

  return (
    <section className="ToastContainer" aria-label="Notificaciones" aria-live="polite">
      {toasts.map(({ id, ...toast }) => (
        <Toast key={id} {...toast} onFin={() => quitarToast(id)} />
      ))}
    </section>
  );
}
