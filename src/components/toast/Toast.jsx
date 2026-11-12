import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import {
  angleDownIcon,
  checkToastIcon,
  clockToastIcon,
  infoToastIcon,
  warningToastIcon,
  xIcon,
  xToastIcon,
} from "../../assets/icons";
import "./Toast.css";

const iconos = {
  exito: checkToastIcon,
  advertencia: warningToastIcon,
  error: xToastIcon,
  info: infoToastIcon,
  recordatorio: clockToastIcon,
};

// Línea de tiempo en milisegundos desde que aparece
const EXPANDIR = 500;
const CONTRAER = 5000;
const SALIR = CONTRAER + 3000;
const ANIMACION = 400;
const COLAPSO = 250;

// Fases: "entrando" → "abierto" → "contraido" → "saliendo"
export default function Toast({ tipo = "exito", titulo, mensaje, accion, onFin }) {
  const [fase, setFase] = useState("entrando");
  const timers = useRef([]);
  const alTerminar = useRef(onFin);

  useEffect(() => {
    alTerminar.current = onFin;
  });

  function programar(pasos) {
    timers.current.forEach(clearTimeout);
    timers.current = pasos.map(([espera, siguiente]) =>
      setTimeout(() => (siguiente === "fin" ? alTerminar.current?.() : setFase(siguiente)), espera),
    );
  }

  useEffect(() => {
    programar([
      [EXPANDIR, "abierto"],
      [CONTRAER, "contraido"],
      [SALIR, "saliendo"],
      [SALIR + ANIMACION + COLAPSO, "fin"],
    ]);
    return () => timers.current.forEach(clearTimeout);
  }, []);

  function cerrar() {
    programar([
      [0, "contraido"],
      [ANIMACION, "saliendo"],
      [ANIMACION * 2 + COLAPSO, "fin"],
    ]);
  }

  return (
    <div className={`Toast Toast--${tipo} Toast--${fase}`} role={tipo === "error" ? "alert" : "status"}>
      <div className="Toast__fila">
        <div className="Toast__modulo">
          <span className="Toast__icono" aria-hidden="true">
            <img className="Toast__simbolo" src={iconos[tipo] ?? iconos.exito} alt="" />
          </span>
          <div className="Toast__cuerpo" aria-hidden={fase !== "abierto"}>
            <div className="Toast__contenido">
              <p className="Toast__titulo">{titulo}</p>
              {mensaje && <p className="Toast__mensaje">{mensaje}</p>}
              {accion?.href && (
                <Link className="Toast__accion" href={accion.href} tabIndex={fase === "abierto" ? 0 : -1}>
                  {accion.texto}
                  <span className="Toast__flecha" style={{ "--toast-simbolo": `url("${angleDownIcon}")` }} />
                </Link>
              )}
              {accion?.onClick && (
                <button className="Toast__accion" type="button" onClick={accion.onClick} tabIndex={fase === "abierto" ? 0 : -1}>
                  {accion.texto}
                  <span className="Toast__flecha" style={{ "--toast-simbolo": `url("${angleDownIcon}")` }} />
                </button>
              )}
            </div>
            <button className="Toast__cerrar" type="button" aria-label="Cerrar notificación" onClick={cerrar} tabIndex={fase === "abierto" ? 0 : -1}>
              <span className="Toast__x" style={{ "--toast-simbolo": `url("${xIcon}")` }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
