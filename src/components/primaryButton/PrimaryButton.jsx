import './PrimaryButton.css';

import flechaIcono from '../../assets/icons/loginArrow.svg';
import avionIcono from '../../assets/icons/paper-plane-regular-full.svg';
import checkIcono from '../../assets/icons/check-solid-full.svg';

// estado: "inactivo" | "enviando" | "listo"
export default function PrimaryButton({
    texto,
    textoEnviando = "Enviando",
    textoListo = "¡Listo!",
    estado = "inactivo",
    tipo = "submit",
    className = ""
}) {
    const ocupado = estado !== "inactivo";

    return (
        <button
            type={tipo}
            className={`PrimaryButton PrimaryButton--${estado} ${className}`}
            disabled={ocupado}
            aria-busy={estado === "enviando"}
        >
            <span className='PrimaryButton__progreso'></span>

            <span className='PrimaryButton__capa PrimaryButton__capa--inactivo' aria-hidden={ocupado}>
                {texto}
                <span className='PrimaryButton__icono'><img src={flechaIcono} alt="" /></span>
            </span>

            <span className='PrimaryButton__capa PrimaryButton__capa--enviando' aria-hidden={estado !== "enviando"}>
                <span className='PrimaryButton__avion'><img src={avionIcono} alt="" /></span>
                {textoEnviando}
                <span className='PrimaryButton__puntos'>
                    <span></span>
                    <span></span>
                    <span></span>
                </span>
            </span>

            <span className='PrimaryButton__capa PrimaryButton__capa--listo' aria-hidden={estado !== "listo"}>
                <span className='PrimaryButton__check'><img src={checkIcono} alt="" /></span>
                {textoListo}
            </span>
        </button>
    )
}
