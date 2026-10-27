import { useLayoutEffect, useRef, useState } from 'react';

import './PropertySearch.css';

import { FilterSelect } from '../index';

import ubicacionIcono from '../../assets/icons/location-dot-solid-full.svg';
import camaIcono from '../../assets/icons/bed-solid-full.svg';
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

export default function PropertySearch({ className = "" }) {
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
        <form className={`PropertySearch ${className}`} onSubmit={buscar} aria-label="Buscar propiedades">
            <div className='PropertySearch__pestanas' ref={pestanasRef}>
                {indicador && (
                    <span className='PropertySearch__indicador' style={indicador} aria-hidden="true"></span>
                )}

                {operaciones.map((nombre) => (
                    <button
                        key={nombre}
                        type="button"
                        ref={(boton) => { botonesRef.current[nombre] = boton; }}
                        className={`PropertySearch__pestana ${operacion === nombre ? "PropertySearch__pestana--activa" : ""}`}
                        aria-pressed={operacion === nombre}
                        onClick={() => elegir(nombre)}
                    >
                        {nombre}
                    </button>
                ))}
            </div>

            {/* key: al cambiar de operación la fila se vuelve a montar y entra deslizándose */}
            <div key={operacion} className={`PropertySearch__campos PropertySearch__campos--desde-${direccion}`}>
                {filtrosDe(operacion).map((filtro) => (
                    <FilterSelect key={filtro.id} {...filtro} />
                ))}

                <button type="submit" className='PropertySearch__boton'>Buscar</button>
            </div>
        </form>
    )
}
