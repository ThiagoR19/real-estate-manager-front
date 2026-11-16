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
import "./Aviso.css";

const iconos = {
  exito: checkToastIcon,
  advertencia: warningToastIcon,
  error: xToastIcon,
  info: infoToastIcon,
  recordatorio: clockToastIcon,
};


const EXPANDIR = 500;
const CONTRAER = 5000;
const SALIR = CONTRAER + 3000;
const ANIMACION = 400;
const COLAPSO = 250;


export default function Aviso({ tipo = "exito", titulo, mensaje, accion, onFin }) {
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
    <div className={`Aviso Aviso--${tipo} Aviso--${fase}`} role={tipo === "error" ? "alert" : "status"}>
      <div className="Aviso__fila">
        <div className="Aviso__modulo">
          <span className="Aviso__icono" aria-hidden="true">
            <img className="Aviso__simbolo" src={iconos[tipo] ?? iconos.exito} alt="" />
          </span>
          <div className="Aviso__cuerpo" aria-hidden={fase !== "abierto"}>
            <div className="Aviso__contenido">
              <p className="Aviso__titulo">{titulo}</p>
              {mensaje && <p className="Aviso__mensaje">{mensaje}</p>}
              {accion?.href && (
                <Link className="Aviso__accion" href={accion.href} tabIndex={fase === "abierto" ? 0 : -1}>
                  {accion.texto}
                  <span className="Aviso__flecha" style={{ "--aviso-simbolo": `url("${angleDownIcon}")` }} />
                </Link>
              )}
              {accion?.onClick && (
                <button className="Aviso__accion" type="button" onClick={accion.onClick} tabIndex={fase === "abierto" ? 0 : -1}>
                  {accion.texto}
                  <span className="Aviso__flecha" style={{ "--aviso-simbolo": `url("${angleDownIcon}")` }} />
                </button>
              )}
            </div>
            <button className="Aviso__cerrar" type="button" aria-label="Cerrar notificación" onClick={cerrar} tabIndex={fase === "abierto" ? 0 : -1}>
              <span className="Aviso__x" style={{ "--aviso-simbolo": `url("${xIcon}")` }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
