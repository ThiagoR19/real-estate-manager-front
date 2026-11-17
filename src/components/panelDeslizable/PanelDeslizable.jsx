import { useEffect, useId, useRef, useState } from "react";
import { angleDownIcon } from "../../assets/icons";
import "./PanelDeslizable.css";

const UMBRAL_ARRASTRE = 6;

export default function PanelDeslizable({
  etiqueta,
  children,
  ancho = "min(320px, 86vw)",
  alto = "auto",
  posicion = "50%",
  superior = "0px",
  abierto,
  onCambiar,
  className = "",
}) {
  const [abiertoInterno, setAbiertoInterno] = useState(false);
  const controlado = abierto !== undefined;
  const estaAbierto = controlado ? abierto : abiertoInterno;
  const [desplazamiento, setDesplazamiento] = useState(null);
  const panelRef = useRef(null);
  const arrastre = useRef(null);
  const ignorarClick = useRef(false);
  const id = useId();

  function cambiar(valor) {
    if (!controlado) setAbiertoInterno(valor);
    onCambiar?.(valor);
  }

  useEffect(() => {
    if (!estaAbierto) return undefined;
    const cerrarConEscape = (evento) => {
      if (evento.key === "Escape") cambiar(false);
    };
    document.addEventListener("keydown", cerrarConEscape);
    return () => document.removeEventListener("keydown", cerrarConEscape);
  });

  function alPresionar(evento) {
    if (evento.button !== undefined && evento.button !== 0) return;
    ignorarClick.current = false;
    arrastre.current = {
      inicio: evento.clientX,
      ancho: panelRef.current?.offsetWidth ?? 0,
      movido: false,
    };
    evento.currentTarget.setPointerCapture?.(evento.pointerId);
  }

  function alMover(evento) {
    const datos = arrastre.current;
    if (!datos) return;
    const delta = evento.clientX - datos.inicio;
    if (!datos.movido && Math.abs(delta) < UMBRAL_ARRASTRE) return;
    datos.movido = true;
    const base = estaAbierto ? 0 : -datos.ancho;
    setDesplazamiento(Math.min(0, Math.max(-datos.ancho, base + delta)));
  }

  function alSoltar() {
    const datos = arrastre.current;
    arrastre.current = null;
    if (!datos?.movido) return;
    ignorarClick.current = true;
    setTimeout(() => {
      ignorarClick.current = false;
    }, 0);
    const posicionFinal = desplazamiento ?? (estaAbierto ? 0 : -datos.ancho);
    setDesplazamiento(null);
    cambiar(posicionFinal > -datos.ancho / 2);
  }

  function alHacerClick() {
    if (ignorarClick.current) {
      ignorarClick.current = false;
      return;
    }
    cambiar(!estaAbierto);
  }

  function alCancelar() {
    arrastre.current = null;
    setDesplazamiento(null);
  }

  const arrastrando = desplazamiento !== null;
  const estilo = {
    "--panel-deslizable-ancho": ancho,
    "--panel-deslizable-alto": alto,
    "--panel-deslizable-posicion": posicion,
    "--panel-deslizable-superior": superior,
    ...(arrastrando ? { transform: `translateX(${desplazamiento}px)` } : {}),
  };

  return (
    <>
      {estaAbierto && (
        <button
          className="panel-deslizable__fondo"
          type="button"
          tabIndex={-1}
          aria-label={`Cerrar ${etiqueta}`}
          onClick={() => cambiar(false)}
        />
      )}
      <div
        className={`panel-deslizable${alto === "auto" ? " panel-deslizable--completo" : ""}${estaAbierto ? " is-open" : ""}${arrastrando ? " is-dragging" : ""} ${className}`.trim()}
        style={estilo}
        ref={panelRef}
      >
        <aside
          className="panel-deslizable__contenido"
          id={id}
          aria-label={etiqueta}
          aria-hidden={!estaAbierto && !arrastrando}
          inert={!estaAbierto && !arrastrando}
        >
          {children}
        </aside>
        <button
          className="panel-deslizable__pestana"
          type="button"
          aria-label={estaAbierto ? `Cerrar ${etiqueta}` : `Abrir ${etiqueta}`}
          aria-expanded={estaAbierto}
          aria-controls={id}
          onPointerDown={alPresionar}
          onPointerMove={alMover}
          onPointerUp={alSoltar}
          onPointerCancel={alCancelar}
          onClick={alHacerClick}
        >
          <img src={angleDownIcon} alt="" aria-hidden="true" />
        </button>
      </div>
    </>
  );
}
