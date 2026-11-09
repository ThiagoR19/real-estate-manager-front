import { useState } from "react";

import './TextField.css';

import ojoIcono from '../../assets/icons/loginEye.svg';
import ojoTachadoIcono from '../../assets/icons/loginLockEye.svg';

export default function TextField({
    id,
    label,
    tipo = "text",
    placeholder,
    icono,
    autoComplete,
    conOjo = false,
    className = "",
    children
}) {
    const [mostrar, setMostrar] = useState(false);

    return (
        <div className={`TextField ${className}`}>
            <label htmlFor={id} className='TextField__label'>{label}</label>

            <div className='TextField__contenedor'>
                <span className='TextField__icono'><img src={icono} alt="" /></span>

                <input
                    id={id}
                    name={id}
                    type={conOjo && mostrar ? "text" : tipo}
                    className={`TextField__input ${conOjo ? "TextField__input--ojo" : ""}`}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                />

                {conOjo && (
                    <button
                        type="button"
                        className='TextField__ojo'
                        onClick={() => setMostrar(!mostrar)}
                        aria-label={mostrar ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                        <img src={mostrar ? ojoTachadoIcono : ojoIcono} alt="" />
                    </button>
                )}
            </div>

            {children}
        </div>
    )
}
