import { useRef } from 'react';

import './Skeleton.css';

import useCargaCompleta from '../../hooks/useCargaCompleta';

// Envuelve la raíz de cualquier vista: mientras cargan fuentes e imágenes,
// sus textos, imágenes, botones e inputs se muestran como skeleton.
//
// Uso:  <Skeleton as="main" className="Home" fondos={[fondoHero]}> ... </Skeleton>
//
// - data-sk           -> fuerza a un elemento a verse como bloque
// - data-sk-fondo     -> oculta su imagen de fondo mientras carga
// - className="Skeleton-no" -> excluye ese elemento y su contenido
export default function Skeleton({ as: Etiqueta = "div", className = "", fondos = [], children, ...props }) {
    const ref = useRef(null);
    const cargado = useCargaCompleta(ref, fondos);

    return (
        <Etiqueta
            ref={ref}
            className={`${className} ${cargado ? "" : "Skeleton"}`}
            aria-busy={!cargado}
            {...props}
        >
            {children}
        </Etiqueta>
    )
}
