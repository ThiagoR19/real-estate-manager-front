import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./AvisoEnlaceActivacion.css";

const TIEMPO_CIERRE = 260;
const TIEMPO_VISIBLE = 2000;

export default function AvisoEnlaceActivacion({ message, url, onDismiss }) {
  return <AvisoEnlaceActivacionContenido key={`${message}:${url}`} message={message} url={url} onDismiss={onDismiss} />;
}

function AvisoEnlaceActivacionContenido({ message, url, onDismiss }) {
  const [closing, setClosing] = useState(false);
  const [copyError, setCopyError] = useState("");
  const timeoutRef = useRef(null);
  const autoCloseRef = useRef(null);
  const closingRef = useRef(false);
  const onDismissRef = useRef(onDismiss);

  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  function close() {
    if (closingRef.current) return;
    closingRef.current = true;
    window.clearTimeout(autoCloseRef.current);
    setClosing(true);
    timeoutRef.current = window.setTimeout(() => onDismissRef.current(), TIEMPO_CIERRE);
  }

  useEffect(() => {
    autoCloseRef.current = window.setTimeout(() => {
      closingRef.current = true;
      setClosing(true);
      timeoutRef.current = window.setTimeout(() => onDismissRef.current(), TIEMPO_CIERRE);
    }, TIEMPO_VISIBLE);
    return () => {
      window.clearTimeout(autoCloseRef.current);
      window.clearTimeout(timeoutRef.current);
    };
  }, []);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopyError("");
      close();
    } catch {
      setCopyError("No se pudo copiar el enlace. Seleccioná el campo y copialo manualmente.");
    }
  }

  const container = document.getElementById("contenedor-avisos");
  if (!container) return null;

  return createPortal(
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
    </div>,
    container,
  );
}
