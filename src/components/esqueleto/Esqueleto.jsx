import { useRef } from 'react';

import './Esqueleto.css';

import useCargaCompleta from '../../hooks/useCargaCompleta';

// Envuelve la raíz de cualquier vista: mientras cargan fuentes e imágenes,
// sus textos, imágenes, botones e inputs se muestran como skeleton.
//
// Uso:  <Esqueleto as="main" className="Home" fondos={[fondoHero]}> ... </Esqueleto>
//
// - data-sk           -> fuerza a un elemento a verse como bloque
// - data-sk-fondo     -> oculta su imagen de fondo mientras carga
// - className="Esqueleto-no" -> excluye ese elemento y su contenido
export default function Esqueleto({ as: Etiqueta = "div", className = "", fondos = [], children, ...props }) {
    const ref = useRef(null);
    const cargado = useCargaCompleta(ref, fondos);

    return (
        <Etiqueta
            ref={ref}
            className={`${className} ${cargado ? "" : "Esqueleto"}`}
            aria-busy={!cargado}
            {...props}
        >
            {children}
        </Etiqueta>
    )
}
