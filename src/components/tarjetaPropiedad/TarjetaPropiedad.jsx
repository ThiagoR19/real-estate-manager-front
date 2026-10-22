import './TarjetaPropiedad.css';

import ubicacionIcono from '../../assets/icons/ubiIcon.svg';
import camaIcono from '../../assets/icons/camaIcon.svg';
import banoIcono from '../../assets/icons/duchaIcon.svg';
import superficieIcono from '../../assets/icons/medidaIcon.svg';
import ojoIcono from '../../assets/icons/ojoVistoIcon.svg';

export default function TarjetaPropiedad({ propiedad, className = "" }) {
    const { titulo, direccion, imagen, dormitorios, banos, superficie, operacion } = propiedad;

    const caracteristicas = [
        { icono: camaIcono, valor: dormitorios, nombre: "Dormitorios" },
        { icono: banoIcono, valor: banos, nombre: "Baños" },
        { icono: superficieIcono, valor: `${superficie} m²`, nombre: "Superficie" }
    ];

    return (
        <article className={`TarjetaPropiedad ${className}`}>
            <img className='TarjetaPropiedad__imagen' src={imagen} alt={titulo} />

            <div className='TarjetaPropiedad__cuerpo'>
                <h3 className='TarjetaPropiedad__titulo'>{titulo}</h3>

                <p className='TarjetaPropiedad__direccion'>
                    <span className='TarjetaPropiedad__icono'><img src={ubicacionIcono} alt="" /></span>
                    {direccion}
                </p>

                <div className='TarjetaPropiedad__datos'>
                    <ul className='TarjetaPropiedad__caracteristicas'>
                        {caracteristicas.map(({ icono, valor, nombre }) => (
                            <li key={nombre} className='TarjetaPropiedad__caracteristica' title={nombre}>
                                <span className='TarjetaPropiedad__icono'><img src={icono} alt={nombre} /></span>
                                {valor}
                            </li>
                        ))}
                    </ul>

                    <span className={`TarjetaPropiedad__operacion TarjetaPropiedad__operacion--${operacion.toLowerCase()}`}>
                        {operacion}
                    </span>
                </div>

                <a href="#" className='TarjetaPropiedad__detalle'>
                    <span className='TarjetaPropiedad__detalle-icono'><img src={ojoIcono} alt="" /></span>
                    Ver detalle
                </a>
            </div>
        </article>
    )
}
