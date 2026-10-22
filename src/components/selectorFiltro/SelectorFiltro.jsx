import './SelectorFiltro.css';

import flechaIcono from '../../assets/angle-down-solid-full.svg';

export default function SelectorFiltro({ id, etiqueta, icono, opciones = [], className = "" }) {
    return (
        <div className={`SelectorFiltro ${className}`}>
            <span className='SelectorFiltro__icono'><img src={icono} alt="" /></span>

            <select id={id} className='SelectorFiltro__select' aria-label={etiqueta} defaultValue="">
                <option value="" disabled>{etiqueta}</option>
                {opciones.map((opcion) => (
                    <option key={opcion} value={opcion}>{opcion}</option>
                ))}
            </select>

            <span className='SelectorFiltro__flecha'><img src={flechaIcono} alt="" /></span>
        </div>
    )
}
