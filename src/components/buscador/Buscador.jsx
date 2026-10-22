import { useLayoutEffect, useRef, useState } from 'react';

import './Buscador.css';

import SelectorFiltro from '../selectorFiltro/SelectorFiltro';

import ubicacionIcono from '../../assets/location-dot-solid-full.svg';
import camaIcono from '../../assets/bed-solid-full.svg';
import monedasIcono from '../../assets/icons/monedas.svg';

const operaciones = ["Alquilar", "Comprar"];

const presupuestos = {
    Alquilar: ["Hasta $500.000 / mes", "$500.000 a $1.000.000 / mes", "Más de $1.000.000 / mes"],
    Comprar: ["Hasta USD 100.000", "USD 100.000 a 250.000", "Más de USD 250.000"]
};

const filtrosDe = (operacion) => [
    { id: "buscador-ubicacion", etiqueta: "Ubicación", icono: ubicacionIcono, opciones: ["CABA", "Belgrano", "Palermo", "Recoleta", "Núñez"] },
    { id: "buscador-habitaciones", etiqueta: "Habitaciones", icono: camaIcono, opciones: ["1", "2", "3", "4 o más"] },
    { id: "buscador-presupuesto", etiqueta: "Presupuesto", icono: monedasIcono, opciones: presupuestos[operacion] }
];

export default function Buscador({ className = "" }) {
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

        setDireccion(operaciones.indexOf(nombre) > operaciones.indexOf(operacion) ? "derecha" : "izquierda");
        setOperacion(nombre);
    };

    const buscar = (e) => {
        e.preventDefault();
    };

    return (
        <form className={`Buscador ${className}`} onSubmit={buscar} aria-label="Buscar propiedades">
            <div className='Buscador__pestanas' ref={pestanasRef}>
                {indicador && (
                    <span className='Buscador__indicador' style={indicador} aria-hidden="true"></span>
                )}

                {operaciones.map((nombre) => (
                    <button
                        key={nombre}
                        type="button"
                        ref={(boton) => { botonesRef.current[nombre] = boton; }}
                        className={`Buscador__pestana ${operacion === nombre ? "Buscador__pestana--activa" : ""}`}
                        aria-pressed={operacion === nombre}
                        onClick={() => elegir(nombre)}
                    >
                        {nombre}
                    </button>
                ))}
            </div>

            {/* key: al cambiar de operación la fila se vuelve a montar y entra deslizándose */}
            <div key={operacion} className={`Buscador__campos Buscador__campos--desde-${direccion}`}>
                {filtrosDe(operacion).map((filtro) => (
                    <SelectorFiltro key={filtro.id} {...filtro} />
                ))}

                <button type="submit" className='Buscador__boton'>Buscar</button>
            </div>
        </form>
    )
}
