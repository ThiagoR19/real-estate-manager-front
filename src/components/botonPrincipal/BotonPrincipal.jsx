import './BotonPrincipal.css';

import flechaIcono from '../../assets/icons/loginArrow.svg';

export default function BotonPrincipal({ texto, tipo = "submit", className = "" }) {
    return (
        <button type={tipo} className={`BotonPrincipal ${className}`}>
            {texto}
            <span className='BotonPrincipal__icono'><img src={flechaIcono} alt="" /></span>
        </button>
    )
}
