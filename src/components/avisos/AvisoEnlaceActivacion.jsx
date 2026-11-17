import { useEffect, useRef, useState } from "react";
import "./AvisoEnlaceActivacion.css";

const TIEMPO_CIERRE = 260;

export default function AvisoEnlaceActivacion({ message, url, onDismiss }) {
  const [closing, setClosing] = useState(false);
  const [copyError, setCopyError] = useState("");
  const timeoutRef = useRef(null);

  useEffect(() => {
    setClosing(false);
    setCopyError("");
    window.clearTimeout(timeoutRef.current);
  }, [message, url]);

  useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopyError("");
      setClosing(true);
      timeoutRef.current = window.setTimeout(onDismiss, TIEMPO_CIERRE);
    } catch {
      setCopyError("No se pudo copiar el enlace. Seleccioná el campo y copialo manualmente.");
    }
  }

  return (
    <div
      className={`aviso-enlace-activacion${closing ? " aviso-enlace-activacion--closing" : ""}`}
      role="status"
    >
      <p className="aviso-enlace-activacion__message">{message}</p>
      {url && (
        <div className="aviso-enlace-activacion__controls">
          <input
            aria-label="Enlace de activación"
            readOnly
            value={url}
            onFocus={(event) => event.currentTarget.select()}
          />
          <button type="button" onClick={copyLink} disabled={closing}>
            Copiar enlace
          </button>
        </div>
      )}
      {copyError && <p className="aviso-enlace-activacion__error">{copyError}</p>}
    </div>
  );
}
