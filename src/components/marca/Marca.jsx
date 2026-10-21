import './Marca.css';

import logoIcono from '../../assets/icons/agiLogo.svg';

export default function Marca({ oscura = false, className = "" }) {
    return (
        <div className={`Marca ${oscura ? "Marca--oscura" : ""} ${className}`}>
            <span className='Marca__logo'><img src={logoIcono} alt="Logo AGI" /></span>

            <span className='Marca__nombre'>AGI</span>

            <span className='Marca__sub'>Propiedades</span>
        </div>
    )
}
