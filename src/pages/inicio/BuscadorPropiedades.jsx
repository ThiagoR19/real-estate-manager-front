import { useLayoutEffect, useRef, useState } from "react";
import { useLocation } from "wouter";

import "./BuscadorPropiedades.css";

import FiltroSelect from "./FiltroSelect";

import ubicacionIcono from "../../assets/icons/location-dot-solid-full.svg";
import camaIcono from "../../assets/icons/bed-solid-full.svg";
import monedasIcono from "../../assets/icons/monedas.svg";

const operaciones = ["Alquilar", "Comprar"];

// valor del presupuesto: "mínimo-máximo" (sin máximo = "mínimo-")
const presupuestos = {
  Alquilar: [
    { texto: "Hasta $500.000 / mes", valor: "0-500000" },
    { texto: "$500.000 a $1.000.000 / mes", valor: "500000-1000000" },
    { texto: "Más de $1.000.000 / mes", valor: "1000000-" },
  ],
  Comprar: [
    { texto: "Hasta USD 100.000", valor: "0-100000" },
    { texto: "USD 100.000 a 250.000", valor: "100000-250000" },
    { texto: "Más de USD 250.000", valor: "250000-" },
  ],
};

const monedas = { Alquilar: "ARS", Comprar: "USD" };

const filtrosDe = (operacion) => [
  {
    id: "buscador-ubicacion",
    name: "ubicacion",
    etiqueta: "Ubicación",
    icono: ubicacionIcono,
    opciones: ["CABA", "Belgrano", "Palermo", "Recoleta", "Núñez"],
  },
  {
    id: "buscador-habitaciones",
    name: "habitaciones",
    etiqueta: "Habitaciones",
    icono: camaIcono,
    opciones: ["1", "2", "3", { texto: "4 o más", valor: "4+" }],
  },
  {
    id: "buscador-presupuesto",
    name: "presupuesto",
    etiqueta: "Presupuesto",
    icono: monedasIcono,
    opciones: presupuestos[operacion],
  },
];

// Arma los query params de la búsqueda: solo agrega lo que se eligió
function paramsDeBusqueda(operacion, formulario) {
  const datos = new FormData(formulario);
  const params = new URLSearchParams({ filter: operacion === "Alquilar" ? "rent" : "buy" });

  const ubicacion = datos.get("ubicacion");
  const habitaciones = datos.get("habitaciones");
  const presupuesto = datos.get("presupuesto");

  if (ubicacion) params.set("ubicacion", ubicacion);
  if (habitaciones) params.set("habitaciones", habitaciones);
  if (presupuesto) {
    const [minimo, maximo] = presupuesto.split("-");
    params.set("precioMin", minimo);
    if (maximo) params.set("precioMax", maximo);
    params.set("moneda", monedas[operacion]);
  }

  return params.toString();
}

export default function BuscadorPropiedades({ className = "" }) {
  const [, navegar] = useLocation();
  const [operacion, setOperacion] = useState(operaciones[0]);
  const [direccion, setDireccion] = useState("derecha");
  
  // null hasta la primera medición: así no se anima desde 0 al cargar
  const [indicador, setIndicador] = useState(null);

  const pestanasRef = useRef(null);
  const botonesRef = useRef({});

  // El indicador se mide sobre la pestaña activa (sirve para cualquier ancho de pantalla)
  useLayoutEffect(() => {
    const medir = () => {
      const boton = botonesRef.current[operacion];
      if (boton) setIndicador({ left: boton.offsetLeft, width: boton.offsetWidth });
    };

    medir();

    const observador = new ResizeObserver(medir);
    observador.observe(pestanasRef.current);

    return () => observador.disconnect();
  }, [operacion]);

  const elegir = (nombre) => {
    if (nombre === operacion) return;

    setDireccion(
      operaciones.indexOf(nombre) > operaciones.indexOf(operacion) ? "derecha" : "izquierda",
    );
    setOperacion(nombre);
  };

  const buscar = (e) => {
    e.preventDefault();
    navegar(`/propiedades-publicas?${paramsDeBusqueda(operacion, e.currentTarget)}`);
  };

  return (
    <form
      className={`BuscadorPropiedades ${className}`}
      onSubmit={buscar}
      aria-label="Buscar propiedades"
    >
      <div className="BuscadorPropiedades__pestanas" ref={pestanasRef}>
        {indicador && (
          <span className="BuscadorPropiedades__indicador" style={indicador} aria-hidden="true"></span>
        )}

        {operaciones.map((nombre) => (
          <button
            key={nombre}
            type="button"
            ref={(boton) => {botonesRef.current[nombre] = boton;}}
            className={`BuscadorPropiedades__pestana ${operacion === nombre ? "BuscadorPropiedades__pestana--activa" : ""}`}
            aria-pressed={operacion === nombre}
            onClick={() => elegir(nombre)}
          >
            {nombre}
          </button>
        ))}
      </div>

      <div
        key={operacion}
        className={`BuscadorPropiedades__campos BuscadorPropiedades__campos--desde-${direccion}`}
      >
        {filtrosDe(operacion).map((filtro) => (
          <FiltroSelect key={filtro.id} {...filtro} />
        ))}

        <button type="submit" className="BuscadorPropiedades__boton">
          Buscar
        </button>
      </div>
    </form>
  );
}
